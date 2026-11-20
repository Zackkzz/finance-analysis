"""Read article text from public HTTPS publisher pages."""

import asyncio
import ipaddress
import json
import socket
import ssl
from html.parser import HTMLParser
from http.client import HTTPException, HTTPSConnection
from urllib.parse import urljoin, urlsplit

from finance_analysis.service.schemas import NewsContent

MAX_PAGE_BYTES = 2_000_000
MIN_ARTICLE_CHARS = 200
TLS_CONTEXT = ssl.create_default_context()


class PublicHTTPSConnection(HTTPSConnection):
    def connect(self) -> None:
        addresses = socket.getaddrinfo(
            self.host, 443, socket.AF_INET, socket.SOCK_STREAM
        )
        for *_, address in addresses:
            ip = ipaddress.ip_address(address[0])
            if not ip.is_global or ip.is_multicast:
                continue
            # Connect to the checked numeric IP. TLS still verifies the publisher name.
            connection = socket.create_connection(address, timeout=self.timeout)
            try:
                self.sock = TLS_CONTEXT.wrap_socket(
                    connection, server_hostname=self.host
                )
            except (OSError, ValueError):
                connection.close()
                raise
            return
        raise ValueError("Article host has no public IPv4 address")


class ArticlePage(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.article_depth = 0
        self.in_paragraph = False
        self.structured_data: list[str] | None = None
        self.paragraph: list[str] = []
        self.paragraphs: list[str] = []
        self.structured_bodies: list[str] = []
        self.restricted = False

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag == "article":
            self.article_depth += 1
        elif tag == "p" and self.article_depth:
            self.in_paragraph = True
            self.paragraph.clear()
        elif tag == "script" and dict(attrs).get("type") == "application/ld+json":
            self.structured_data = []

    def handle_data(self, data: str) -> None:
        if self.structured_data is not None:
            self.structured_data.append(data)
        elif self.in_paragraph:
            self.paragraph.append(data)

    def handle_endtag(self, tag: str) -> None:
        if tag == "article" and self.article_depth:
            self.article_depth -= 1
        elif tag == "p" and self.in_paragraph:
            self.in_paragraph = False
            paragraph = " ".join("".join(self.paragraph).split())
            if paragraph:
                self.paragraphs.append(paragraph)
        elif tag == "script" and self.structured_data is not None:
            data = self.structured_data
            self.structured_data = None
            try:
                self.read_metadata(json.loads("".join(data)))
            except (ValueError, RecursionError):
                pass

    def read_metadata(self, data: object) -> None:
        if isinstance(data, list):
            for value in data:
                self.read_metadata(value)
        elif isinstance(data, dict):
            if data.get("isAccessibleForFree") in (False, "false", "False"):
                self.restricted = True
            body = data.get("articleBody")
            if isinstance(body, str) and body.strip():
                self.structured_bodies.append(body.strip())
            self.read_metadata(data.get("@graph"))

    def text(self) -> str | None:
        if self.restricted:
            return None
        text = max(self.structured_bodies, key=len, default="")
        if len(text) < MIN_ARTICLE_CHARS:
            text = "\n\n".join(self.paragraphs)
        return text if len(text) >= MIN_ARTICLE_CHARS else None


def fetch_article_text(url: str) -> str | None:
    """Follow a short chain of public HTTPS redirects and extract readable text."""
    for _ in range(4):
        try:
            parsed = urlsplit(url)
            if (
                parsed.scheme != "https"
                or not parsed.hostname
                or parsed.username is not None
                or parsed.password is not None
                or parsed.port not in (None, 443)
            ):
                return None
            target = parsed.path or "/"
            if parsed.query:
                target += f"?{parsed.query}"
            connection = PublicHTTPSConnection(parsed.hostname, timeout=4)
            try:
                connection.request(
                    "GET",
                    target,
                    headers={
                        "Accept": "text/html, application/xhtml+xml",
                        "User-Agent": "MarketBrief/1.0",
                    },
                )
                with connection.getresponse() as response:
                    if response.status in (301, 302, 303, 307, 308):
                        location = response.getheader("Location")
                        if not location:
                            return None
                        url = urljoin(url, location)
                        continue
                    content_type = response.headers.get_content_type()
                    if response.status != 200 or content_type not in (
                        "text/html",
                        "application/xhtml+xml",
                    ):
                        return None
                    html = response.read(MAX_PAGE_BYTES + 1)
                    if len(html) > MAX_PAGE_BYTES:
                        return None
                    encoding = response.headers.get_content_charset() or "utf-8"
                    page = ArticlePage()
                    page.feed(html.decode(encoding, errors="replace"))
                    page.close()
                    return page.text()
            finally:
                connection.close()
        except (HTTPException, LookupError, OSError, ValueError):
            return None
    return None


async def load_article_texts(news: list[NewsContent]) -> dict[str, str]:
    """Fetch each distinct article concurrently, with a deadline for the batch."""
    urls = {article.id: article.canonicalUrl.url for article in news}
    tasks = {
        url: asyncio.create_task(asyncio.to_thread(fetch_article_text, url))
        for url in dict.fromkeys(urls.values())
    }
    if not tasks:
        return {}

    try:
        done, _ = await asyncio.wait(tasks.values(), timeout=10)
        results = {url: task.result() for url, task in tasks.items() if task in done}
        return {
            article_id: text
            for article_id, url in urls.items()
            if (text := results.get(url))
        }
    finally:
        for task in tasks.values():
            if not task.done():
                task.cancel()
