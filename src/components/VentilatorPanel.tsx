
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Activity, Settings, TrendingUp, TrendingDown, Target } from 'lucide-react';

interface VentilatorPanelProps {
  data: {
    mode: string;
    fio2: number;
    peep: number;
    tidalVolume: number;
    respiratoryRate: number;
  };
}

const VentilatorPanel = ({ data }: VentilatorPanelProps) => {
  const { mode, fio2, peep, tidalVolume, respiratoryRate } = data;

  // Calculate IBW (assuming 70kg for male, can be made dynamic)
  const idealBodyWeight = 70; // kg (this would be calculated from height/gender in real app)
  const tidalVolumePerKg = Math.round((tidalVolume / idealBodyWeight) * 10) / 10;

  // Determine if settings are appropriate for ARDS
  const isLungProtective = tidalVolumePerKg <= 6;
  const needsPEEPIncrease = peep < 10;
  const needsFiO2Adjustment = fio2 > 60;

  const getVentilatorRecommendations = () => {
    const recommendations = [];
    
    if (!isLungProtective) {
      recommendations.push({
        type: 'critical',
        message: `↓ Tidal Volume to ${Math.round(idealBodyWeight * 6)} mL (6 mL/kg IBW)`,
        reason: 'Lung-protective ventilation for ARDS'
      });
    }
    
    if (needsPEEPIncrease) {
      recommendations.push({
        type: 'important',
        message: '↑ PEEP to 10-12 cmH₂O',
        reason: 'Improve alveolar recruitment'
      });
    }
    
    if (needsFiO2Adjustment) {
      recommendations.push({
        type: 'moderate',
        message: '↓ FiO₂ to <60% if possible',
        reason: 'Reduce oxygen toxicity risk'
      });
    }
    
    if (respiratoryRate < 16) {
      recommendations.push({
        type: 'moderate',
        message: '↑ Respiratory Rate to 16-20',
        reason: 'Improve minute ventilation'
      });
    }

    return recommendations;
  };

  const recommendations = getVentilatorRecommendations();

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-600" />
          Ventilator Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Critical Alerts */}
        {(!isLungProtective || fio2 > 80) && (
          <Alert className="border-red-200 bg-red-50">
            <Settings className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 font-medium">
              {!isLungProtective && 'Non-protective ventilation detected'}
              {fio2 > 80 && ' • High FiO₂ risk'}
            </AlertDescription>
          </Alert>
        )}

        {/* Current Settings */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Mode</span>
              <Badge variant="outline">{mode}</Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">FiO₂</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">{fio2}%</span>
                {fio2 > 60 && <TrendingUp className="h-4 w-4 text-amber-500" />}
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">PEEP</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">{peep} cmH₂O</span>
                {peep < 10 && <TrendingDown className="h-4 w-4 text-amber-500" />}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Tidal Volume</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">{tidalVolume} mL</span>
                {!isLungProtective && <TrendingUp className="h-4 w-4 text-red-500" />}
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">mL/kg IBW</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">{tidalVolumePerKg}</span>
                <Badge variant={isLungProtective ? "default" : "destructive"}>
                  {isLungProtective ? "Protective" : "High"}
                </Badge>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Respiratory Rate</span>
              <span className="font-medium">{respiratoryRate} /min</span>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="bg-amber-50 rounded-lg p-4 space-y-3">
            <h4 className="font-medium text-amber-900 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Ventilator Adjustments
            </h4>
            <div className="space-y-2">
              {recommendations.map((rec, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    rec.type === 'critical' ? 'bg-red-500' :
                    rec.type === 'important' ? 'bg-amber-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-amber-900">{rec.message}</p>
                    <p className="text-xs text-amber-700">{rec.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Calculations */}
        <div className="bg-blue-50 rounded-lg p-4 space-y-2">
          <h4 className="font-medium text-blue-900">Calculations</h4>
          <div className="grid grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <span className="text-blue-600">IBW:</span> {idealBodyWeight} kg
            </div>
            <div>
              <span className="text-blue-600">Minute Ventilation:</span> {(tidalVolume * respiratoryRate / 1000).toFixed(1)} L/min
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VentilatorPanel;
