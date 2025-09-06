import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Plus, Settings, X } from "lucide-react";
import { AlertRule, TriggeredAlert, DETECTION_CLASSES, DetectionClass } from "@/types/alerts";
import { DetectionCounts } from "@/pages/dashboard";
import AlertRuleDialog from "./alert-rule-dialog";
import { useAlertMelody } from "@/hooks/useAlertMelody";

interface AlertManagementProps {
  currentDetections: DetectionCounts;
}

export default function AlertManagement({ currentDetections }: AlertManagementProps) {
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [triggeredAlerts, setTriggeredAlerts] = useState<TriggeredAlert[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [detectionHistory, setDetectionHistory] = useState<Array<{
    timestamp: number;
    classCounts: Record<string, number>;
  }>>([]);

  // Initialize alert melody hook
  const { playMelody } = useAlertMelody();

  // Track detection history for time windows
  useEffect(() => {
    if (currentDetections.total > 0) {
      const now = Date.now();
      setDetectionHistory(prev => {
        const newHistory = [...prev, {
          timestamp: now,
          classCounts: currentDetections.classCounts
        }];
        
        // Keep only last 5 minutes of history (300 seconds)
        const fiveMinutesAgo = now - 300000;
        return newHistory.filter(item => item.timestamp > fiveMinutesAgo);
      });
    }
  }, [currentDetections]);

  // Check alert rules against detection history
  useEffect(() => {
    alertRules.forEach(rule => {
      if (!rule.enabled) return;

      const now = Date.now();
      const windowStart = now - (rule.timeWindowSeconds * 1000);
      
      // Get detections within the time window
      const relevantDetections = detectionHistory.filter(
        detection => detection.timestamp >= windowStart
      );

      // Count total detections for the specified classes
      let totalDetections = 0;
      relevantDetections.forEach(detection => {
        rule.classTypes.forEach(classType => {
          totalDetections += detection.classCounts[classType] || 0;
        });
      });

      // Check if threshold is exceeded
      if (totalDetections >= rule.detectionThreshold) {
        // Check if we already have a recent alert for this rule (configurable timeout)
        const reactivationTimeout = rule.reactivationTimeoutSeconds || 60; // Default to 60 seconds for existing rules
        const recentAlert = triggeredAlerts.find(alert => 
          alert.ruleId === rule.id && 
          (now - alert.triggeredAt.getTime()) < (reactivationTimeout * 1000)
        );

        if (!recentAlert) {
          const newAlert: TriggeredAlert = {
            id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            ruleId: rule.id,
            ruleName: rule.name,
            triggeredAt: new Date(),
            detectionCount: totalDetections,
            classTypes: rule.classTypes,
            timeWindowSeconds: rule.timeWindowSeconds,
            threshold: rule.detectionThreshold
          };

          setTriggeredAlerts(prev => [newAlert, ...prev.slice(0, 9)]); // Keep last 10 alerts
          
          // Play gentle melody when alert is triggered
          playMelody();
        }
      }
    });
  }, [detectionHistory, alertRules, triggeredAlerts]);

  const createAlertRule = (rule: Omit<AlertRule, 'id' | 'createdAt'>) => {
    const newRule: AlertRule = {
      ...rule,
      id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date()
    };
    setAlertRules(prev => [...prev, newRule]);
    setIsCreateDialogOpen(false);
  };

  const toggleRule = (ruleId: string) => {
    setAlertRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    ));
  };

  const deleteRule = (ruleId: string) => {
    setAlertRules(prev => prev.filter(rule => rule.id !== ruleId));
  };

  const dismissAlert = (alertId: string) => {
    setTriggeredAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const getTimeSince = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="text-lg text-white flex items-center justify-between">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-accent" />
            Alerts
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="text-white hover:bg-slate-700"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Triggered Alerts Section */}
        {triggeredAlerts.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-white mb-2">Recent Triggers</h4>
            <div className="space-y-2">
              {triggeredAlerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className="flex items-start justify-between p-2 bg-red-900/30 rounded-lg border border-red-700/50">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                      <p className="text-sm text-white font-medium">{alert.ruleName}</p>
                    </div>
                    <p className="text-xs text-slate-300 ml-4">
                      {alert.detectionCount} detections in {alert.timeWindowSeconds}s
                    </p>
                    <p className="text-xs text-slate-400 ml-4">{getTimeSince(alert.triggeredAt)}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-slate-400 hover:text-white h-6 w-6 p-0"
                    onClick={() => dismissAlert(alert.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Alert Rules Section */}
        <div>
          <h4 className="text-sm font-medium text-white mb-2">Alert Rules ({alertRules.length})</h4>
          {alertRules.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-slate-400">No alert rules configured</p>
              <Button 
                size="sm" 
                variant="outline" 
                className="mt-2"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                Create first rule
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {alertRules.map((rule) => (
                <div key={rule.id} className="flex items-center justify-between p-2 bg-slate-700/30 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${rule.enabled ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                      <p className="text-sm text-white">{rule.name}</p>
                    </div>
                    <p className="text-xs text-slate-400 ml-4">
                      {rule.classTypes.join(', ')} • {rule.detectionThreshold}+ in {rule.timeWindowSeconds}s
                    </p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-slate-400 hover:text-white h-6 w-6 p-0"
                      onClick={() => toggleRule(rule.id)}
                    >
                      <Settings className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-slate-400 hover:text-red-400 h-6 w-6 p-0"
                      onClick={() => deleteRule(rule.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>

      <AlertRuleDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreateRule={createAlertRule}
      />
    </Card>
  );
}