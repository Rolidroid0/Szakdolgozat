import React, { useEffect, useState } from "react";
import { WebSocketService } from "../services/WebSocketService";
import { WebSocketContext } from "../contexts/WebSocketContext";

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [ws, setWs] = useState<WebSocket | null>(null);

    useEffect(() => {
        const wsService = WebSocketService.getInstance();
        wsService.connect('ws://localhost:3000');
        const socket = wsService.getWebSocket();
        setWs(socket);

        return () => {
            if (socket) socket.close();
        };
    }, []);
    
    return (
        <WebSocketContext.Provider value={ws}>
            {children}
        </WebSocketContext.Provider>
    );
};