while True:
            response = await self.websocket.recv()
            response_data = json.loads(response)

            print("Received response: ", response_data.get("action"))

            if response_data.get("request_id") == request_id:
                print("Valid response received!")
                return response_data.get("data")
            else:
                print("Received response with mismatched request_it, waiting for correct one...")