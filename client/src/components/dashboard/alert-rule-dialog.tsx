import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertRule, DETECTION_CLASSES } from "@/types/alerts";

interface AlertRuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateRule: (rule: Omit<AlertRule, 'id' | 'createdAt'>) => void;
}

export default function AlertRuleDialog({ open, onOpenChange, onCreateRule }: AlertRuleDialogProps) {
  const [name, setName] = useState("");
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [timeWindowSeconds, setTimeWindowSeconds] = useState(30);
  const [detectionThreshold, setDetectionThreshold] = useState(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || selectedClasses.length === 0) {
      return;
    }

    onCreateRule({
      name: name.trim(),
      classTypes: selectedClasses,
      timeWindowSeconds,
      detectionThreshold,
      enabled: true
    });

    // Reset form
    setName("");
    setSelectedClasses([]);
    setTimeWindowSeconds(30);
    setDetectionThreshold(5);
  };

  const handleClassToggle = (className: string, checked: boolean) => {
    if (checked) {
      setSelectedClasses(prev => [...prev, className]);
    } else {
      setSelectedClasses(prev => prev.filter(c => c !== className));
    }
  };

  const getClassColor = (className: string): string => {
    switch (className) {
      case "person": return "text-green-400";
      case "car":
      case "bus":
      case "truck": return "text-orange-400";
      case "bicycle":
      case "motorcycle": return "text-blue-400";
      case "cat":
      case "dog": return "text-red-400";
      default: return "text-purple-400";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle>Create Alert Rule</DialogTitle>
          <DialogDescription className="text-slate-400">
            Configure detection thresholds to trigger alerts when specific conditions are met.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Alert Name</Label>
            <Input
              id="name"
              placeholder="e.g., High Person Activity"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Detection Classes</Label>
            <div className="grid grid-cols-2 gap-2 p-3 bg-slate-700/50 rounded-lg">
              {DETECTION_CLASSES.map((className) => (
                <div key={className} className="flex items-center space-x-2">
                  <Checkbox
                    id={className}
                    checked={selectedClasses.includes(className)}
                    onCheckedChange={(checked) => handleClassToggle(className, !!checked)}
                  />
                  <Label 
                    htmlFor={className} 
                    className={`capitalize cursor-pointer ${getClassColor(className)}`}
                  >
                    {className}
                  </Label>
                </div>
              ))}
            </div>
            {selectedClasses.length === 0 && (
              <p className="text-sm text-red-400">Select at least one detection class</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timeWindow">Time Window (seconds)</Label>
              <Input
                id="timeWindow"
                type="number"
                min="5"
                max="300"
                value={timeWindowSeconds}
                onChange={(e) => setTimeWindowSeconds(parseInt(e.target.value) || 30)}
                className="bg-slate-700 border-slate-600 text-white"
              />
              <p className="text-xs text-slate-400">
                Detection window: 5-300 seconds
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="threshold">Detection Threshold</Label>
              <Input
                id="threshold"
                type="number"
                min="1"
                max="100"
                value={detectionThreshold}
                onChange={(e) => setDetectionThreshold(parseInt(e.target.value) || 5)}
                className="bg-slate-700 border-slate-600 text-white"
              />
              <p className="text-xs text-slate-400">
                Minimum detections to trigger
              </p>
            </div>
          </div>

          <div className="bg-slate-700/30 p-3 rounded-lg">
            <p className="text-sm text-slate-300">
              <strong>Preview:</strong> Alert will trigger when {detectionThreshold}+ 
              {selectedClasses.length > 0 && (
                <span className="text-accent">
                  {' '}({selectedClasses.join(', ')})
                </span>
              )} 
              {' '}detections occur within {timeWindowSeconds} seconds.
            </p>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!name.trim() || selectedClasses.length === 0}
              className="bg-accent hover:bg-accent/90"
            >
              Create Alert
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}