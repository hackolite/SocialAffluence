import { useState, useEffect } from "react";
import MetricsCards from "@/components/dashboard/metrics-cards";
import CameraMonitoring from "@/components/dashboard/camera-monitoring";
import LiveMetrics from "@/components/dashboard/live-metrics";
import AnalyticsDashboard from "@/components/dashboard/analytics-dashboard";
import RecentAlerts from "@/components/dashboard/recent-alerts";
import { useWebSocket } from "@/hooks/use-websocket";
import { startOfMinute, addMinutes } from "date-fns";
import { debugLogger, createDebugContext } from "@shared/debug-logger";

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

  // Debug context for dashboard
  const debugContext = createDebugContext('Dashboard');

  debugLogger.debug(debugContext, 'Dashboard component initialized', {
    initialState: {
      detectionCounts,
      systemStatus,
      totalDetections,
      peopleDetected
    }
  });

  const { socket, isConnected } = useWebSocket();

  useEffect(() => {
    const wsContext = { ...debugContext, operation: 'websocketHandler' };
    debugLogger.debug(wsContext, 'WebSocket effect triggered', { 
      hasSocket: !!socket, 
      isConnected 
    });
    
    if (!socket) return;
    
    const handleMessage = (event: MessageEvent) => {
      const msgContext = { ...wsContext, operation: 'handleMessage' };
      debugLogger.trace(msgContext, 'WebSocket message received', { 
        rawData: event.data 
      });
      
      try {
        const data = JSON.parse(event.data);
        debugLogger.debug(msgContext, 'WebSocket message parsed', { 
          messageType: data.type,
          data 
        });
        
        if (data.type === "detection_update") {
          debugLogger.info(msgContext, 'Processing detection update', { counts: data.counts });
          handleDetectionUpdate(data.counts);
        } else if (data.type === "system_status") {
          debugLogger.info(msgContext, 'Processing system status update', { status: data.status });
          setSystemStatus(data.status);
        } else if (data.type === "total_metrics") {
          debugLogger.info(msgContext, 'Processing total metrics update', { 
            total: data.total, 
            people: data.people 
          });
          setTotalDetections(data.total);
          setPeopleDetected(data.people);
        } else {
          debugLogger.warn(msgContext, 'Unknown message type received', { type: data.type });
        }
      } catch (error) {
        debugLogger.error(msgContext, 'WebSocket message parsing error', { error });
        console.error("WebSocket message parsing error:", error);
      }
    };
    
    socket.addEventListener("message", handleMessage);
    debugLogger.debug(wsContext, 'WebSocket message listener added');
    
    return () => {
      socket.removeEventListener("message", handleMessage);
      debugLogger.debug(wsContext, 'WebSocket message listener removed');
    };
  }, [socket]);

  const handleDetectionUpdate = (counts: DetectionCounts) => {
    const updateContext = { ...debugContext, operation: 'handleDetectionUpdate' };
    debugLogger.debug(updateContext, 'Starting detection update', { inputCounts: counts });
    
    if (counts.total <= 0) {
      debugLogger.warn(updateContext, 'Ignoring detection update with zero total count', { counts });
      return;
    }

    setDetectionCounts(counts);
    
    setTotalDetections((prev) => {
      const newTotal = prev + counts.total;
      debugLogger.trace(updateContext, 'Updated total detections', { 
        previous: prev, 
        increment: counts.total, 
        new: newTotal 
      });
      return newTotal;
    });
    
    setPeopleDetected((prev) => {
      const newPeople = prev + counts.people;
      debugLogger.trace(updateContext, 'Updated people count', { 
        previous: prev, 
        increment: counts.people, 
        new: newPeople 
      });
      return newPeople;
    });

    setCumulativeClassCounts((prev) => {
      const updated = { ...prev };
      for (const className in counts.classCounts) {
        const previousCount = updated[className] || 0;
        const increment = counts.classCounts[className];
        updated[className] = previousCount + increment;
        
        debugLogger.trace(updateContext, 'Updated class count', { 
          className, 
          previous: previousCount, 
          increment, 
          new: updated[className] 
        });
      }
      
      debugLogger.debug(updateContext, 'Cumulative class counts updated', { 
        previousCounts: prev,
        newCounts: updated 
      });
      
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
      <main className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6">
        {/* Metrics Cards - Full responsive */}
        <div className="mb-4 sm:mb-6">
          <MetricsCards
            activeCameras={systemStatus.camerasActive}
            totalDetections={totalDetections}
            peopleDetected={peopleDetected}
            isConnected={isConnected}
          />
        </div>

        {/* Main Content Grid - Responsive layout */}
        <div className="grid gap-4 sm:gap-6 mb-4 sm:mb-6 grid-cols-1 xl:grid-cols-3">
          {/* Camera Monitoring - Takes full width on mobile, 2/3 on desktop */}
          <div className="xl:col-span-2 w-full">
            <CameraMonitoring
              onDetectionUpdate={handleDetectionUpdate}
              currentDetections={detectionCounts}
            />
          </div>

          {/* Side Panel - Stack vertically on mobile, sidebar on desktop */}
          <div className="xl:col-span-1 w-full">
            <div className="flex flex-col gap-4 sm:gap-6 w-full">
              <div className="w-full">
                <LiveMetrics
                  detectionCounts={detectionCounts}
                  systemStatus={systemStatus}
                />
              </div>
              <div className="w-full">
                <RecentAlerts />
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Dashboard - Full width responsive */}
        <div className="w-full">
          <AnalyticsDashboard
            timelineData={timelineData}
            cumulativeClassCounts={cumulativeClassCounts}
          />
        </div>
      </main>
    </div>
  );
}