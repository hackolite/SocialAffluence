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

  const chartDataLastHour = timelineData.slice(-60).map((item) => {
    const dataPoint: Record<string, any> = {
      name: format(new Date(item.timestamp), "HH:mm"),
    };
    allClasses.forEach((cls) => {
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
      allClasses.forEach((cls) => {
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

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-primary" />
            Detection Per Minutes (Round Robin Last 59 Minutes)
          </CardTitle>
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

      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-primary" />
            Detection Per Hours (Round Robin Last 24 h)
          </CardTitle>
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
                  Detected Classes :
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
                      Detected Persons
                    </div>
                  </div>
                  <div className="text-center text-xs text-slate-400 mt-2">
                    Total Detections (All Classes) :{" "}
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

      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center">
            <Download className="h-5 w-5 mr-2 text-primary" />
            Download Data (Free)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <Button onClick={() => downloadCSV(timelineData)}>
              Download Affluence CSV
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
