"""Call the configured local Emu80 MCP endpoint; preserve results for testing."""
import json, sys, urllib.request

def call(name, arguments=None):
    payload = {"jsonrpc": "2.0", "id": 1, "method": "tools/call",
               "params": {"name": name, "arguments": arguments or {}}}
    req = urllib.request.Request('http://127.0.0.1:19781/mcp',
        data=json.dumps(payload).encode(),
        headers={'Content-Type': 'application/json', 'Accept': 'application/json, text/event-stream'})
    with urllib.request.urlopen(req, timeout=60) as response:
        result = json.load(response)
    if 'error' in result or result.get('result', {}).get('isError'):
        raise RuntimeError(result)
    return result['result']

if __name__ == '__main__':
    print(json.dumps(call(sys.argv[1], json.loads(sys.argv[2]) if len(sys.argv)>2 else {}), ensure_ascii=True))
