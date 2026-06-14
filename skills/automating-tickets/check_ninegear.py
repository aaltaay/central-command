import requests

url = "https://ninegear.to/tickets/2-new-ticket?id_ticket=1846"
response = requests.get(url)
print("Status Code:", response.status_code)
print("Cookies:", response.cookies.get_dict())
print("Headers:", response.headers)
