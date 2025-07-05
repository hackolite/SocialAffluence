import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";

const alerts = [
  {
    id: 1,
    type: 'warning',
    message: 'High traffic detected',
    timestamp: '2 minutes ago',
    color: 'bg-accent'
  },
  {
    id: 2,
    type: 'info',
    message: 'Person detected at entrance',
    timestamp: '5 minutes ago',
    color: 'bg-secondary'
  },
  {
    id: 3,
    type: 'info',
    message: 'Vehicle parked',
    timestamp: '12 minutes ago',
    color: 'bg-secondary'
  }
];

export default function RecentAlerts() {
  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="text-lg text-white flex items-center">
          <ShieldAlert className="h-5 w-5 mr-2 text-accent" />
          Recent Alerts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div key={alert.id} className="flex items-start space-x-3 p-2 bg-slate-700/30 rounded-lg">
              <div className={`w-2 h-2 ${alert.color} rounded-full mt-2`}></div>
              <div>
                <p className="text-sm text-white">{alert.message}</p>
                <p className="text-xs text-slate-400">{alert.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
