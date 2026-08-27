import requests
import json

url = "http://localhost:8000/ai/chat"
payload = {
    "messages": [{"role": "user", "content": "Hello, how are you?"}]
}

# We send without a token first to see if the route itself works
print("Testing /ai/chat route directly...")
try:
    with requests.post(url, json=payload, stream=True) as r:
        print(f"Status Code: {r.status_code}")
        print("Response stream:")
        for chunk in r.iter_content(chunk_size=None, decode_unicode=True):
            if chunk:
                print(chunk, end='', flush=True)
except Exception as e:
    print(f"Request failed: {e}")