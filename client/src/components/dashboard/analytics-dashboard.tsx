import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, PieChart, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from "recharts";
import { format } from "date-fns";

interface TimelineData {
  timestamp: number;
  people: number;
  vehicles: number;
  total: number;
}

interface AnalyticsDashboardProps {
  timelineData: TimelineData[];
}

export default function AnalyticsDashboard({ timelineData }: AnalyticsDashboardProps) {
  // Préparer les données pour le graphique empilé
  const chartData = timelineData.slice(-60).map((item, index) => ({
    name: format(new Date(item.timestamp), 'HH:mm'),
    people: item.people,
    vehicles: item.vehicles,
    total: item.total
  }));

  // Calculer les totaux pour la distribution
  const totalPeople = timelineData.reduce((sum, item) => sum + item.people, 0);
  const totalVehicles = timelineData.reduce((sum, item) => sum + item.vehicles, 0);

  const pieData = [
    { name: 'Personnes', value: totalPeople, color: '#3b82f6' },
    { name: 'Véhicules', value: totalVehicles, color: '#10b981' }
  ];

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-primary" />
            Détections par minute (60 min)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="name" 
                  stroke="#9ca3af"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#9ca3af"
                  fontSize={12}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="people" stackId="a" fill="#3b82f6" name="Personnes" />
                <Bar dataKey="vehicles" stackId="a" fill="#10b981" name="Véhicules" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center">
            <PieChart className="h-5 w-5 mr-2 text-primary" />
            Distribution des détections
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <div className="space-y-4">
              <div className="flex justify-center space-x-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{totalPeople}</div>
                  <div className="text-sm text-slate-400 flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                    Personnes
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{totalVehicles}</div>
                  <div className="text-sm text-slate-400 flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    Véhicules
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                {totalPeople > 0 && (
                  <div className="flex items-center space-x-3">
                    <div className="w-24 text-sm text-slate-400">Personnes</div>
                    <div className="flex-1 bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(totalPeople / (totalPeople + totalVehicles)) * 100}%` }}
                      ></div>
                    </div>
                    <div className="w-12 text-sm text-slate-400 text-right">{totalPeople}</div>
                  </div>
                )}
                
                {totalVehicles > 0 && (
                  <div className="flex items-center space-x-3">
                    <div className="w-24 text-sm text-slate-400">Véhicules</div>
                    <div className="flex-1 bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(totalVehicles / (totalPeople + totalVehicles)) * 100}%` }}
                      ></div>
                    </div>
                    <div className="w-12 text-sm text-slate-400 text-right">{totalVehicles}</div>
                  </div>
                )}
                
                {totalPeople === 0 && totalVehicles === 0 && (
                  <div className="text-center text-slate-400 py-8">
                    <PieChart className="h-12 w-12 mx-auto mb-2" />
                    <p className="text-sm">Aucune détection pour le moment</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
