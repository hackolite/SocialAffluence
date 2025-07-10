import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";

let wss: WebSocketServer;

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    console.log('WebSocket client connected');

    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message);
        console.log('Received WebSocket message:', data);

        switch (data.type) {
          case 'ping':
            ws.send(JSON.stringify({ type: 'pong' }));
            break;
          default:
            console.log('Unknown message type:', data.type);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });

    ws.on('close', () => console.log('WebSocket client disconnected'));
    ws.on('error', (error) => console.error('WebSocket error:', error));

    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'system_status',
        status: {
          camerasActive: 3,
          isRecording: true,
          analysisRate: 1,
          aiDetectionActive: true,
          cameraConnected: true
        }
      }));
    }
  });

  return httpServer;
}

// Utilisable dans ton moteur de détection pour pousser des mises à jour
export function broadcastToClients(payload: object): void {
  if (!wss) return;

  const data = JSON.stringify(payload);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}
