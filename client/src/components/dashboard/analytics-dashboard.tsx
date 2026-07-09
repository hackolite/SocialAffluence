import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, PieChart, Download } from "lucide-react";
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


function downloadCSV(timelineData: TimelineData[]) {
  const allClassesSet = new Set<string>();
  timelineData.forEach((item) => {
    if (item.classCounts) {
      Object.keys(item.classCounts).forEach((cls) => allClassesSet.add(cls));
    }
  });

  const allClasses = Array.from(allClassesSet).sort();

  const headers = ["timestamp", "people", "total", ...allClasses];
  const rows: string[] = [];

  timelineData.forEach((item) => {
    const row: (string | number)[] = [
      new Date(item.timestamp).toISOString(),
      item.people,
      item.total,
    ];

    allClasses.forEach((cls) => {
      const count = item.classCounts?.[cls] ?? 0;
      row.push(count);
    });

    rows.push(row.join(","));
  });

  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "analytics_data.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default function AnalyticsDashboard({
  timelineData,
  cumulativeClassCounts,
}: AnalyticsDashboardProps) {
  const allClassesSet = new Set<string>();
  timelineData.forEach((item) => {
    if (item.classCounts) {
      Object.keys(item.classCounts).forEach((cls) => allClassesSet.add(cls));
    }
  });
  const allClasses = Array.from(allClassesSet);

  // Class filter state — start empty so visibleClasses defaults to showing all
  const [selectedClasses, setSelectedClasses] = useState<Set<string>>(new Set());

  // Sync: auto-select newly detected classes so they appear by default
  const [knownClasses, setKnownClasses] = useState<Set<string>>(new Set());
  const newClasses = allClasses.filter((cls) => !knownClasses.has(cls));
  if (newClasses.length > 0) {
    setKnownClasses((prev) => new Set([...prev, ...newClasses]));
    setSelectedClasses((prev) => new Set([...prev, ...newClasses]));
  }

  // Show all if nothing is selected (empty set = all)
  const visibleClasses =
    selectedClasses.size === 0
      ? allClasses
      : allClasses.filter((cls) => selectedClasses.has(cls));

  const toggleClass = (cls: string) => {
    setSelectedClasses((prev) => {
      const next = new Set(prev);
      if (next.has(cls)) {
        next.delete(cls);
      } else {
        next.add(cls);
      }
      return next;
    });
  };

  const toggleAll = () => {
    setSelectedClasses((prev) =>
      prev.size === allClasses.length ? new Set() : new Set(allClasses)
    );
  };

  const chartDataLastHour = timelineData.slice(-60).map((item) => {
    const dataPoint: Record<string, any> = {
      name: format(new Date(item.timestamp), "HH:mm"),
    };
    visibleClasses.forEach((cls) => {
      dataPoint[cls] = item.classCounts?.[cls] ?? 0;
    });
    return dataPoint;
  });

  const groupedByHour: Record<string, Record<string, number>> = {};
  timelineData.forEach((item) => {
    const hour = format(new Date(item.timestamp), "HH:00");
    if (!groupedByHour[hour]) {
      groupedByHour[hour] = {};
    }
    Object.entries(item.classCounts ?? {}).forEach(([cls, count]) => {
      groupedByHour[hour][cls] = (groupedByHour[hour][cls] || 0) + count;
    });
  });

  const chartData24h = Object.entries(groupedByHour)
    .map(([hour, counts]) => {
      const dataPoint: Record<string, any> = {
        name: hour,
      };
      visibleClasses.forEach((cls) => {
        dataPoint[cls] = counts[cls] ?? 0;
      });
      return dataPoint;
    })
    .slice(-24);

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

  const allClassesSorted = Object.entries(finalClassCounts).sort(
    (a, b) => b[1] - a[1]
  );

  const totalPeople = timelineData.reduce((sum, item) => sum + item.people, 0);
  const totalDetections = Object.values(finalClassCounts).reduce(
    (a, b) => a + b,
    0
  );

  // Class filter pill component (shared between both charts)
  const ClassFilterBar = () => (
    <div className="flex flex-wrap gap-2 mt-3 mb-1">
      <button
        onClick={toggleAll}
        className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
          selectedClasses.size === allClasses.length || selectedClasses.size === 0
            ? "bg-blue-600/20 border-blue-500/50 text-blue-300"
            : "bg-slate-700/50 border-slate-600 text-slate-400 hover:border-slate-500"
        }`}
      >
        Tous
      </button>
      {allClasses.map((cls) => (
        <button
          key={cls}
          onClick={() => toggleClass(cls)}
          className={`relative px-2.5 py-1 rounded-full text-xs font-medium border transition-all capitalize ${
            selectedClasses.has(cls)
              ? "border-transparent text-white"
              : "bg-slate-700/30 border-slate-600/50 text-slate-500 hover:border-slate-500"
          }`}
          style={
            selectedClasses.has(cls)
              ? { borderColor: getClassColor(cls), color: getClassColor(cls), backgroundColor: "transparent" }
              : undefined
          }
        >
          {selectedClasses.has(cls) && (
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-full opacity-20"
              style={{ backgroundColor: getClassColor(cls) }}
            />
          )}
          {cls}
        </button>
      ))}
    </div>
  );

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-primary" />
            Détections / minute (59 dernières minutes)
          </CardTitle>
          {allClasses.length > 0 && <ClassFilterBar />}
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartDataLastHour}>
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
                {visibleClasses.map((cls) => (
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

      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-primary" />
            Détections / heure (24 dernières heures)
          </CardTitle>
          {allClasses.length > 0 && <ClassFilterBar />}
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData24h}>
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
                {visibleClasses.map((cls) => (
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

      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center">
            <PieChart className="h-5 w-5 mr-2 text-primary" />
            Distribution par classe
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
                      Personnes détectées
                    </div>
                  </div>
                  <div className="text-center text-xs text-slate-400 mt-2">
                    Total toutes classes :{" "}
                    <span className="font-semibold text-white">
                      {totalDetections}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-400 py-8 select-none">
                <PieChart className="h-12 w-12 mx-auto mb-2" />
                <p className="text-sm">Aucune détection</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center">
            <Download className="h-5 w-5 mr-2 text-primary" />
            Exporter les données
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <Button onClick={() => downloadCSV(timelineData)}>
              Télécharger CSV d'affluence
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
