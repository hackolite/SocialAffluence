import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws: WebSocket) => {
    console.log('WebSocket client connected');
    
    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message);
        console.log('Received WebSocket message:', data);
        
        // Handle different message types
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

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    // Send initial system status
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

  // Simulate real-time detection updates
  setInterval(() => {
    const totalDetections = Math.floor(Math.random() * 8) + 1;
    const peopleDetections = Math.floor(Math.random() * (totalDetections + 1));
    const vehicleDetections = totalDetections - peopleDetections;

    const detectionUpdate = {
      type: 'detection_update',
      counts: {
        total: totalDetections,
        people: peopleDetections,
        vehicles: vehicleDetections
      }
    };

    // Broadcast to all connected clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(detectionUpdate));
      }
    });
  }, 3000);

  // Simulate total metrics updates
  setInterval(() => {
    const metricsUpdate = {
      type: 'total_metrics',
      total: Math.floor(Math.random() * 50) + 20,
      people: Math.floor(Math.random() * 35) + 15,
      vehicles: Math.floor(Math.random() * 25) + 10
    };

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(metricsUpdate));
      }
    });
  }, 10000);

  return httpServer;
}
