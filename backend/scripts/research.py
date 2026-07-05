import requests

url = "https://vbpl.vn/"
try:
    response = requests.get(url, verify=False)
    print(f"Status Code: {response.status_code}")
    print(response.text[:2000])

except Exception as e:
    print(f"Error: {e}")
