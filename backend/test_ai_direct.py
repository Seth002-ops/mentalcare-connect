import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

client = OpenAI(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1"
)

# Test each available model to find one that works
models_to_test = [
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b",
    "qwen/qwen3.6-27b",
    "groq/compound-mini",
]

for model in models_to_test:
    print(f"\n{'='*50}")
    print(f"Testing model: {model}")
    print(f"{'='*50}")
    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": "Say hello in one sentence."}
            ],
            temperature=0.7,
            max_tokens=50,
            stream=False,
        )
        content = response.choices[0].message.content
        print(f"✅ SUCCESS: {content}")
    except Exception as e:
        print(f"❌ FAILED: {e}")