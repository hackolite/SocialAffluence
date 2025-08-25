import React, { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Maximize,
  Minimize,
  Eye,
} from "lucide-react";

interface GlobalVideoProps {
  className?: string;
  onVideoReady?: (videoElement: HTMLVideoElement) => void;
}

export const GlobalVideo: React.FC<GlobalVideoProps> = ({ 
  className = "",
  onVideoReady 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);

  const startCamera = useCallback(async (): Promise<void> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "environment",
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraError(null);
      }
    } catch (err) {
      console.error("Camera access error:", err);
      const error = err as Error;
      setCameraError(
        error.name === "NotAllowedError"
          ? "Camera access denied. Please allow camera access."
          : "Unable to access camera.",
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

  // Notify parent when video is ready
  useEffect(() => {
    if (videoRef.current && onVideoReady) {
      onVideoReady(videoRef.current);
    }
  }, [onVideoReady]);

  // Auto-start camera
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  return (
    <div
      ref={videoContainerRef}
      className={`relative bg-slate-800 rounded-lg border border-slate-700 overflow-hidden group cursor-pointer ${
        isFullscreen
          ? "fixed inset-0 z-50 bg-black rounded-none border-none"
          : "aspect-video"
      } ${className}`}
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
  );
};

export default GlobalVideo;