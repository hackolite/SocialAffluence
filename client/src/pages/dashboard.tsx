import { useState, useEffect } from "react";
import Header from "@/components/layout/header";
import MetricsCards from "@/components/dashboard/metrics-cards";
import CameraMonitoring from "@/components/dashboard/camera-monitoring";
import LiveMetrics from "@/components/dashboard/live-metrics";

import AnalyticsDashboard from "@/components/dashboard/analytics-dashboard";
import RecentAlerts from "@/components/dashboard/recent-alerts";
import { useWebSocket } from "@/hooks/use-websocket";

export interface DetectionCounts {
  total: number;
  people: number;
  vehicles: number;
}

export interface TimelineData {
  timestamp: number;
  people: number;
  vehicles: number;
  total: number;
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
    camerasActive: 1, // Une seule caméra active
    isRecording: true,
    analysisRate: 1,
    aiDetectionActive: true,
    cameraConnected: true
  });

  const [totalDetections, setTotalDetections] = useState(0);
  const [peopleDetected, setPeopleDetected] = useState(0);
  const [vehiclesDetected, setVehiclesDetected] = useState(0);
  
  // Historique des détections par minute (1 heure = 60 minutes)
  const [timelineData, setTimelineData] = useState<TimelineData[]>(() => {
    const now = Date.now();
    const data: TimelineData[] = [];
    // Initialiser avec 60 minutes d'historique
    for (let i = 59; i >= 0; i--) {
      data.push({
        timestamp: now - (i * 60 * 1000), // Il y a i minutes
        people: 0,
        vehicles: 0,
        total: 0
      });
    }
    return data;
  });

  // Compteurs pour la minute actuelle
  const [currentMinuteCounts, setCurrentMinuteCounts] = useState({
    people: 0,
    vehicles: 0,
    total: 0
  });

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

  // Gestion des mises à jour de détection
  const handleDetectionUpdate = (counts: DetectionCounts) => {
    setDetectionCounts(counts);
    
    // Incrémenter les compteurs totaux
    if (counts.total > 0) {
      setTotalDetections(prev => prev + counts.total);
      setPeopleDetected(prev => prev + counts.people);
      setVehiclesDetected(prev => prev + counts.vehicles);
      
      // Mettre à jour les compteurs de la minute actuelle
      setCurrentMinuteCounts(prev => ({
        people: prev.people + counts.people,
        vehicles: prev.vehicles + counts.vehicles,
        total: prev.total + counts.total
      }));
    }
  };

  // Mise à jour de l'historique toutes les minutes
  useEffect(() => {
    const interval = setInterval(() => {
      setTimelineData(prev => {
        const now = Date.now();
        const newData = [...prev];
        
        // Ajouter les données de la minute actuelle
        newData.push({
          timestamp: now,
          people: currentMinuteCounts.people,
          vehicles: currentMinuteCounts.vehicles,
          total: currentMinuteCounts.total
        });
        
        // Garder seulement les 60 dernières minutes (round robin)
        if (newData.length > 60) {
          newData.shift();
        }
        
        return newData;
      });
      
      // Réinitialiser les compteurs pour la nouvelle minute
      setCurrentMinuteCounts({
        people: 0,
        vehicles: 0,
        total: 0
      });
    }, 60000); // Toutes les minutes
    
    return () => clearInterval(interval);
  }, [currentMinuteCounts]);

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
        
        <AnalyticsDashboard timelineData={timelineData} />
      </main>
    </div>
  );
}
