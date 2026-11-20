READ_ARTICLES_TOOL_NAME = "read_articles"
READ_ARTICLES_TOOL: dict[str, object] = {
    "type": "function",
    "function": {
        "name": READ_ARTICLES_TOOL_NAME,
        "description": (
            "Retrieve the original article text for the supplied article IDs. "
            "Call once with every ID from the current request."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "article_ids": {"type": "array", "items": {"type": "string"}},
            },
            "required": ["article_ids"],
        },
    },
}
