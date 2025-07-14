import { useEffect, useRef } from "react";

interface DetectionCounts {
  total: number;
  people: number;
  classCounts: Record<string, number>;
}

interface CameraMonitoringProps {
  onDetectionUpdate: (counts: DetectionCounts) => void;
  currentDetections: DetectionCounts;
}

export default function CameraMonitoring({
  onDetectionUpdate,
  currentDetections,
}: CameraMonitoringProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Lance la webcam
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        video.srcObject = stream;
      } catch (error) {
        console.error("Erreur d'accès à la webcam :", error);
      }
    };

    startWebcam();
  }, []);

  // ResizeObserver : ajuste la taille du <video> si le conteneur change
  useEffect(() => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container || !video) return;

    const observer = new ResizeObserver(() => {
      video.style.width = "100%";
      video.style.height = "auto";
    });

    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full aspect-video bg-black rounded-lg overflow-hidden"
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-contain"
      />
    </div>
  );
}
