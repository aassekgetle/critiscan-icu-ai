
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ClipboardList, Clock, AlertTriangle, CheckCircle, Target } from 'lucide-react';

interface TreatmentPlanProps {
  data: {
    abg?: any;
    ventilator?: any;
    labs?: any;
  };
}

const TreatmentPlan = ({ data }: TreatmentPlanProps) => {
  const generateTreatmentPlan = () => {
    const plan = {
      immediate: [],
      ventilator: [],
      medications: [],
      monitoring: []
    };

    // Analyze ABG data
    if (data.abg) {
      const { pH, paCO2, paO2, hco3, fio2 } = data.abg;
      const pfRatio = paO2 / (fio2 / 100);
      
      if (pH < 7.2) {
        plan.immediate.push({
          priority: 'critical',
          action: 'Address severe acidemia',
          detail: 'Consider sodium bicarbonate if pH <7.1',
          timeframe: 'Immediate'
        });
      }
      
      if (pfRatio < 200) {
        plan.immediate.push({
          priority: 'critical',
          action: 'ARDS management protocol',
          detail: 'Lung-protective ventilation, prone positioning',
          timeframe: 'Immediate'
        });
      }
    }

    // Analyze ventilator data
    if (data.ventilator) {
      const { peep, tidalVolume, fio2 } = data.ventilator;
      const tidalVolumePerKg = tidalVolume / 70; // assuming 70kg IBW
      
      if (tidalVolumePerKg > 6) {
        plan.ventilator.push({
          priority: 'high',
          action: 'Reduce tidal volume',
          detail: `Target 6 mL/kg IBW (${Math.round(70 * 6)} mL)`,
          timeframe: 'Now'
        });
      }
      
      if (peep < 10 && data.abg?.paO2 < 80) {
        plan.ventilator.push({
          priority: 'high',
          action: 'Increase PEEP',
          detail: 'Titrate PEEP to 10-12 cmH₂O for recruitment',
          timeframe: 'Within 15 min'
        });
      }
    }

    // Analyze lab data
    if (data.labs) {
      const { potassium, lactate, hemoglobin, calcium, magnesium } = data.labs;
      
      if (potassium >= 6.0) {
        plan.immediate.push({
          priority: 'critical',
          action: 'Treat hyperkalemia',
          detail: 'Calcium gluconate 1g IV → Insulin/D50 → Albuterol',
          timeframe: 'Immediate'
        });
      }
      
      if (lactate >= 4.0) {
        plan.immediate.push({
          priority: 'critical',
          action: 'Sepsis protocol',
          detail: 'Blood cultures × 2, broad-spectrum antibiotics',
          timeframe: 'Within 1 hour'
        });
      }
      
      if (calcium < 8.5) {
        plan.medications.push({
          priority: 'moderate',
          action: 'Correct hypocalcemia',
          detail: 'Calcium gluconate 1-2g IV over 10 minutes',
          timeframe: 'Within 30 min'
        });
      }
      
      if (magnesium < 1.8) {
        plan.medications.push({
          priority: 'moderate',
          action: 'Magnesium replacement',
          detail: 'MgSO₄ 2-4g IV over 4 hours',
          timeframe: 'Within 1 hour'
        });
      }
    }

    // Generate monitoring plan
    plan.monitoring = [
      {
        priority: 'high',
        action: 'Repeat ABG',
        detail: 'Check pH, PaCO₂ response to interventions',
        timeframe: '30 minutes'
      },
      {
        priority: 'moderate',
        action: 'Basic metabolic panel',
        detail: 'Monitor K⁺, Ca²⁺, Mg²⁺ after replacements',
        timeframe: '1-2 hours'
      },
      {
        priority: 'moderate',
        action: 'Lactate trend',
        detail: 'Serial lactates q2h if elevated',
        timeframe: '2 hours'
      }
    ];

    return plan;
  };

  const plan = generateTreatmentPlan();
  const hasData = data.abg || data.ventilator || data.labs;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'secondary';
      case 'moderate': return 'outline';
      default: return 'default';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'high': return <Target className="h-4 w-4 text-amber-600" />;
      default: return <CheckCircle className="h-4 w-4 text-blue-600" />;
    }
  };

  if (!hasData) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Upload clinical data to generate treatment plan</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Alert */}
      <Alert className="border-blue-200 bg-blue-50">
        <ClipboardList className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          Comprehensive treatment plan generated based on uploaded clinical data
        </AlertDescription>
      </Alert>

      {/* Immediate Actions */}
      {plan.immediate.length > 0 && (
        <Card className="border-red-200">
          <CardHeader className="bg-red-50">
            <CardTitle className="flex items-center gap-2 text-red-900">
              <AlertTriangle className="h-5 w-5" />
              Immediate Actions Required
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {plan.immediate.map((action, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-red-200">
                  {getPriorityIcon(action.priority)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-gray-900">{action.action}</h4>
                      <Badge variant={getPriorityColor(action.priority) as any}>
                        {action.timeframe}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{action.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ventilator Management */}
      {plan.ventilator.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Ventilator Adjustments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {plan.ventilator.map((action, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  {getPriorityIcon(action.priority)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-gray-900">{action.action}</h4>
                      <Badge variant={getPriorityColor(action.priority) as any}>
                        {action.timeframe}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{action.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Medications */}
      {plan.medications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Medication Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {plan.medications.map((action, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  {getPriorityIcon(action.priority)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-gray-900">{action.action}</h4>
                      <Badge variant={getPriorityColor(action.priority) as any}>
                        {action.timeframe}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{action.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Monitoring Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-purple-600" />
            Follow-up & Monitoring
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {plan.monitoring.map((action, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                {getPriorityIcon(action.priority)}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-gray-900">{action.action}</h4>
                    <Badge variant={getPriorityColor(action.priority) as any}>
                      {action.timeframe}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{action.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Educational Note */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-900 mb-2">Clinical Decision Support</h4>
              <p className="text-sm text-amber-800">
                This treatment plan provides evidence-based recommendations. Always correlate with clinical 
                presentation and institutional protocols. Critical values require immediate physician notification 
                and bedside assessment.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TreatmentPlan;
