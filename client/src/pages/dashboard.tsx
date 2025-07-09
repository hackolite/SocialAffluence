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
  classCounts: Record<string, number>;
}

export interface TimelineData {
  timestamp: number;
  people: number;
  total: number;
  classCounts: Record<string, number>;
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
    classCounts: {}
  });

  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    camerasActive: 1,
    isRecording: true,
    analysisRate: 1,
    aiDetectionActive: true,
    cameraConnected: true
  });

  const [totalDetections, setTotalDetections] = useState(0);
  const [peopleDetected, setPeopleDetected] = useState(0);
  const [cumulativeClassCounts, setCumulativeClassCounts] = useState<Record<string, number>>({});

  const [timelineData, setTimelineData] = useState<TimelineData[]>(() => {
    const now = Date.now();
    return Array.from({ length: 60 }, (_, i) => ({
      timestamp: now - ((59 - i) * 60 * 1000),
      people: 0,
      total: 0,
      classCounts: {}
    }));
  });

  const [currentMinuteCounts, setCurrentMinuteCounts] = useState({
    people: 0,
    total: 0,
    classCounts: {} as Record<string, number>
  });

  const { socket, isConnected } = useWebSocket();

  // ✅ Modifié ici
  useEffect(() => {
    if (socket) {
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'detection_update') {
            handleDetectionUpdate(data.counts);
          } else if (data.type === 'system_status') {
            setSystemStatus(data.status);
          } else if (data.type === 'total_metrics') {
            setTotalDetections(data.total);
            setPeopleDetected(data.people);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
    }
  }, [socket]);

  const handleDetectionUpdate = (counts: DetectionCounts) => {
    setDetectionCounts(counts);

    if (counts.total > 0) {
      setTotalDetections(prev => prev + counts.total);
      setPeopleDetected(prev => prev + counts.people);

      setCumulativeClassCounts(prev => {
        const updated = { ...prev };
        for (const key in counts.classCounts) {
          updated[key] = (updated[key] || 0) + counts.classCounts[key];
        }
        return updated;
      });

      setCurrentMinuteCounts(prev => {
        const updatedClassCounts = { ...prev.classCounts };
        for (const key in counts.classCounts) {
          updatedClassCounts[key] = (updatedClassCounts[key] || 0) + counts.classCounts[key];
        }

        return {
          people: prev.people + counts.people,
          total: prev.total + counts.total,
          classCounts: updatedClassCounts
        };
      });
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTimelineData(prev => {
        const now = Date.now();
        const newData = [...prev, {
          timestamp: now,
          people: currentMinuteCounts.people,
          total: currentMinuteCounts.total,
          classCounts: currentMinuteCounts.classCounts
        }];

        if (newData.length > 60) newData.shift();
        return newData;
      });

      setCurrentMinuteCounts({
        people: 0,
        total: 0,
        classCounts: {}
      });
    }, 60000);

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

        <AnalyticsDashboard 
          timelineData={timelineData} 
          cumulativeClassCounts={cumulativeClassCounts}
        />
      </main>
    </div>
  );
}
