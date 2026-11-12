import asyncio
import json

from ollama import AsyncClient, RequestError, ResponseError
from finance_analysis.model.tools import STOCK_NEWS_TOOL
from finance_analysis.stocks.news import raw_extract
HOST = "http://localhost:11434"

MODEL = "qwen3.5:9b"

available_tools = {
    "raw_extract": raw_extract
}

messages = [
    {
        "role": "user",
        "content": "Get the latest news for WTC.AX and do a simple analysis for each result",
    }
]

async def main() -> None:
    try:
        client = AsyncClient(host=HOST)
        while True:
            response = await client.chat(
                model=MODEL,
                messages=messages,
                tools=[STOCK_NEWS_TOOL],
            )
            messages.append(response.message.model_dump())

            tool_calls = response.message.tool_calls or []
            if not tool_calls:
                print(response.message.content)
                break

            for tool_call in tool_calls:
                name = tool_call.function.name
                arguments = tool_call.function.arguments
                function = available_tools.get(name)
                if function is None:
                    raise ValueError(f"Unknown tool requested: {name}")

                result = function(**arguments)
                messages.append({
                    "role": "tool",
                    "content": json.dumps(
                        [item.model_dump(mode="json") for item in result]
                    ),
                })

    except (RequestError, ResponseError) as err:
        print("Error:", err.error)


if __name__ == "__main__":
    asyncio.run(main())
