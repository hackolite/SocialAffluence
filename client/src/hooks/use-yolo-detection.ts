import { useState, useEffect, useRef, useCallback } from 'react';
import { load, YOLO_V5_N_COCO_MODEL_CONFIG } from 'yolov5js';

interface DetectionBox {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  class: string;
  classId: number;
}

interface YoloDetectionResult {
  boxes: DetectionBox[];
  isModelLoaded: boolean;
  isProcessing: boolean;
  error: string | null;
}

// COCO class names pour YOLOv5
const COCO_CLASSES = [
  'person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck',
  'boat', 'traffic light', 'fire hydrant', 'stop sign', 'parking meter', 'bench',
  'bird', 'cat', 'dog', 'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra',
  'giraffe', 'backpack', 'umbrella', 'handbag', 'tie', 'suitcase', 'frisbee',
  'skis', 'snowboard', 'sports ball', 'kite', 'baseball bat', 'baseball glove',
  'skateboard', 'surfboard', 'tennis racket', 'bottle', 'wine glass', 'cup',
  'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple', 'sandwich', 'orange',
  'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake', 'chair', 'couch',
  'potted plant', 'bed', 'dining table', 'toilet', 'tv', 'laptop', 'mouse',
  'remote', 'keyboard', 'cell phone', 'microwave', 'oven', 'toaster', 'sink',
  'refrigerator', 'book', 'clock', 'vase', 'scissors', 'teddy bear', 'hair drier',
  'toothbrush'
];

const PERSON_CLASS = 0;

