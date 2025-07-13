import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, PieChart } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";

interface TimelineData {
  timestamp: number;
  people: number;
  total: number;
  classCounts?: Record<string, number>;
}

interface AnalyticsDashboardProps {
  timelineData: TimelineData[];
  cumulativeClassCounts?: Record<string, number>;
}

// Couleurs fixes pour classes connues
const classColors: Record<string, string> = {
  person: "#3b82f6",
  car: "#f97316",
  bus: "#eab308",
  truck: "#c084fc",
  bicycle: "#10b981",
  motorcycle: "#8b5cf6",
  dog: "#ef4444",
  cat: "#f43f5e",
};

// Cache des couleurs dynamiques générées
const colorCache: Record<string, string> = {};

function getRandomColor() {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 70%, 60%)`;
}

function getClassColor(className: string): string {
  if (classColors[className]) return classColors[className];
  if (!colorCache[className]) {
    colorCache[className] = getRandomColor();
  }
  return colorCache[className];
}

export default function AnalyticsDashboard({
  timelineData,
  cumulativeClassCounts,
}: AnalyticsDashboardProps) {
  // Extraire toutes les classes détectées
  const allClassesSet = new Set<string>();
  timelineData.forEach((item) => {
    if (item.classCounts) {
      Object.keys(item.classCounts).forEach((cls) => allClassesSet.add(cls));
    }
  });
  const allClasses = Array.from(allClassesSet);

  // Préparer les données pour le graphique (max 60 dernières)
  const chartData = timelineData.slice(-60).map((item) => {
    const dataPoint: Record<string, any> = {
      name: format(new Date(item.timestamp), "HH:mm"),
    };
    allClasses.forEach((cls) => {
      dataPoint[cls] = item.classCounts?.[cls] ?? 0;
    });
    return dataPoint;
  });

  // Calcul cumul des classes (soit à partir du props, soit en calculant)
  const finalClassCounts: Record<string, number> = cumulativeClassCounts
    ? { ...cumulativeClassCounts }
    : {};

  if (!cumulativeClassCounts) {
    timelineData.forEach((item) => {
      if (item.classCounts) {
        Object.entries(item.classCounts).forEach(([cls, count]) => {
          finalClassCounts[cls] = (finalClassCounts[cls] || 0) + count;
        });
      }
    });
  }

  // Trier les classes par nombre décroissant
  const allClassesSorted = Object.entries(finalClassCounts).sort(
    (a, b) => b[1] - a[1]
  );

  // Total personnes détectées (somme de people sur timeline)
  const totalPeople = timelineData.reduce((sum, item) => sum + item.people, 0);

  // Total détections toutes classes cumulées
  const totalDetections = Object.values(finalClassCounts).reduce(
    (a, b) => a + b,
    0
  );

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Graphique stacked bar */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-primary" />
            Stack détection par classe
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
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                {allClasses.map((cls) => (
                  <Bar
                    key={cls}
                    dataKey={cls}
                    stackId="a"
                    fill={getClassColor(cls)}
                    name={cls}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Distribution cumulée */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center">
            <PieChart className="h-5 w-5 mr-2 text-primary" />
            Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 overflow-y-auto pr-2">
            {allClassesSorted.length > 0 ? (
              <div className="space-y-4">
                <div className="text-sm text-slate-300 font-medium">
                  Classes détectées :
                </div>
                {allClassesSorted.map(([cls, count]) => {
                  const percentage =
                    totalDetections > 0 ? (count / totalDetections) * 100 : 0;
                  return (
                    <div
                      key={cls}
                      className="flex items-center space-x-3 select-none"
                      title={`${cls}: ${count} (${percentage.toFixed(1)}%)`}
                    >
                      <div className="w-24 text-sm text-slate-400 capitalize truncate">
                        {cls}
                      </div>
                      <div className="flex-1 bg-slate-700 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: getClassColor(cls),
                          }}
                        />
                      </div>
                      <div className="w-12 text-sm text-slate-400 text-right">
                        {count}
                      </div>
                    </div>
                  );
                })}
                <div className="border-t border-slate-700 pt-3">
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-500">
                      {totalPeople}
                    </div>
                    <div className="text-xs text-slate-400">
                      Personnes connues détectées
                    </div>
                  </div>
                  <div className="text-center text-xs text-slate-400 mt-2">
                    Total détections (toutes classes) :{" "}
                    <span className="font-semibold text-white">
                      {totalDetections}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-400 py-8 select-none">
                <PieChart className="h-12 w-12 mx-auto mb-2" />
                <p className="text-sm">Zero detection</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
