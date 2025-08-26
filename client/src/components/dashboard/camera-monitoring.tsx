import React, { useEffect, useRef, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Camera,
  Activity,
  Play,
  Pause,
  Eye,
  Maximize,
  Minimize,
  Download,
  Share,
  Brain,
  AlertCircle,
} from "lucide-react";
import { DetectionCounts } from "@/pages/dashboard";
import { useYoloDetection } from "@/hooks/use-yolo-detection";
import { debugLogger, createDebugContext } from "@shared/debug-logger";

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
  currentDetections,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  const [isActive, setIsActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [fps] = useState<number>(1);
  const [detectionBoxes, setDetectionBoxes] = useState<DetectionBox[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>("Camera");
  const [currentTimestamp, setCurrentTimestamp] = useState<string>("");
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);
  const cardRef = useRef<HTMLDivElement>(null);

  // Debug context for this component
  const debugContext = createDebugContext('CameraMonitoring');

  // YOLO detection hook
  const {
    detectObjects,
    isModelLoaded,
    isProcessing,
    error: yoloError,
  } = useYoloDetection();

  debugLogger.debug(debugContext, 'Component initialized', {
    initialState: { isActive, fps, selectedCamera, isFullscreen },
    yoloState: { isModelLoaded, isProcessing, yoloError }
  });

  const startCamera = useCallback(async (): Promise<void> => {
    const cameraContext = { ...debugContext, operation: 'startCamera' };
    debugLogger.info(cameraContext, 'Starting camera access');
    
    try {
      debugLogger.debug(cameraContext, 'Requesting media devices permission', {
        constraints: {
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "environment",
          }
        }
      });
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "environment",
        },
      });

      debugLogger.info(cameraContext, 'Camera stream obtained successfully', {
        streamId: stream.id,
        tracks: stream.getVideoTracks().map(track => ({
          id: track.id,
          label: track.label,
          enabled: track.enabled,
          settings: track.getSettings()
        }))
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraError(null);
        debugLogger.debug(cameraContext, 'Stream assigned to video element');
      } else {
        debugLogger.warn(cameraContext, 'Video ref not available when setting stream');
      }
    } catch (err) {
      debugLogger.error(cameraContext, 'Camera access error', { error: err });
      console.error("Camera access error:", err);
      const error = err as Error;
      const errorMessage = error.name === "NotAllowedError"
        ? "Camera access denied. Please allow camera access."
        : "Unable to access camera.";
      setCameraError(errorMessage);
      debugLogger.warn(cameraContext, 'Camera error set', { errorMessage, errorType: error.name });
    }
  }, []);

  const stopCamera = useCallback((): void => {
    const cameraContext = { ...debugContext, operation: 'stopCamera' };
    debugLogger.info(cameraContext, 'Stopping camera stream');
    
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      debugLogger.debug(cameraContext, 'Stopping media tracks', { trackCount: tracks.length });
      
      tracks.forEach((track: MediaStreamTrack) => {
        track.stop();
        debugLogger.trace(cameraContext, 'Track stopped', { trackId: track.id, label: track.label });
      });
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
      debugLogger.debug(cameraContext, 'Video element source cleared');
    }

    setCameraError(null);
    debugLogger.info(cameraContext, 'Camera stopped successfully');
  }, []);

  const runYoloDetection = useCallback(async (): Promise<void> => {
    const detectionContext = { ...debugContext, operation: 'runYoloDetection' };
    
    if (!videoRef.current) {
      debugLogger.warn(detectionContext, 'No video reference available for detection');
      return;
    }

    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      debugLogger.warn(detectionContext, 'Video dimensions invalid for detection', {
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight
      });
      return;
    }

    debugLogger.time(detectionContext, 'fullDetectionCycle');
    
    try {
      debugLogger.debug(detectionContext, 'Starting detection cycle', {
        videoSize: { width: video.videoWidth, height: video.videoHeight },
        currentTimestamp: new Date().toISOString()
      });
      
      const detectedBoxes = await detectObjects(video);
      setDetectionBoxes(detectedBoxes);

      debugLogger.debug(detectionContext, 'Detection boxes received', {
        boxCount: detectedBoxes.length,
        boxes: detectedBoxes.map(box => ({
          class: box.class,
          confidence: box.confidence,
          position: { x: box.x, y: box.y },
          size: { width: box.width, height: box.height }
        }))
      });

      // Count detections by type
      let peopleCount = 0;
      const classCounts: Record<string, number> = {};

      detectedBoxes.forEach((box) => {
        // Count by specific class
        classCounts[box.class] = (classCounts[box.class] || 0) + 1;

        // Count people specifically
        if (box.class === "person") {
          peopleCount++;
        }
      });

      const newCounts = {
        total: detectedBoxes.length,
        people: peopleCount,
        classCounts,
      };

      debugLogger.info(detectionContext, 'Detection counts calculated', {
        counts: newCounts,
        classDistribution: Object.entries(classCounts).map(([cls, count]) => `${cls}: ${count}`)
      });

      onDetectionUpdate(newCounts);
      debugLogger.timeEnd(detectionContext, 'fullDetectionCycle');
    } catch (error) {
      debugLogger.timeEnd(detectionContext, 'fullDetectionCycle');
      debugLogger.error(detectionContext, 'YOLO detection error', { error });
      console.error("YOLO detection error:", error);
    }
  }, [detectObjects, onDetectionUpdate]);

  const drawDetections = useCallback((): void => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    detectionBoxes.forEach((box: DetectionBox) => {
      // Different colors for different classes
      const getClassColor = (className: string): string => {
        switch (className) {
          case "person":
            return "#10B981"; // Green
          case "car":
          case "bus":
          case "truck":
            return "#F59E0B"; // Orange
          case "bicycle":
          case "motorcycle":
            return "#3B82F6"; // Blue
          case "cat":
          case "dog":
            return "#EF4444"; // Red
          default:
            return "#8B5CF6"; // Purple
        }
      };

      const color = getClassColor(box.class);
      ctx.strokeStyle = color;
      ctx.lineWidth = isFullscreen ? 30 : 20;
      ctx.strokeRect(box.x, box.y, box.width, box.height);

      ctx.fillStyle = color;
      ctx.font = isFullscreen ? "70px Arial" : "70px Arial";
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

  // Gestion du plein écran pour le conteneur vidéo
  const toggleFullscreen = useCallback(async () => {
    if (!videoContainerRef.current) return;

    try {
      if (!isFullscreen) {
        // Entrer en plein écran
        if (videoContainerRef.current.requestFullscreen) {
          await videoContainerRef.current.requestFullscreen();
        } else if ((videoContainerRef.current as any).webkitRequestFullscreen) {
          await (videoContainerRef.current as any).webkitRequestFullscreen();
        } else if ((videoContainerRef.current as any).msRequestFullscreen) {
          await (videoContainerRef.current as any).msRequestFullscreen();
        }
      } else {
        // Sortir du plein écran
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }
      }
    } catch (error) {
      console.error("Erreur lors du basculement en plein écran:", error);
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

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("msfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange,
      );
      document.removeEventListener(
        "msfullscreenchange",
        handleFullscreenChange,
      );
    };
  }, []);

  // Auto-hide controls in fullscreen
  useEffect(() => {
    let hideTimeout: NodeJS.Timeout;

    if (isFullscreen) {
      const handleMouseMove = () => {
        setShowControls(true);
        clearTimeout(hideTimeout);
        hideTimeout = setTimeout(() => {
          setShowControls(false);
        }, 3000);
      };

      const handleMouseLeave = () => {
        clearTimeout(hideTimeout);
        hideTimeout = setTimeout(() => {
          setShowControls(false);
        }, 1000);
      };

      if (videoContainerRef.current) {
        videoContainerRef.current.addEventListener(
          "mousemove",
          handleMouseMove,
        );
        videoContainerRef.current.addEventListener(
          "mouseleave",
          handleMouseLeave,
        );
      }

      // Initial hide timer
      hideTimeout = setTimeout(() => {
        setShowControls(false);
      }, 3000);

      return () => {
        clearTimeout(hideTimeout);
        if (videoContainerRef.current) {
          videoContainerRef.current.removeEventListener(
            "mousemove",
            handleMouseMove,
          );
          videoContainerRef.current.removeEventListener(
            "mouseleave",
            handleMouseLeave,
          );
        }
      };
    } else {
      setShowControls(true);
    }
  }, [isFullscreen]);

  useEffect(() => {
    const updateTimestamp = () => {
      const now = new Date();
      setCurrentTimestamp(
        now.toLocaleString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }),
      );
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
    <Card ref={cardRef} className="glass">
      <CardHeader className={isFullscreen ? "hidden" : ""}>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-white">
            <Camera className="mr-2 h-5 w-5 text-primary" />
            Live Affluence Monitoring
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge
              variant={isActive ? "default" : "secondary"}
              className="bg-slate-700"
            >
              <Activity className="mr-1 h-3 w-3" />
              {isActive ? `${fps} FPS` : "OFF"}
            </Badge>
            <Badge
              variant={isModelLoaded ? "default" : "secondary"}
              className="bg-slate-700"
            >
              <Brain className="mr-1 h-3 w-3" />
              {isModelLoaded ? "SSDLite" : "LOADING"}
            </Badge>
            {yoloError && (
              <Badge variant="destructive" className="bg-destructive">
                <AlertCircle className="mr-1 h-3 w-3" />
                FALLBACK
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className={isFullscreen ? "p-0" : ""}>
        <div
          ref={videoContainerRef}
          className={`relative bg-slate-800 rounded-lg border border-slate-700 overflow-hidden mb-4 group cursor-pointer ${
            isFullscreen
              ? "fixed inset-0 z-50 bg-black rounded-none border-none mb-0"
              : "aspect-video"
          }`}
          onClick={isFullscreen ? undefined : toggleFullscreen}
        >
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            muted
            playsInline
            style={{ display: cameraError ? "none" : "block" }}
          />
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
          />

          {/* Bouton Fullscreen dans la vidéo */}
          <div
            className={`absolute top-4 left-4 transition-opacity duration-300 ${
              showControls ? "opacity-100" : "opacity-0"
            }`}
          >
            <Button
              onClick={(e) => {
                e.stopPropagation();
                toggleFullscreen();
              }}
              variant="ghost"
              size="icon"
              className={`glass backdrop-blur-md text-white hover:bg-white/20 border border-white/20 ${
                isFullscreen ? "h-12 w-12" : "h-10 w-10"
              }`}
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreen ? (
                <Minimize className={isFullscreen ? "h-6 w-6" : "h-4 w-4"} />
              ) : (
                <Maximize className={isFullscreen ? "h-6 w-6" : "h-4 w-4"} />
              )}
            </Button>
          </div>

          {/* Indicateur REC */}
          <div
            className={`absolute top-4 right-4 flex items-center space-x-2 glass rounded-lg p-2 backdrop-blur-sm transition-opacity duration-300 ${
              showControls ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="w-2 h-2 bg-destructive rounded-full pulse-animation"></div>
            <span className="text-xs text-white">REC</span>
          </div>

          {/* Indicateur AI Processing */}
          {isProcessing && (
            <div
              className={`absolute top-20 right-4 glass rounded-lg p-2 backdrop-blur-sm transition-opacity duration-300 ${
                showControls ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-accent rounded-full pulse-animation"></div>
                <span className="text-xs text-white">AI Processing...</span>
              </div>
            </div>
          )}

          {/* Timestamp */}
          <div
            className={`absolute bottom-4 right-4 glass rounded-lg p-2 backdrop-blur-sm transition-opacity duration-300 ${
              showControls ? "opacity-100" : "opacity-0"
            }`}
          >
            <span className="text-xs text-slate-200">{currentTimestamp}</span>
          </div>

          {/* Instructions pour le plein écran (non-fullscreen seulement) */}
          {!isFullscreen && !cameraError && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20">
              <div className="glass rounded-lg p-4 backdrop-blur-md">
                <div className="flex items-center space-x-2 text-white">
                  <Maximize className="h-5 w-5" />
                  <span className="text-sm">Click to enter fullscreen</span>
                </div>
              </div>
            </div>
          )}

          {/* Erreur caméra */}
          {cameraError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
              <div className="text-center">
                <Eye className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">{cameraError}</p>
              </div>
            </div>
          )}
        </div>

        {/* Contrôles (masqués en plein écran) */}
        <div className={`space-y-4 ${isFullscreen ? "hidden" : ""}`}>
          {yoloError && (
            <div className="bg-destructive/20 border border-destructive/50 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <span className="text-sm text-destructive">
                  SSDLite MobileNetV2 Error: {yoloError}
                </span>
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
                className={
                  isActive
                    ? "gradient-danger hover:opacity-90"
                    : "gradient-primary hover:opacity-90"
                }
                disabled={!isModelLoaded && !yoloError}
              >
                {isActive ? (
                  <Pause className="mr-2 h-4 w-4" />
                ) : (
                  <Play className="mr-2 h-4 w-4" />
                )}
                {isActive ? "Stop Monitoring" : "Start Monitoring"}
              </Button>

            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-slate-700"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-slate-700"
              >
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
