const wss = getWebSocketServer();
wss.clients.forEach(client => {
	if (client.readyState === WebSocket.OPEN) {
		client.send(JSON.stringify({
			action: 'territory-updated',
			data: { territory }
		}));
	}
});