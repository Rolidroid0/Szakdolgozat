import websockets
import asyncio
import json
import uuid

class WebSocketClient:
    def __init__(self, ws_url):
        self.ws_url = ws_url
        self.websocket = None

    async def connect(self):
        self.websocket = await websockets.connect(self.ws_url)
        print(f"Connected to WebSocket serveer at {self.ws_url}")

    async def send_message(self, action, data=None):
        if not self.websocket:
            raise Exception("WebSocket connection not established.")
        
        request_id = str(uuid.uuid4())

        if data is None:
            data = {}
        
        data["requestId"] = request_id
        
        message = {
            "action": action,
            "data": data
        }

        await self.websocket.send(json.dumps(message))
        print(f"{action} request sent with request_id: {request_id} !")

        while True:
            response = await self.websocket.recv()
            response_data = json.loads(response)

            print("Received response: ", response_data.get("action"))

            if response_data.get("request_id") == request_id:
                print("Valid response received!")
                return response_data.get("data")
            else:
                print("Received response with mismatched request_it, waiting for correct one...")

    async def close(self):
        if self.websocket:
            await self.websocket.close()
            print("WebSocket connection closed.")

"""async def main():
    ws_url = "ws://localhost:3000"
    ai_service = WebSocketClient(ws_url)

    try:
        await ai_service.connect()
        await ai_service.send_message("proba")
    finally:
        await ai_service.close()

asyncio.run(main())"""