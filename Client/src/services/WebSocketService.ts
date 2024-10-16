type MessageHandler = (data: any) => void;

export class WebSocketService {
    private static instance: WebSocketService;
    private ws: WebSocket | null = null;
    private messageQueue: string[] = [];
    private actionHandlers: Record<string, MessageHandler> = {}

    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 2000;

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
            const data = JSON.parse(event.data);
            console.log("Received message from server: ", data);
            const action = data.action;
            const handler = this.actionHandlers[action];
            if (handler) {
                handler(data);
            } else {
                console.warn(`No handler found for action: ${action}`);
            }
        };

        this.ws.onclose = (event) => {
            console.log(`Disconnected from WebSocket server: ${event.code}, ${event.reason}`);
            this.handleReconnect(url);
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }

    private handleReconnect(url: string) {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            setTimeout(() => this.connect(url), this.reconnectDelay);
        } else {
            console.warn('Max reconnect attempts reached. No longer attempting to reconnect.');
        }
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

    public registerHandler(action: string, handler: MessageHandler): void {
        this.actionHandlers[action] = handler;
    }

    public unregisterHandler(action: string): void {
        delete this.actionHandlers[action];
    }

    getWebSocket() {
        return this.ws;
    }
}