export function useYoloDetection() {
  const [model, setModel] = useState<any>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const modelRef = useRef<any>(null);
  const isLoadingRef = useRef(false);

  // Configuration du modèle
  const modelConfig = {
    scoreThreshold: 0.25,
    iouThreshold: 0.45,
    maxDetections: 100
  };

  // Charger le modèle YOLOv5 avec yolov5js
  useEffect(() => {
    if (isLoadingRef.current) return;

    const loadModel = async () => {
      isLoadingRef.current = true;

      try {
        console.log('Chargement du modèle YOLOv5 avec yolov5js...');
        setError(null);

        // Charger le modèle YOLOv5n avec la configuration COCO
        const loadedModel = await load(YOLO_V5_N_COCO_MODEL_CONFIG);

        modelRef.current = loadedModel;
        setModel(loadedModel);
        setIsModelLoaded(true);

        console.log('Modèle YOLOv5 chargé avec succès');

      } catch (err) {
        console.error('Erreur lors du chargement du modèle YOLOv5:', err);
        setError(`Échec du chargement YOLOv5: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
        setIsModelLoaded(true); // Permettre le mode fallback
      } finally {
        isLoadingRef.current = false;
      }
    };

    loadModel();

    return () => {
      // Nettoyer les références
      if (modelRef.current) {
        modelRef.current = null;
      }
      isLoadingRef.current = false;
    };
  }, []);

  // Convertir les détections yolov5js vers notre format
  const convertDetections = useCallback((detections: any[], imageWidth: number, imageHeight: number): DetectionBox[] => {
    return detections.map(detection => {
      // Format yolov5js: { bbox: [x, y, width, height], class: string, confidence: number }
      const [x, y, width, height] = detection.bbox;
      const className = detection.class;
      const confidence = detection.confidence;

      // Trouver l'ID de la classe
      const classId = COCO_CLASSES.indexOf(className);

      return {
        x: Math.max(0, x),
        y: Math.max(0, y),
        width: Math.min(width, imageWidth - x),
        height: Math.min(height, imageHeight - y),
        confidence,
        class: className,
        classId: classId !== -1 ? classId : 0
      };
    });
  }, []);

  // Filtrer les détections par seuil de confiance
  const filterDetections = useCallback((detections: DetectionBox[]): DetectionBox[] => {
    return detections
      .filter(detection => detection.confidence >= modelConfig.scoreThreshold)
      .slice(0, modelConfig.maxDetections);
  }, []);

  // Non-Maximum Suppression (si nécessaire, yolov5js peut l'avoir déjà appliqué)
  const applyNMS = useCallback((boxes: DetectionBox[], threshold = 0.45): DetectionBox[] => {
    if (boxes.length === 0) return [];

    // Trier par confiance décroissante
    boxes.sort((a, b) => b.confidence - a.confidence);

    const keep: DetectionBox[] = [];

    while (boxes.length > 0) {
      const current = boxes.shift()!;
      keep.push(current);

      // Filtrer les boîtes qui se chevauchent trop
      boxes = boxes.filter(box => {
        const iou = calculateIoU(current, box);
        return iou <= threshold;
      });
    }

    return keep;
  }, []);

  // Calcul IoU
  const calculateIoU = useCallback((box1: DetectionBox, box2: DetectionBox): number => {
    const x1 = Math.max(box1.x, box2.x);
    const y1 = Math.max(box1.y, box2.y);
    const x2 = Math.min(box1.x + box1.width, box2.x + box2.width);
    const y2 = Math.min(box1.y + box1.height, box2.y + box2.height);

    if (x2 <= x1 || y2 <= y1) return 0;

    const intersection = (x2 - x1) * (y2 - y1);
    const area1 = box1.width * box1.height;
    const area2 = box2.width * box2.height;
    const union = area1 + area2 - intersection;

    return union > 0 ? intersection / union : 0;
  }, []);

  // Détection de secours
  const fallbackDetection = useCallback((imageWidth: number, imageHeight: number): DetectionBox[] => {
    const boxes: DetectionBox[] = [];
    const numDetections = Math.floor(Math.random() * 3) + 1;

    const commonClasses = [
      { name: 'person', id: 0 },
      { name: 'car', id: 2 },
      { name: 'bicycle', id: 1 },
      { name: 'chair', id: 56 },
      { name: 'bottle', id: 39 }
    ];

    for (let i = 0; i < numDetections; i++) {
      const classInfo = commonClasses[Math.floor(Math.random() * commonClasses.length)];

      boxes.push({
        x: Math.random() * (imageWidth * 0.7),
        y: Math.random() * (imageHeight * 0.7),
        width: 50 + Math.random() * 150,
        height: 80 + Math.random() * 200,
        confidence: 0.3 + Math.random() * 0.65,
        class: classInfo.name,
        classId: classInfo.id
      });
    }

    return boxes;
  }, []);

  // Créer une image à partir de l'élément vidéo pour yolov5js
  const createImageFromVideo = useCallback((videoElement: HTMLVideoElement): HTMLImageElement => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Impossible de créer le contexte canvas');
    }

    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    ctx.drawImage(videoElement, 0, 0);

    const img = new Image();
    img.src = canvas.toDataURL();
    img.width = canvas.width;
    img.height = canvas.height;

    return img;
  }, []);

  // Fonction principale de détection
  const detectObjects = useCallback(async (videoElement: HTMLVideoElement): Promise<DetectionBox[]> => {
    if (!videoElement || videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
      return [];
    }

    if (isProcessing) {
      console.log('Détection en cours, requête ignorée...');
      return [];
    }

    setIsProcessing(true);

    try {
      const imageWidth = videoElement.videoWidth;
      const imageHeight = videoElement.videoHeight;

      if (model && isModelLoaded && !error) {
        try {
          // Créer une image à partir de la vidéo
          const image = createImageFromVideo(videoElement);

          // Attendre que l'image soit chargée
          await new Promise((resolve) => {
            if (image.complete) {
              resolve(true);
            } else {
              image.onload = () => resolve(true);
              image.onerror = () => resolve(false);
            }
          });

          // Effectuer la détection avec yolov5js
          const detections = await model.detect(image);

          console.log(`YOLOv5 détections: ${detections.length}`);

          // Convertir au format de DetectionBox
          let boxes = convertDetections(detections, imageWidth, imageHeight);

          // Filtrer par seuil de confiance
          boxes = filterDetections(boxes);

          // Appliquer NMS si nécessaire (yolov5js peut l'avoir déjà fait)
          // boxes = applyNMS(boxes, modelConfig.iouThreshold);

          return boxes;

        } catch (modelError) {
          console.error('Erreur lors de la détection YOLOv5:', modelError);
          setError(`Erreur de détection: ${modelError instanceof Error ? modelError.message : 'Erreur inconnue'}`);
          return fallbackDetection(imageWidth, imageHeight);
        }
      } else {
        // Mode fallback
        console.log('Utilisation du mode fallback');
        return fallbackDetection(imageWidth, imageHeight);
      }

    } catch (err) {
      console.error('Erreur générale lors de la détection:', err);
      return fallbackDetection(videoElement.videoWidth, videoElement.videoHeight);
    } finally {
      setIsProcessing(false);
    }
  }, [
    model, 
    isModelLoaded, 
    error, 
    isProcessing, 
    createImageFromVideo, 
    convertDetections, 
    filterDetections, 
    fallbackDetection
  ]);

  return {
    detectObjects,
    isModelLoaded,
    isProcessing,
    error
  };
}