import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, PieChart } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";

interface TimelineData {
  timestamp: number;
  people: number;     // personnes connues
  total: number;      // total détecté (connus + inconnus)
  classCounts?: Record<string, number>;
}

interface AnalyticsDashboardProps {
  timelineData: TimelineData[];
  cumulativeClassCounts?: Record<string, number>;
}

export default function AnalyticsDashboard({ timelineData, cumulativeClassCounts }: AnalyticsDashboardProps) {
  // Préparer les données pour le graphique empilé
  const chartData = timelineData.slice(-60).map(item => ({
    name: format(new Date(item.timestamp), 'HH:mm'),
    known: item.people,
    unknown: Math.max(item.total - item.people, 0),
  }));

  // Calculer les totaux pour la distribution
  const totalPeople = timelineData.reduce((sum, item) => sum + item.people, 0);

  // Compter les classes cumulées
  const finalClassCounts: Record<string, number> = cumulativeClassCounts || {};
  if (!cumulativeClassCounts) {
    timelineData.forEach(item => {
      if (item.classCounts) {
        Object.entries(item.classCounts).forEach(([className, count]) => {
          finalClassCounts[className] = (finalClassCounts[className] || 0) + count;
        });
      }
    });
  }

  const topClasses = Object.entries(finalClassCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* BAR CHART */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-primary" />
            Détections empilées (connus / inconnus)
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
                <Bar dataKey="known" stackId="a" fill="#3b82f6" name="Connus" />
                <Bar dataKey="unknown" stackId="a" fill="#10b981" name="Inconnus" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* DISTRIBUTION */}
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
              {topClasses.length > 0 ? (
                <div className="space-y-3">
                  <div className="text-sm text-slate-300 font-medium">Top 5 Classes Détectées :</div>
                  {topClasses.map(([className, count]) => {
                    const total = Object.values(finalClassCounts).reduce((sum, c) => sum + c, 0);
                    const percentage = total > 0 ? (count / total) * 100 : 0;

                    const getClassColor = (className: string): string => {
                      switch (className) {
                        case 'person': return 'bg-blue-500';
                        case 'car': case 'bus': case 'truck': return 'bg-orange-500';
                        case 'bicycle': case 'motorcycle': return 'bg-green-500';
                        case 'cat': case 'dog': return 'bg-red-500';
                        default: return 'bg-purple-500';
                      }
                    };

                    return (
                      <div key={className} className="flex items-center space-x-3">
                        <div className="w-20 text-sm text-slate-400 capitalize">{className}</div>
                        <div className="flex-1 bg-slate-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${getClassColor(className)}`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <div className="w-12 text-sm text-slate-400 text-right">{count}</div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center text-slate-400 py-8">
                  <PieChart className="h-12 w-12 mx-auto mb-2" />
                  <p className="text-sm">Aucune détection pour le moment</p>
                </div>
              )}

              <div className="border-t border-slate-700 pt-3">
                <div className="text-center">
                  <div className="text-xl font-bold text-blue-500">{totalPeople}</div>
                  <div className="text-xs text-slate-400">Personnes connues détectées</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
