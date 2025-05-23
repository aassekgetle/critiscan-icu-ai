
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Camera, Upload, FileText, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import PhotoUpload from '@/components/PhotoUpload';
import ABGAnalysis from '@/components/ABGAnalysis';
import VentilatorPanel from '@/components/VentilatorPanel';
import LabResults from '@/components/LabResults';
import TreatmentPlan from '@/components/TreatmentPlan';

const Index = () => {
  const [uploadedData, setUploadedData] = useState({
    abg: null,
    ventilator: null,
    labs: null
  });

  const [activeAnalysis, setActiveAnalysis] = useState('upload');

  const handleDataUpload = (type: string, data: any) => {
    setUploadedData(prev => ({
      ...prev,
      [type]: data
    }));
    console.log(`${type} data uploaded:`, data);
  };

  const hasAnyData = uploadedData.abg || uploadedData.ventilator || uploadedData.labs;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">CritiScan ICU AI</h1>
                <p className="text-sm text-gray-600">Instant Critical Care Analysis</p>
              </div>
            </div>
            <Badge variant="outline" className="text-blue-600 border-blue-600">
              ICU-Grade AI
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeAnalysis} onValueChange={setActiveAnalysis} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="analysis" disabled={!hasAnyData} className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Analysis
            </TabsTrigger>
            <TabsTrigger value="treatment" disabled={!hasAnyData} className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Treatment
            </TabsTrigger>
            <TabsTrigger value="export" disabled={!hasAnyData} className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Export
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <PhotoUpload
                title="ABG Results"
                description="Upload arterial blood gas report"
                icon={<FileText className="h-8 w-8 text-red-600" />}
                onUpload={(data) => handleDataUpload('abg', data)}
                priority="high"
              />
              <PhotoUpload
                title="Ventilator Settings"
                description="Capture ventilator display"
                icon={<Activity className="h-8 w-8 text-blue-600" />}
                onUpload={(data) => handleDataUpload('ventilator', data)}
                priority="medium"
              />
              <PhotoUpload
                title="Lab Reports"
                description="Upload electrolyte and lab panels"
                icon={<Upload className="h-8 w-8 text-green-600" />}
                onUpload={(data) => handleDataUpload('labs', data)}
                priority="low"
              />
            </div>

            {hasAnyData && (
              <Card className="mt-6 border-green-200 bg-green-50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-800">Data Ready for Analysis</span>
                    </div>
                    <Button 
                      onClick={() => setActiveAnalysis('analysis')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Analyze Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analysis">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {uploadedData.abg && (
                <ABGAnalysis data={uploadedData.abg} />
              )}
              {uploadedData.ventilator && (
                <VentilatorPanel data={uploadedData.ventilator} />
              )}
              {uploadedData.labs && (
                <LabResults data={uploadedData.labs} />
              )}
            </div>
          </TabsContent>

          <TabsContent value="treatment">
            <TreatmentPlan data={uploadedData} />
          </TabsContent>

          <TabsContent value="export">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Export Clinical Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Generate a comprehensive clinical summary for EHR documentation and team handoffs.
                  </p>
                  <div className="flex space-x-4">
                    <Button variant="outline">PDF Report</Button>
                    <Button variant="outline">Clinical Notes</Button>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      Export Summary
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>CritiScan ICU AI - Professional Medical AI Assistant</p>
            <p className="mt-1">⚠️ For clinical decision support only. Always verify with clinical judgment.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
