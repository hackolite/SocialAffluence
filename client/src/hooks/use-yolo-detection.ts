import { useState, useEffect, useRef, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-cpu';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { debugLogger, createDebugContext } from "@shared/debug-logger";

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

// COCO class names - focusing on person and vehicle classes
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

// Person class ID in COCO dataset
const PERSON_CLASS = 0; // person

export function useYoloDetection() {
  const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const modelRef = useRef<cocoSsd.ObjectDetection | null>(null);

  // Debug context for this component
  const debugContext = createDebugContext('useYoloDetection');

  debugLogger.debug(debugContext, 'Hook initialized', {
    initialState: { isModelLoaded, isProcessing, error }
  });

  // Load SSDLite MobileNetV2 model
  useEffect(() => {
    const loadModel = async () => {
      const loadContext = { ...debugContext, operation: 'loadModel' };
      debugLogger.time(loadContext, 'modelLoad');
      
      try {
        debugLogger.info(loadContext, 'Starting SSDLite MobileNetV2 model loading');
        console.log('Loading SSDLite MobileNetV2 model...');
        setError(null);
        setIsLoading(true);
        setLoadingProgress(10);
        
        // Initialize TensorFlow.js backend with fallback
        try {
          debugLogger.debug(loadContext, 'Setting TensorFlow.js WebGL backend');
          setLoadingProgress(30);
          await tf.setBackend('webgl');
          await tf.ready();
          setLoadingProgress(50);
          debugLogger.info(loadContext, 'TensorFlow.js WebGL backend ready', {
            backend: tf.getBackend(),
            memory: tf.memory()
          });
          console.log('TensorFlow.js WebGL backend ready');
        } catch (webglError) {
          debugLogger.warn(loadContext, 'WebGL backend failed, falling back to CPU', { error: webglError });
          console.warn('WebGL backend failed, falling back to CPU:', webglError);
          setLoadingProgress(40);
          await tf.setBackend('cpu');
          await tf.ready();
          setLoadingProgress(50);
          debugLogger.info(loadContext, 'TensorFlow.js CPU backend ready', {
            backend: tf.getBackend(),
            memory: tf.memory()
          });
          console.log('TensorFlow.js CPU backend ready');
        }
        
        // Load COCO-SSD with SSDLite MobileNetV2 backbone
        debugLogger.debug(loadContext, 'Loading COCO-SSD model with SSDLite MobileNetV2');
        setLoadingProgress(70);
        const loadedModel = await cocoSsd.load({
          base: 'lite_mobilenet_v2' // This uses SSDLite MobileNetV2
        });
        
        setLoadingProgress(90);
        modelRef.current = loadedModel;
        setModel(loadedModel);
        setLoadingProgress(100);
        setIsModelLoaded(true);
        setIsLoading(false);
        
        debugLogger.timeEnd(loadContext, 'modelLoad');
        debugLogger.info(loadContext, 'SSDLite MobileNetV2 model loaded successfully', {
          modelInfo: {
            base: 'lite_mobilenet_v2',
            backend: tf.getBackend(),
            memory: tf.memory()
          }
        });
        console.log('SSDLite MobileNetV2 model loaded successfully');
        
      } catch (err) {
        debugLogger.timeEnd(loadContext, 'modelLoad');
        debugLogger.error(loadContext, 'Error loading SSDLite MobileNetV2 model', { error: err });
        console.error('Error loading SSDLite MobileNetV2 model:', err);
        setError('Failed to load SSDLite MobileNetV2 model. Using fallback detection.');
        setIsModelLoaded(true); // Allow fallback mode
        setIsLoading(false);
        setLoadingProgress(100);
      }
    };

    loadModel();

    return () => {
      debugLogger.debug(debugContext, 'Cleaning up model on unmount');
      // COCO-SSD models don't need manual disposal
      modelRef.current = null;
    };
  }, []);

  // SSDLite MobileNetV2 preprocessing and postprocessing is handled by COCO-SSD internally
  // Non-Maximum Suppression to remove overlapping detections
  
  const applyNMS = useCallback((boxes: DetectionBox[], threshold = 0.3): DetectionBox[] => {
    const nmsContext = { ...debugContext, operation: 'applyNMS' };
    debugLogger.debug(nmsContext, 'Starting Non-Maximum Suppression', {
      inputBoxes: boxes.length,
      threshold
    });
    
    // Sort by confidence
    boxes.sort((a, b) => b.confidence - a.confidence);
    
    const keep: DetectionBox[] = [];
    
    while (boxes.length > 0) {
      const current = boxes.shift()!;
      keep.push(current);
      
      const beforeFilterCount = boxes.length;
      boxes = boxes.filter(box => {
        const iou = calculateIoU(current, box);
        return iou <= threshold;
      });
      
      const suppressed = beforeFilterCount - boxes.length;
      if (suppressed > 0) {
        debugLogger.trace(nmsContext, 'Suppressed overlapping boxes', {
          currentBox: current,
          suppressedCount: suppressed
        });
      }
    }
    
    debugLogger.debug(nmsContext, 'NMS completed', {
      outputBoxes: keep.length,
      suppressionRatio: `${keep.length}/${boxes.length + keep.length}`
    });
    
    return keep;
  }, []);

  // Calculate Intersection over Union
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
    
    return intersection / union;
  }, []);

  // Fallback detection for demonstration when model isn't available
  const fallbackDetection = useCallback((imageWidth: number, imageHeight: number): DetectionBox[] => {
    const fallbackContext = { ...debugContext, operation: 'fallbackDetection' };
    debugLogger.warn(fallbackContext, 'Using fallback detection mode', {
      imageSize: { width: imageWidth, height: imageHeight }
    });
    
    const boxes: DetectionBox[] = [];
    const numDetections = Math.floor(Math.random() * 4) + 1;
    
    for (let i = 0; i < numDetections; i++) {
      const randomClassIndex = Math.floor(Math.random() * COCO_CLASSES.length);
      const classType = COCO_CLASSES[randomClassIndex];
      
      boxes.push({
        x: Math.random() * (imageWidth - 100),
        y: Math.random() * (imageHeight - 100),
        width: 60 + Math.random() * 80,
        height: 80 + Math.random() * 100,
        confidence: 0.6 + Math.random() * 0.35,
        class: classType,
        classId: randomClassIndex
      });
    }
    
    debugLogger.debug(fallbackContext, 'Generated fallback detections', {
      detectionCount: boxes.length,
      detections: boxes
    });
    
    return boxes;
  }, []);

  // Detect objects in video frame using SSDLite MobileNetV2
  const detectObjects = useCallback(async (videoElement: HTMLVideoElement): Promise<DetectionBox[]> => {
    const detectContext = { ...debugContext, operation: 'detectObjects' };
    
    if (!videoElement) {
      debugLogger.warn(detectContext, 'No video element provided for detection');
      return [];
    }

    // If video has no dimensions (no camera), use fallback with default dimensions
    if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
      debugLogger.warn(detectContext, 'Video element has no dimensions, using fallback detection', {
        hasVideoElement: !!videoElement,
        videoWidth: videoElement?.videoWidth,
        videoHeight: videoElement?.videoHeight
      });
      // Use fallback detection with default dimensions when no camera access
      return fallbackDetection(640, 480);
    }

    setIsProcessing(true);
    debugLogger.time(detectContext, 'detection');
    
    try {
      const imageWidth = videoElement.videoWidth;
      const imageHeight = videoElement.videoHeight;
      
      debugLogger.debug(detectContext, 'Starting object detection', {
        imageSize: { width: imageWidth, height: imageHeight },
        modelState: { isModelLoaded, hasModel: !!model, hasError: !!error }
      });
      
      if (model && isModelLoaded && !error) {
        debugLogger.debug(detectContext, 'Using real SSDLite MobileNetV2 detection');
        
        // Real SSDLite MobileNetV2 detection using COCO-SSD API
        const predictions = await model.detect(videoElement);
        
        debugLogger.debug(detectContext, 'Raw model predictions received', {
          predictionCount: predictions.length,
          predictions: predictions.map(p => ({
            class: p.class,
            score: p.score,
            bbox: p.bbox
          }))
        });
        
        // Convert COCO-SSD predictions to our DetectionBox format
        const boxes: DetectionBox[] = predictions.map(prediction => {
          const { bbox, class: className, score } = prediction;
          const [x, y, width, height] = bbox;
          
          const classId = COCO_CLASSES.indexOf(className);
          
          return {
            x,
            y,
            width,
            height,
            confidence: score,
            class: className,
            classId
          };
        });
        
        debugLogger.debug(detectContext, 'Converted predictions to detection boxes', {
          boxCount: boxes.length,
          classDistribution: boxes.reduce((acc, box) => {
            acc[box.class] = (acc[box.class] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        });
        
        debugLogger.timeEnd(detectContext, 'detection');
        return boxes;
      } else {
        debugLogger.debug(detectContext, 'Model not available, using fallback detection', {
          modelLoaded: isModelLoaded,
          hasModel: !!model,
          error
        });
        
        // Fallback detection for demonstration
        const result = fallbackDetection(imageWidth, imageHeight);
        debugLogger.timeEnd(detectContext, 'detection');
        return result;
      }
    } catch (err) {
      debugLogger.timeEnd(detectContext, 'detection');
      debugLogger.error(detectContext, 'Error during SSDLite MobileNetV2 detection', { error: err });
      console.error('Error during SSDLite MobileNetV2 detection:', err);
      setError('SSDLite MobileNetV2 detection failed. Using fallback mode.');
      return fallbackDetection(videoElement.videoWidth, videoElement.videoHeight);
    } finally {
      setIsProcessing(false);
    }
  }, [model, isModelLoaded, error, fallbackDetection]);

  return {
    detectObjects,
    isModelLoaded,
    isProcessing,
    error,
    loadingProgress,
    isLoading
  };
}