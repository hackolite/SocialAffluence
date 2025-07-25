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
  Share,
  Brain,
  AlertCircle
} from 'lucide-react';
import { DetectionCounts } from '@/pages/dashboard';
import { useYoloDetection } from '@/hooks/use-yolo-detection';

interface DetectionBox {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  class: string;
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
  const [selectedCamera, setSelectedCamera] = useState<string>('Camera');
  const [currentTimestamp, setCurrentTimestamp] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // YOLO detection hook
  const { detectObjects, isModelLoaded, isProcessing, error: yoloError } = useYoloDetection();

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

  const runYoloDetection = useCallback(async (): Promise<void> => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) return;

    try {
      const detectedBoxes = await detectObjects(video);
      setDetectionBoxes(detectedBoxes);
      
      // Count detections by type
      let peopleCount = 0;
      const classCounts: Record<string, number> = {};
      
      detectedBoxes.forEach(box => {
        // Count by specific class
        classCounts[box.class] = (classCounts[box.class] || 0) + 1;
        
        // Count people specifically
        if (box.class === 'person') {
          peopleCount++;
        }
      });
      
      const newCounts = {
        total: detectedBoxes.length,
        people: peopleCount,
        classCounts
      };
      
      onDetectionUpdate(newCounts);
    } catch (error) {
      console.error('YOLO detection error:', error);
    }
  }, [detectObjects, onDetectionUpdate]);

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
      // Different colors for different classes
      const getClassColor = (className: string): string => {
        switch (className) {
          case 'person': return '#10B981'; // Green
          case 'car': case 'bus': case 'truck': return '#F59E0B'; // Orange
          case 'bicycle': case 'motorcycle': return '#3B82F6'; // Blue
          case 'cat': case 'dog': return '#EF4444'; // Red
          default: return '#8B5CF6'; // Purple
        }
      };
      
      const color = getClassColor(box.class);
      ctx.strokeStyle = color;
      ctx.lineWidth = isFullscreen ? 30 : 20;
      ctx.strokeRect(box.x, box.y, box.width, box.height);

      ctx.fillStyle = color;
      ctx.font = isFullscreen ? '70px Arial' : '70px Arial';
      const label = `${box.class} ${Math.round(box.confidence * 100)}%`;
      ctx.fillText(label, box.x, box.y - 5);
    });
  }, [detectionBoxes, isFullscreen]);

  const handlePlayPause = async (): Promise<void> => {
    if (!isActive) {
      await startCamera();
      setIsActive(true);
      
      intervalRef.current = setInterval(() => {
        runYoloDetection();
        drawDetections();
      }, 500);
      
    } else {
      setIsActive(false);
      stopCamera();
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  };

  // Gestion du plein écran
  const toggleFullscreen = useCallback(async () => {
    if (!cardRef.current) return;
    
    try {
      if (!isFullscreen) {
        // Entrer en plein écran
        if (cardRef.current.requestFullscreen) {
          await cardRef.current.requestFullscreen();
        } else if ((cardRef.current as any).webkitRequestFullscreen) {
          await (cardRef.current as any).webkitRequestFullscreen();
        } else if ((cardRef.current as any).msRequestFullscreen) {
          await (cardRef.current as any).msRequestFullscreen();
        }
        setIsFullscreen(true);
      } else {
        // Sortir du plein écran
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Erreur lors du basculement en plein écran:', error);
    }
  }, [isFullscreen]);

  // Écouter les changements de plein écran
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullscreen(isCurrentlyFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

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
    const timestampInterval = setInterval(updateTimestamp, 0);

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
    <Card ref={cardRef} className={`glass ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-white">
            <Camera className="mr-2 h-5 w-5 text-primary" />
            Live Affluence Monitoring
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant={isActive ? "default" : "secondary"} className="bg-slate-700">
              <Activity className="mr-1 h-3 w-3" />
              {isActive ? `${fps} FPS` : "STOPPED"}
            </Badge>
            <Badge variant={isModelLoaded ? "default" : "secondary"} className="bg-slate-700">
              <Brain className="mr-1 h-3 w-3" />
              {isModelLoaded ? "SSDLite" : "LOADING"}
            </Badge>
            {yoloError && (
              <Badge variant="destructive" className="bg-destructive">
                <AlertCircle className="mr-1 h-3 w-3" />
                FALLBACK
              </Badge>
            )}
            <select 
              className="bg-slate-700 text-white rounded-lg px-3 py-1 text-sm border border-slate-600"
              value={selectedCamera}
              onChange={(e) => setSelectedCamera(e.target.value)}
            >
              <option value="Camera 1 - Front Entrance">Camera 1 - Front Entrance</option>
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className={`relative bg-slate-800 rounded-lg border border-slate-700 overflow-hidden mb-4 ${isFullscreen ? 'aspect-auto h-[calc(100vh-200px)]' : 'aspect-video'}`}>
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


          <div className="absolute top-4 right-4 flex items-center space-x-2 glass rounded-lg p-2 backdrop-blur-sm">
            <div className="w-2 h-2 bg-destructive rounded-full pulse-animation"></div>
            <span className="text-xs text-white">REC</span>
          </div>

          {isProcessing && (
            <div className="absolute top-20 right-4 glass rounded-lg p-2 backdrop-blur-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-accent rounded-full pulse-animation"></div>
                <span className="text-xs text-white">AI Processing...</span>
              </div>
            </div>
          )}

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
        
        <div className="space-y-4">
          {yoloError && (
            <div className="bg-destructive/20 border border-destructive/50 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <span className="text-sm text-destructive">SSDLite MobileNetV2 Error: {yoloError}</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Using fallback detection mode for demonstration purposes
              </p>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                onClick={handlePlayPause}
                className={isActive ? "gradient-danger hover:opacity-90" : "gradient-primary hover:opacity-90"}
                disabled={!isModelLoaded && !yoloError}
              >
                {isActive ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                {isActive ? "Stop Monitoring" : "Start Monitoring"}
              </Button>
              <Button variant="outline" className="bg-slate-700 hover:bg-slate-600 border-slate-600">
                <Camera className="mr-2 h-4 w-4" />
                Snapshot
              </Button>
              <div className="flex items-center space-x-2 text-xs text-slate-400">
                <Brain className="h-3 w-3" />
                <span>
                  {isModelLoaded ? "SSDLite MobileNetV2 Ready" : "Loading SSDLite MobileNetV2..."}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button 
                onClick={toggleFullscreen}
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-slate-700"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
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
        </div>
      </CardContent>
    </Card>
  );
};

export default CameraMonitoring;
