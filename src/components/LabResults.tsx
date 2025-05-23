
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TestTube, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';

interface LabResultsProps {
  data: {
    potassium: number;
    sodium: number;
    calcium: number;
    magnesium: number;
    lactate: number;
    hemoglobin: number;
    creatinine: number;
  };
}

const LabResults = ({ data }: LabResultsProps) => {
  const { potassium, sodium, calcium, magnesium, lactate, hemoglobin, creatinine } = data;

  const getCriticalAlerts = () => {
    const alerts = [];
    
    if (potassium >= 6.0) {
      alerts.push({
        level: 'critical',
        message: `K⁺ ${potassium} → Severe hyperkalemia`,
        treatment: 'Calcium gluconate 1g IV, insulin/D50, albuterol'
      });
    }
    
    if (lactate >= 4.0) {
      alerts.push({
        level: 'critical',
        message: `Lactate ${lactate} → Severe lactic acidosis`,
        treatment: 'Sepsis protocol, blood cultures, antibiotics'
      });
    }
    
    if (hemoglobin <= 7.0) {
      alerts.push({
        level: 'important',
        message: `Hgb ${hemoglobin} → Severe anemia`,
        treatment: 'Consider transfusion if symptomatic'
      });
    }
    
    if (calcium < 8.5) {
      alerts.push({
        level: 'moderate',
        message: `Ca²⁺ ${calcium} → Hypocalcemia`,
        treatment: 'Calcium gluconate 1-2g IV'
      });
    }
    
    if (magnesium < 1.8) {
      alerts.push({
        level: 'moderate',
        message: `Mg²⁺ ${magnesium} → Hypomagnesemia`,
        treatment: 'MgSO₄ 2-4g IV'
      });
    }

    return alerts;
  };

  const getLabStatus = (value: number, normal: [number, number]) => {
    if (value < normal[0]) return { status: 'low', color: 'text-blue-600' };
    if (value > normal[1]) return { status: 'high', color: 'text-red-600' };
    return { status: 'normal', color: 'text-green-600' };
  };

  const alerts = getCriticalAlerts();

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5 text-green-600" />
          Lab Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Critical Alerts */}
        {alerts.filter(a => a.level === 'critical').length > 0 && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 font-medium">
              {alerts.filter(a => a.level === 'critical').length} critical value(s) detected
            </AlertDescription>
          </Alert>
        )}

        {/* Lab Values Grid */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Potassium</span>
              <div className="flex items-center gap-2">
                <span className={`font-medium ${getLabStatus(potassium, [3.5, 5.0]).color}`}>
                  {potassium} mEq/L
                </span>
                {potassium >= 6.0 && <Badge variant="destructive" className="text-xs">Critical</Badge>}
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Sodium</span>
              <span className={`font-medium ${getLabStatus(sodium, [135, 145]).color}`}>
                {sodium} mEq/L
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Calcium</span>
              <div className="flex items-center gap-2">
                <span className={`font-medium ${getLabStatus(calcium, [8.5, 10.5]).color}`}>
                  {calcium} mg/dL
                </span>
                {calcium < 8.5 && <TrendingDown className="h-4 w-4 text-blue-500" />}
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Magnesium</span>
              <div className="flex items-center gap-2">
                <span className={`font-medium ${getLabStatus(magnesium, [1.8, 2.4]).color}`}>
                  {magnesium} mg/dL
                </span>
                {magnesium < 1.8 && <TrendingDown className="h-4 w-4 text-blue-500" />}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Lactate</span>
              <div className="flex items-center gap-2">
                <span className={`font-medium ${getLabStatus(lactate, [0.5, 2.0]).color}`}>
                  {lactate} mmol/L
                </span>
                {lactate >= 4.0 && <Badge variant="destructive" className="text-xs">Critical</Badge>}
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Hemoglobin</span>
              <div className="flex items-center gap-2">
                <span className={`font-medium ${getLabStatus(hemoglobin, [12, 16]).color}`}>
                  {hemoglobin} g/dL
                </span>
                {hemoglobin <= 7.0 && <Badge variant="destructive" className="text-xs">Severe</Badge>}
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Creatinine</span>
              <span className={`font-medium ${getLabStatus(creatinine, [0.7, 1.3]).color}`}>
                {creatinine} mg/dL
              </span>
            </div>
          </div>
        </div>

        {/* Treatment Protocols */}
        {alerts.length > 0 && (
          <div className="bg-red-50 rounded-lg p-4 space-y-3">
            <h4 className="font-medium text-red-900 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Immediate Actions Required
            </h4>
            <div className="space-y-3">
              {alerts.map((alert, index) => (
                <div key={index} className="space-y-1">
                  <p className="text-sm font-medium text-red-800">{alert.message}</p>
                  <p className="text-xs text-red-700 bg-red-100 rounded px-2 py-1">
                    📋 {alert.treatment}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Educational Notes */}
        <div className="bg-blue-50 rounded-lg p-4 space-y-2">
          <h4 className="font-medium text-blue-900">Clinical Notes</h4>
          <div className="text-xs text-blue-800 space-y-1">
            {potassium >= 6.0 && (
              <p>• Calcium stabilizes cardiac membranes (priority #1)</p>
            )}
            {lactate >= 4.0 && (
              <p>• Lactate >4 suggests tissue hypoperfusion</p>
            )}
            {hemoglobin <= 7.0 && (
              <p>• Consider transfusion threshold and patient symptoms</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LabResults;
