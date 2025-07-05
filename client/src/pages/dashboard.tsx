import { useState, useEffect } from "react";
import Header from "@/components/layout/header";
import MetricsCards from "@/components/dashboard/metrics-cards";
import CameraMonitoring from "@/components/dashboard/camera-monitoring";
import LiveMetrics from "@/components/dashboard/live-metrics";
import CameraGrid from "@/components/dashboard/camera-grid";
import AnalyticsDashboard from "@/components/dashboard/analytics-dashboard";
import RecentAlerts from "@/components/dashboard/recent-alerts";
import { useWebSocket } from "@/hooks/use-websocket";

export interface DetectionCounts {
  total: number;
  people: number;
  vehicles: number;
}

export interface SystemStatus {
  camerasActive: number;
  isRecording: boolean;
  analysisRate: number;
  aiDetectionActive: boolean;
  cameraConnected: boolean;
}

export default function Dashboard() {
  const [detectionCounts, setDetectionCounts] = useState<DetectionCounts>({
    total: 0,
    people: 0,
    vehicles: 0
  });

  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    camerasActive: 3,
    isRecording: true,
    analysisRate: 1,
    aiDetectionActive: true,
    cameraConnected: true
  });

  const [totalDetections, setTotalDetections] = useState(47);
  const [peopleDetected, setPeopleDetected] = useState(28);
  const [vehiclesDetected, setVehiclesDetected] = useState(19);

  // WebSocket connection for real-time updates
  const { socket, isConnected } = useWebSocket();

  useEffect(() => {
    if (socket) {
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'detection_update') {
            setDetectionCounts(data.counts);
          } else if (data.type === 'system_status') {
            setSystemStatus(data.status);
          } else if (data.type === 'total_metrics') {
            setTotalDetections(data.total);
            setPeopleDetected(data.people);
            setVehiclesDetected(data.vehicles);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
    }
  }, [socket]);

  const handleDetectionUpdate = (counts: DetectionCounts) => {
    setDetectionCounts(counts);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-slate-900 to-slate-800">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <MetricsCards 
          activeCameras={systemStatus.camerasActive}
          totalDetections={totalDetections}
          peopleDetected={peopleDetected}
          vehiclesDetected={vehiclesDetected}
          isConnected={isConnected}
        />
        
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <CameraMonitoring 
              onDetectionUpdate={handleDetectionUpdate}
              currentDetections={detectionCounts}
            />
          </div>
          
          <div className="space-y-4">
            <LiveMetrics 
              detectionCounts={detectionCounts}
              systemStatus={systemStatus}
            />
            <RecentAlerts />
          </div>
        </div>
        
        <CameraGrid />
        
        <AnalyticsDashboard />
      </main>
    </div>
  );
}
