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

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const startWebcam = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((d) => d.kind === "videoinput");

        // On cherche une caméra "back" (typiquement sur mobile)
        let preferredDevice = videoDevices.find((d) =>
          d.label.toLowerCase().includes("back")
        );

        if (!preferredDevice && videoDevices.length > 0) {
          preferredDevice = videoDevices[0]; // Fallback: première caméra
        }

        if (!preferredDevice) {
          console.error("Aucune caméra vidéo disponible.");
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: preferredDevice.deviceId },
          audio: false,
        });

        video.srcObject = stream;
      } catch (error) {
        console.error("Erreur d'accès à la webcam :", error);
      }
    };

    startWebcam();
  }, []);

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
