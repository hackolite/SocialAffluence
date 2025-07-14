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

  // Initialise la webcam
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

  // Observe les changements de taille (notamment après un fullscreen)
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !video.parentElement) return;

    const observer = new ResizeObserver(() => {
      video.style.width = "100%";
      video.style.height = "auto";
    });

    observer.observe(video.parentElement);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="w-full h-auto rounded-lg overflow-hidden bg-black">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-auto object-contain"
      />
    </div>
  );
}
