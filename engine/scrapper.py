import requests
import json

def sendRequest(url):
    response = requests.get(url)
    if response.status_code == 200:
        return response.content
    else:
        return "{Error: "f"{response.status_code}""}"


def main():
    response = sendRequest("https://www.paquetexpress.com.mx/rastreo/MTY01WE4355026-MTY01WE4361559")
    with open("response.html", "wb") as file:
        file.write(response)


if __name__ == "__main__":
    main()