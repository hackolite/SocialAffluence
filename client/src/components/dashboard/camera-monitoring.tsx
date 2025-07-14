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
      streamRef.current.getTracks().forEach((track: MediaStreamTrack) => track.stop());
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

      let peopleCount = 0;
      const classCounts: Record<string, number> = {};

      detectedBoxes.forEach(box => {
        classCounts[box.class] = (classCounts[box.class] || 0) + 1;
        if (box.class === 'person') peopleCount++;
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

    detectionBoxes.forEach(box => {
      const getClassColor = (className: string): string => {
        switch (className) {
          case 'person': return '#10B981';
          case 'car': case 'bus': case 'truck': return '#F59E0B';
          case 'bicycle': case 'motorcycle': return '#3B82F6';
          case 'cat': case 'dog': return '#EF4444';
          default: return '#8B5CF6';
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

  const toggleFullscreen = useCallback(async () => {
    if (!cardRef.current) return;
    try {
      if (!isFullscreen) {
        await cardRef.current.requestFullscreen?.();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen?.();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  }, [isFullscreen]);

  useEffect(() => {
    const updateTimestamp = () => {
      const now = new Date();
      setCurrentTimestamp(now.toLocaleString('en-US', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
      }));
    };
    updateTimestamp();
    const timestampInterval = setInterval(updateTimestamp, 1000);
    return () => {
      clearInterval(timestampInterval);
      stopCamera();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [stopCamera]);

  useEffect(() => {
    if (isActive) drawDetections();
  }, [detectionBoxes, isActive, drawDetections]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isCurrentlyFullscreen);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <Card ref={cardRef} className={`glass ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : ''}`}>
      {/* UI code omitted for brevity */}
    </Card>
  );
};

export default CameraMonitoring;
