import { useState, useEffect } from "react";
import Header from "@/components/layout/header";
import MetricsCards from "@/components/dashboard/metrics-cards";
import CameraMonitoring from "@/components/dashboard/camera-monitoring";
import LiveMetrics from "@/components/dashboard/live-metrics";
import AnalyticsDashboard from "@/components/dashboard/analytics-dashboard";
import RecentAlerts from "@/components/dashboard/recent-alerts";
import { useWebSocket } from "@/hooks/use-websocket";
import { startOfMinute, addMinutes } from "date-fns";

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
    classCounts: {},
  });

  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    camerasActive: 1,
    isRecording: true,
    analysisRate: 1,
    aiDetectionActive: true,
    cameraConnected: true,
  });

  const [totalDetections, setTotalDetections] = useState(0);
  const [peopleDetected, setPeopleDetected] = useState(0);
  const [cumulativeClassCounts, setCumulativeClassCounts] = useState<Record<string, number>>({});
  const [timelineData, setTimelineData] = useState<TimelineData[]>([]);
  const [currentMinuteCounts, setCurrentMinuteCounts] = useState({
    people: 0,
    total: 0,
    classCounts: {} as Record<string, number>,
  });

  const [minuteStart, setMinuteStart] = useState<number>(
    startOfMinute(new Date()).getTime()
  );

  const { socket, isConnected } = useWebSocket();

  useEffect(() => {
    if (!socket) return;
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "detection_update") {
          handleDetectionUpdate(data.counts);
        } else if (data.type === "system_status") {
          setSystemStatus(data.status);
        } else if (data.type === "total_metrics") {
          setTotalDetections(data.total);
          setPeopleDetected(data.people);
        }
      } catch (error) {
        console.error("WebSocket message parsing error:", error);
      }
    };
    socket.addEventListener("message", handleMessage);
    return () => socket.removeEventListener("message", handleMessage);
  }, [socket]);

  const handleDetectionUpdate = (counts: DetectionCounts) => {
    if (counts.total <= 0) return;

    setDetectionCounts(counts);
    setTotalDetections((prev) => prev + counts.total);
    setPeopleDetected((prev) => prev + counts.people);

    setCumulativeClassCounts((prev) => {
      const updated = { ...prev };
      for (const className in counts.classCounts) {
        updated[className] =
          (updated[className] || 0) + counts.classCounts[className];
      }
      return updated;
    });

    setCurrentMinuteCounts((prev) => {
      const updatedClassCounts = { ...prev.classCounts };
      for (const className in counts.classCounts) {
        updatedClassCounts[className] =
          (updatedClassCounts[className] || 0) + counts.classCounts[className];
      }
      return {
        people: prev.people + counts.people,
        total: prev.total + counts.total,
        classCounts: updatedClassCounts,
      };
    });
  };

  useEffect(() => {
    const now = new Date();
    const nextMinute = addMinutes(startOfMinute(now), 1);
    const delay = nextMinute.getTime() - now.getTime();

    const timeout = setTimeout(() => {
      setTimelineData((prev) => [
        ...prev,
        {
          timestamp: minuteStart,
          people: currentMinuteCounts.people,
          total: currentMinuteCounts.total,
          classCounts: currentMinuteCounts.classCounts,
        },
      ]);

      setCurrentMinuteCounts({ people: 0, total: 0, classCounts: {} });
      setMinuteStart(startOfMinute(new Date()).getTime());
    }, delay);

    return () => clearTimeout(timeout);
  }, [currentMinuteCounts, minuteStart]);

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

        <div className="grid gap-6 mb-6 lg:grid-cols-3">
          <div className="col-span-1 lg:col-span-2 w-full">
            <CameraMonitoring
              onDetectionUpdate={handleDetectionUpdate}
              currentDetections={detectionCounts}
            />
          </div>
          <div className="flex flex-col gap-6 w-full">
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
