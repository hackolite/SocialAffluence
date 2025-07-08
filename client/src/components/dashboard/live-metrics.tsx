import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Activity, Users, Car, Server } from "lucide-react";
import { DetectionCounts, SystemStatus } from "@/pages/dashboard";

interface LiveMetricsProps {
  detectionCounts: DetectionCounts;
  systemStatus: SystemStatus;
}

export default function LiveMetrics({ detectionCounts, systemStatus }: LiveMetricsProps) {
  // Get top 5 detected classes from current detection counts
  const topClasses = Object.entries(detectionCounts.classCounts || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="text-lg text-white flex items-center">
          <BarChart3 className="h-5 w-5 mr-2 text-primary" />
          Live Metrics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">{detectionCounts.total}</div>
            <div className="text-sm text-slate-400 flex items-center justify-center">
              <Activity className="w-3 h-3 mr-1" />
              Total Detections
            </div>
          </div>
          
          {topClasses.length > 0 ? (
            <div className="space-y-3">
              <div className="text-sm text-slate-300 font-medium">Top Detected Classes:</div>
              {topClasses.map(([className, count]) => (
                <div key={className} className="flex justify-between items-center">
                  <span className="text-sm text-slate-400 capitalize">{className}</span>
                  <span className="text-sm font-medium text-white">{count}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="text-sm text-slate-400">No detections yet</div>
            </div>
          )}
          
          <div className="border-t border-slate-700 pt-3 grid grid-cols-2 gap-3">
            <div className="text-center">
              <div className="text-xl font-bold text-secondary mb-1">{detectionCounts.people}</div>
              <div className="text-xs text-slate-400 flex items-center justify-center">
                <Users className="w-3 h-3 mr-1" />
                People
              </div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-accent mb-1">{detectionCounts.vehicles}</div>
              <div className="text-xs text-slate-400 flex items-center justify-center">
                <Car className="w-3 h-3 mr-1" />
                Vehicles
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function SystemStatusCard({ systemStatus }: { systemStatus: SystemStatus }) {
  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="text-lg text-white flex items-center">
          <Server className="h-5 w-5 mr-2 text-primary" />
          System Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400">Analysis Rate</span>
            <div className="flex items-center space-x-2">
              <span className="status-indicator status-active"></span>
              <span className="text-sm text-white">{systemStatus.analysisRate} FPS</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400">AI Detection</span>
            <div className="flex items-center space-x-2">
              <span className={`status-indicator ${systemStatus.aiDetectionActive ? 'status-active' : 'status-inactive'}`}></span>
              <span className="text-sm text-white">{systemStatus.aiDetectionActive ? 'Active' : 'Inactive'}</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400">Camera Status</span>
            <div className="flex items-center space-x-2">
              <span className={`status-indicator ${systemStatus.cameraConnected ? 'status-active' : 'status-error'}`}></span>
              <span className="text-sm text-white">{systemStatus.cameraConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400">Recording</span>
            <div className="flex items-center space-x-2">
              <span className={`status-indicator ${systemStatus.isRecording ? 'status-active' : 'status-inactive'}`}></span>
              <span className="text-sm text-white">{systemStatus.isRecording ? 'Active' : 'Inactive'}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
