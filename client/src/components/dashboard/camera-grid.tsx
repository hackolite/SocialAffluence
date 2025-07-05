import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Grid3X3, Layout } from "lucide-react";

const cameras = [
  {
    id: 1,
    name: "Camera 1",
    location: "Front Entrance",
    image: "https://images.unsplash.com/photo-1562564055-71e051d33c19?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=450"
  },
  {
    id: 2,
    name: "Camera 2",
    location: "Parking Lot",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=450"
  },
  {
    id: 3,
    name: "Camera 3",
    location: "Back Exit",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=450"
  }
];

export default function CameraGrid() {
  return (
    <Card className="glass mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-white flex items-center">
            <Grid3X3 className="h-5 w-5 mr-2 text-primary" />
            Camera Grid
          </CardTitle>
          <Button variant="outline" className="bg-slate-700 hover:bg-slate-600 border-slate-600">
            <Layout className="h-4 w-4 mr-2" />
            Grid View
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cameras.map((camera) => (
            <div key={camera.id} className="relative aspect-video bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
              <img 
                src={camera.image} 
                alt={`${camera.name} view`}
                className="w-full h-full object-cover" 
              />
              
              <div className="absolute top-2 left-2 glass rounded px-2 py-1 backdrop-blur-sm">
                <span className="text-xs text-white">{camera.name}</span>
              </div>
              
              <div className="absolute top-2 right-2 flex items-center space-x-1">
                <div className="w-2 h-2 bg-secondary rounded-full pulse-animation"></div>
                <span className="text-xs text-white">LIVE</span>
              </div>
              
              <div className="absolute bottom-2 left-2 glass rounded px-2 py-1 backdrop-blur-sm">
                <span className="text-xs text-slate-200">{camera.location}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
