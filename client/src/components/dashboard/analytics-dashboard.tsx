import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, PieChart, BarChart3 } from "lucide-react";

export default function AnalyticsDashboard() {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-primary" />
            Detection Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-slate-800/50 rounded-lg border border-slate-700 flex items-center justify-center">
            <div className="text-center text-slate-400">
              <BarChart3 className="h-12 w-12 mx-auto mb-2" />
              <p className="text-sm">Chart component will render here</p>
              <p className="text-xs">Real-time detection analytics</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center">
            <PieChart className="h-5 w-5 mr-2 text-primary" />
            Detection Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-slate-800/50 rounded-lg border border-slate-700 flex items-center justify-center">
            <div className="text-center text-slate-400">
              <PieChart className="h-12 w-12 mx-auto mb-2" />
              <p className="text-sm">Pie chart component will render here</p>
              <p className="text-xs">Detection type distribution</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
