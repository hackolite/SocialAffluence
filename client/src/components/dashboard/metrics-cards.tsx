import { Card, CardContent } from "@/components/ui/card";
import { Camera, Activity, Users } from "lucide-react";

interface MetricsCardsProps {
  activeCameras: number;
  totalDetections: number;
  peopleDetected: number;
  isConnected: boolean;
}

export default function MetricsCards({ 
  activeCameras, 
  totalDetections, 
  peopleDetected, 
  isConnected 
}: MetricsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card className="glass metric-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Active Cameras</p>
              <p className="text-2xl font-bold text-white">1</p>
            </div>
            <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center">
              <Camera className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className={`status-indicator ${isConnected ? 'status-active' : 'status-inactive'}`}></span>
            <span className="text-xs text-slate-400">
              {isConnected ? 'All systems operational' : 'Connection lost'}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="glass metric-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Total Detections</p>
              <p className="text-2xl font-bold text-white">{totalDetections}</p>
            </div>
            <div className="w-12 h-12 gradient-secondary rounded-lg flex items-center justify-center">
              <Activity className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-xs text-secondary">+12% from last hour</span>
          </div>
        </CardContent>
      </Card>

      <Card className="glass metric-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">People Detected</p>
              <p className="text-2xl font-bold text-white">{peopleDetected}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-secondary to-emerald-600 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-xs text-secondary">Peak: 34 at 14:30</span>
          </div>
        </CardContent>
      </Card>


    </div>
  );
}
