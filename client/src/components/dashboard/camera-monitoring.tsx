import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Camera, 
  Activity, 
  Play, 
  Pause, 
  Eye, 
  Maximize,
  Download,
  Share
} from 'lucide-react';
import { DetectionCounts } from '@/pages/dashboard';

interface DetectionBox {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  class: 'person' | 'vehicle';
}

interface CameraMonitoringProps {
  onDetectionUpdate: (counts: DetectionCounts) => void;
  currentDetections: DetectionCounts;
}

const CameraMonitoring: React.FC<CameraMonitoringProps> = ({ 
  onDetectionUpdate, 
  currentDetections 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const [isActive, setIsActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [fps] = useState<number>(1);
  const [detectionBoxes, setDetectionBoxes] = useState<DetectionBox[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('Camera 1 - Front Entrance');
  const [currentTimestamp, setCurrentTimestamp] = useState<string>('');

  const startCamera = useCallback(async (): Promise<void> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment'
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraError(null);
      }
    } catch (err) {
      console.error('Camera access error:', err);
      const error = err as Error;
      setCameraError(
        error.name === 'NotAllowedError' 
          ? 'Camera access denied. Please allow camera access.'
          : 'Unable to access camera.'
      );
    }
  }, []);

  const stopCamera = useCallback((): void => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track: MediaStreamTrack) => {
        track.stop();
      });
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setCameraError(null);
  }, []);

  const simulateDetection = useCallback((): void => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    
    if (videoWidth === 0 || videoHeight === 0) return;

    const numDetections = Math.floor(Math.random() * 5) + 1;
    const boxes: DetectionBox[] = [];
    let peopleCount = 0;
    let vehicleCount = 0;

    for (let i = 0; i < numDetections; i++) {
      const isPersonDetection = Math.random() > 0.3;
      const detectionClass: 'person' | 'vehicle' = isPersonDetection ? 'person' : 'vehicle';
      
      if (isPersonDetection) {
        peopleCount++;
      } else {
        vehicleCount++;
      }

      boxes.push({
        x: Math.random() * (videoWidth - 100),
        y: Math.random() * (videoHeight - 100),
        width: 50 + Math.random() * 100,
        height: 60 + Math.random() * 120,
        confidence: 0.6 + Math.random() * 0.4,
        class: detectionClass
      });
    }

    setDetectionBoxes(boxes);
    const newCounts = {
      total: numDetections,
      people: peopleCount,
      vehicles: vehicleCount
    };
    
    onDetectionUpdate(newCounts);
  }, [onDetectionUpdate]);

  const drawDetections = useCallback((): void => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    detectionBoxes.forEach((box: DetectionBox) => {
      ctx.strokeStyle = box.class === 'person' ? '#10B981' : '#F59E0B';
      ctx.lineWidth = 2;
      ctx.strokeRect(box.x, box.y, box.width, box.height);

      ctx.fillStyle = box.class === 'person' ? '#10B981' : '#F59E0B';
      ctx.font = '12px Arial';
      const label = `${box.class} ${Math.round(box.confidence * 100)}%`;
      ctx.fillText(label, box.x, box.y - 5);
    });
  }, [detectionBoxes]);

  const handlePlayPause = async (): Promise<void> => {
    if (!isActive) {
      await startCamera();
      setIsActive(true);
      
      intervalRef.current = setInterval(() => {
        simulateDetection();
        drawDetections();
      }, 1000);
      
    } else {
      setIsActive(false);
      stopCamera();
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  };

  useEffect(() => {
    const updateTimestamp = () => {
      const now = new Date();
      setCurrentTimestamp(now.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }));
    };

    updateTimestamp();
    const timestampInterval = setInterval(updateTimestamp, 1000);

    return () => {
      clearInterval(timestampInterval);
      stopCamera();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [stopCamera]);

  useEffect(() => {
    if (isActive) {
      drawDetections();
    }
  }, [detectionBoxes, isActive, drawDetections]);

  return (
    <Card className="glass">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-white">
            <Camera className="mr-2 h-5 w-5 text-primary" />
            Real-Time Surveillance
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant={isActive ? "default" : "secondary"} className="bg-slate-700">
              <Activity className="mr-1 h-3 w-3" />
              {isActive ? `${fps} FPS` : "STOPPED"}
            </Badge>
            <select 
              className="bg-slate-700 text-white rounded-lg px-3 py-1 text-sm border border-slate-600"
              value={selectedCamera}
              onChange={(e) => setSelectedCamera(e.target.value)}
            >
              <option value="Camera 1 - Front Entrance">Camera 1 - Front Entrance</option>
              <option value="Camera 2 - Parking Lot">Camera 2 - Parking Lot</option>
              <option value="Camera 3 - Back Exit">Camera 3 - Back Exit</option>
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative aspect-video bg-slate-800 rounded-lg border border-slate-700 overflow-hidden mb-4">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            muted
            playsInline
            style={{ display: cameraError ? 'none' : 'block' }}
          />
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
          />
          
          <div className="absolute top-4 left-4 glass rounded-lg p-3 backdrop-blur-sm">
            <div className="text-xs space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-slate-300">Detections:</span>
                <span className="text-white font-semibold">{currentDetections.total}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-secondary">People:</span>
                <span className="text-white font-semibold">{currentDetections.people}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-accent">Vehicles:</span>
                <span className="text-white font-semibold">{currentDetections.vehicles}</span>
              </div>
            </div>
          </div>

          <div className="absolute top-4 right-4 flex items-center space-x-2 glass rounded-lg p-2 backdrop-blur-sm">
            <div className="w-2 h-2 bg-destructive rounded-full pulse-animation"></div>
            <span className="text-xs text-white">REC</span>
          </div>

          <div className="absolute bottom-4 right-4 glass rounded-lg p-2 backdrop-blur-sm">
            <span className="text-xs text-slate-200">{currentTimestamp}</span>
          </div>

          {cameraError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
              <div className="text-center">
                <Eye className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">{cameraError}</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              onClick={handlePlayPause}
              className={isActive ? "gradient-danger hover:opacity-90" : "gradient-primary hover:opacity-90"}
            >
              {isActive ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
              {isActive ? "Stop Monitoring" : "Start Monitoring"}
            </Button>
            <Button variant="outline" className="bg-slate-700 hover:bg-slate-600 border-slate-600">
              <Camera className="mr-2 h-4 w-4" />
              Snapshot
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="text-white hover:bg-slate-700">
              <Maximize className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-slate-700">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-slate-700">
              <Share className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CameraMonitoring;
