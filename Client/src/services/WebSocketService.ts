export class WebSocketService {
    private static instance: WebSocketService;
    private ws: WebSocket | null = null;
    private messageQueue: string[] = [];

    private constructor() { }

    public static getInstance(): WebSocketService {
        if (!WebSocketService.instance) {
            WebSocketService.instance = new WebSocketService();
        }
        return WebSocketService.instance;
    }

    public connect(url: string): void {
        if (this.ws) {
            console.warn('WebSocket connection already exists');
            return;
        }

        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
            console.log('Connected to WebSocket server');
            this.messageQueue.forEach(message => this.ws?.send(message));
            this.messageQueue = [];
        };

        this.ws.onmessage = (event) => {
            console.log(`Received message: ${event.data}`);
            // Handle incoming messages here
        };

        this.ws.onclose = (event) => {
            console.log(`Disconnected from WebSocket server: ${event.code}, ${event.reason}`);
            // Optionally, attempt to reconnect
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }

    public send(message: string): void {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(message);
        } else {
            this.messageQueue.push(message);
        }
    }

    public disconnect(): void {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }

    getWebSocket() {
        return this.ws;
    }
}
