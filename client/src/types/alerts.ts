export interface AlertRule {
  id: string;
  name: string;
  classTypes: string[];
  timeWindowSeconds: number;
  detectionThreshold: number;
  enabled: boolean;
  createdAt: Date;
}

export interface TriggeredAlert {
  id: string;
  ruleId: string;
  ruleName: string;
  triggeredAt: Date;
  detectionCount: number;
  classTypes: string[];
  timeWindowSeconds: number;
  threshold: number;
}

export const DETECTION_CLASSES = [
  'person',
  'car', 
  'bus',
  'truck',
  'bicycle',
  'motorcycle',
  'cat',
  'dog'
] as const;

export type DetectionClass = typeof DETECTION_CLASSES[number];