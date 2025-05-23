
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Activity, TrendingUp, TrendingDown } from 'lucide-react';

interface ABGAnalysisProps {
  data: {
    pH: number;
    paCO2: number;
    paO2: number;
    hco3: number;
    anionGap: number;
    fio2: number;
  };
}

const ABGAnalysis = ({ data }: ABGAnalysisProps) => {
  const { pH, paCO2, paO2, hco3, anionGap, fio2 } = data;

  // Calculate P/F ratio
  const pfRatio = Math.round(paO2 / (fio2 / 100));

  // Calculate expected compensation
  const expectedPaCO2 = Math.round((1.5 * hco3) + 8);
  const compensationRange = `${expectedPaCO2 - 2} - ${expectedPaCO2 + 2}`;

  // Determine severity and classifications
  const getpHClassification = (pH: number) => {
    if (pH < 7.2) return { severity: 'severe', label: 'Severe Acidemia', color: 'destructive' };
    if (pH < 7.35) return { severity: 'mild', label: 'Acidemia', color: 'secondary' };
    if (pH > 7.45) return { severity: 'mild', label: 'Alkalemia', color: 'secondary' };
    return { severity: 'normal', label: 'Normal pH', color: 'default' };
  };

  const getARDSClassification = (pfRatio: number) => {
    if (pfRatio < 100) return { severity: 'severe', label: 'Severe ARDS', color: 'destructive' };
    if (pfRatio < 200) return { severity: 'moderate', label: 'Moderate ARDS', color: 'secondary' };
    if (pfRatio < 300) return { severity: 'mild', label: 'Mild ARDS', color: 'outline' };
    return { severity: 'normal', label: 'Normal Oxygenation', color: 'default' };
  };

  const pHClass = getpHClassification(pH);
  const ardsClass = getARDSClassification(pfRatio);

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-red-600" />
          ABG Interpretation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Critical Alerts */}
        {(pH < 7.2 || pfRatio < 200) && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 font-medium">
              Critical values detected - Immediate intervention required
            </AlertDescription>
          </Alert>
        )}

        {/* Primary Analysis */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">pH Analysis</label>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{pH}</span>
              <Badge variant={pHClass.color as any}>{pHClass.label}</Badge>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">P/F Ratio</label>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{pfRatio}</span>
              <Badge variant={ardsClass.color as any}>{ardsClass.label}</Badge>
            </div>
          </div>
        </div>

        {/* Detailed Values */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">PaCO₂</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">{paCO2} mmHg</span>
                {paCO2 > 45 ? (
                  <TrendingUp className="h-4 w-4 text-red-500" />
                ) : paCO2 < 35 ? (
                  <TrendingDown className="h-4 w-4 text-blue-500" />
                ) : (
                  <span className="text-green-500">Normal</span>
                )}
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">HCO₃⁻</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">{hco3} mEq/L</span>
                {hco3 < 22 ? (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                ) : hco3 > 26 ? (
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                ) : (
                  <span className="text-green-500">Normal</span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">PaO₂</span>
              <span className="font-medium">{paO2} mmHg</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Anion Gap</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">{anionGap}</span>
                {anionGap > 12 && <Badge variant="destructive" className="text-xs">High</Badge>}
              </div>
            </div>
          </div>
        </div>

        {/* Interpretation */}
        <div className="bg-blue-50 rounded-lg p-4 space-y-3">
          <h4 className="font-medium text-blue-900">Clinical Interpretation</h4>
          <div className="space-y-2 text-sm text-blue-800">
            <div className="flex items-start gap-2">
              <span className="font-medium">Primary:</span>
              <span>
                {pH < 7.35 && paCO2 > 45 ? 'Respiratory acidosis' : 
                 pH < 7.35 && hco3 < 22 ? 'Metabolic acidosis' :
                 pH > 7.45 && paCO2 < 35 ? 'Respiratory alkalosis' :
                 pH > 7.45 && hco3 > 26 ? 'Metabolic alkalosis' : 'Mixed disorder'}
              </span>
            </div>
            
            <div className="flex items-start gap-2">
              <span className="font-medium">Compensation:</span>
              <span>
                Expected PaCO₂: {compensationRange} 
                {paCO2 >= expectedPaCO2 - 2 && paCO2 <= expectedPaCO2 + 2 ? 
                  ' (Appropriate)' : ' (Inadequate)'}
              </span>
            </div>
            
            {anionGap > 12 && (
              <div className="flex items-start gap-2">
                <span className="font-medium">Gap:</span>
                <span>High anion gap suggests lactic acidosis, DKA, or uremia</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ABGAnalysis;
