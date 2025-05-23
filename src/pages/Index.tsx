import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Camera, Upload, FileText, Activity, AlertTriangle, CheckCircle, LogOut } from 'lucide-react';
import PhotoUpload from '@/components/PhotoUpload';
import ABGAnalysis from '@/components/ABGAnalysis';
import VentilatorPanel from '@/components/VentilatorPanel';
import LabResults from '@/components/LabResults';
import TreatmentPlan from '@/components/TreatmentPlan';
import AuthForm from '@/components/AuthForm';
import Logo from '@/components/Logo';
import { authService, patientService } from '@/services/supabaseService';
import { toast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploadedData, setUploadedData] = useState({
    abg: null,
    ventilator: null,
    labs: null
  });
  const [activeAnalysis, setActiveAnalysis] = useState('upload');
  const [currentPatient, setCurrentPatient] = useState<any>(null);

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
        
        // If user is logged in, create or get a default patient
        if (currentUser) {
          try {
            const patients = await patientService.getPatients();
            if (patients && patients.length > 0) {
              setCurrentPatient(patients[0]);
            } else {
              // Create a default patient if none exists
              const newPatient = await patientService.createPatient({
                name: 'Anonymous Patient',
                user_id: currentUser.id,
              });
              setCurrentPatient(newPatient);
            }
          } catch (error) {
            console.error("Error getting patient:", error);
          }
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
      } finally {
        setLoading(false);
      }
    };
    
    checkUser();
  }, []);

  const handleDataUpload = (type: string, data: any) => {
    setUploadedData(prev => ({
      ...prev,
      [type]: data
    }));
    console.log(`${type} data uploaded:`, data);
  };

  const handleLogout = async () => {
    try {
      await authService.signOut();
      setUser(null);
      setCurrentPatient(null);
      setUploadedData({
        abg: null,
        ventilator: null,
        labs: null
      });
      toast({
        title: "Logged Out Successfully",
        description: "You have been securely logged out",
      });
    } catch (error) {
      console.error("Error logging out:", error);
      toast({
        title: "Logout Failed",
        description: "There was a problem logging out",
        variant: "destructive"
      });
    }
  };

  const handleAuthSuccess = (userData: any) => {
    setUser(userData);
  };

  const hasAnyData = uploadedData.abg || uploadedData.ventilator || uploadedData.labs;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading CritiScan...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 py-12">
        <div className="text-center mb-8">
          <Logo size="lg" className="mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900">CritiScan ICU AI</h1>
          <p className="text-gray-600 mt-1">Instant Critical Care Analysis</p>
        </div>
        
        <AuthForm onAuthSuccess={handleAuthSuccess} />
        <Toaster />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Logo size="sm" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">CritiScan ICU AI</h1>
                <p className="text-sm text-gray-600">Instant Critical Care Analysis</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-blue-600 border-blue-600">
                ICU-Grade AI
              </Badge>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-1" /> Logout
              </Button>
            </div>
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
                dataType="abg"
              />
              <PhotoUpload
                title="Ventilator Settings"
                description="Capture ventilator display"
                icon={<Activity className="h-8 w-8 text-blue-600" />}
                onUpload={(data) => handleDataUpload('ventilator', data)}
                priority="medium"
                dataType="ventilator"
              />
              <PhotoUpload
                title="Lab Reports"
                description="Upload electrolyte and lab panels"
                icon={<Upload className="h-8 w-8 text-green-600" />}
                onUpload={(data) => handleDataUpload('labs', data)}
                priority="low"
                dataType="labs"
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
      
      <Toaster />
    </div>
  );
};

export default Index;
