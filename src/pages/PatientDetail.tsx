
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Camera, Upload, FileText, Activity, AlertTriangle, CheckCircle, ArrowLeft } from 'lucide-react';
import PhotoUpload from '@/components/PhotoUpload';
import ABGAnalysis from '@/components/ABGAnalysis';
import VentilatorPanel from '@/components/VentilatorPanel';
import LabResults from '@/components/LabResults';
import TreatmentPlan from '@/components/TreatmentPlan';
import { toast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { patientService, authService, abgService, ventilatorService, labService, treatmentPlanService } from '@/services/supabaseService';
import { format } from 'date-fns';

const PatientDetail = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState<any>(null);
  const [activeAnalysis, setActiveAnalysis] = useState('upload');
  const [uploadedData, setUploadedData] = useState({
    abg: null,
    ventilator: null,
    labs: null
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await authService.getCurrentUser();
        
        if (!user) {
          navigate('/');
          return;
        }
        
        if (!patientId) {
          navigate('/patients');
          return;
        }
        
        loadPatientDetails();
      } catch (error) {
        console.error("Auth error:", error);
        navigate('/');
      }
    };
    
    checkAuth();
  }, [patientId, navigate]);

  const loadPatientDetails = async () => {
    if (!patientId) return;
    
    try {
      setLoading(true);
      
      // Get patient details
      const patientData = await patientService.getPatientById(patientId);
      setPatient(patientData);
      
      // Try to load the latest records
      const [abgRecords, ventRecords, labRecords] = await Promise.all([
        abgService.getABGByPatientId(patientId),
        ventilatorService.getVentilatorByPatientId(patientId),
        labService.getLabsByPatientId(patientId)
      ]);
      
      // Set the latest records if they exist
      if (abgRecords && abgRecords.length > 0) {
        setUploadedData(prev => ({ ...prev, abg: abgRecords[0] }));
      }
      
      if (ventRecords && ventRecords.length > 0) {
        setUploadedData(prev => ({ ...prev, ventilator: ventRecords[0] }));
      }
      
      if (labRecords && labRecords.length > 0) {
        setUploadedData(prev => ({ ...prev, labs: labRecords[0] }));
      }
    } catch (error) {
      console.error("Error loading patient details:", error);
      toast({
        title: "Error Loading Patient",
        description: "There was a problem loading the patient data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDataUpload = async (type: string, data: any) => {
    if (!patientId) return;
    
    try {
      let savedResult;
      
      // Prepare data with patient ID
      const recordData = {
        ...data,
        patient_id: patientId
      };
      
      // Save to the appropriate service
      if (type === 'abg') {
        savedResult = await abgService.createABG(recordData);
      } else if (type === 'ventilator') {
        savedResult = await ventilatorService.createVentilatorSettings(recordData);
      } else if (type === 'labs') {
        savedResult = await labService.createLabResults(recordData);
      }
      
      // Update state with saved data
      setUploadedData(prev => ({
        ...prev,
        [type]: savedResult
      }));
      
      toast({
        title: "Data Saved Successfully",
        description: `${type.toUpperCase()} data has been saved to the patient record`,
      });
    } catch (error) {
      console.error(`Error saving ${type} data:`, error);
      toast({
        title: "Error Saving Data",
        description: `There was a problem saving the ${type} data`,
        variant: "destructive"
      });
    }
  };

  const hasAnyData = uploadedData.abg || uploadedData.ventilator || uploadedData.labs;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading patient data...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-amber-500" />
          <h2 className="mt-4 text-xl font-bold">Patient Not Found</h2>
          <p className="mt-2 text-gray-600">The patient you're looking for doesn't exist</p>
          <Button 
            onClick={() => navigate('/patients')}
            className="mt-4"
          >
            Back to Patients
          </Button>
        </div>
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
              <div className="p-2 bg-blue-600 rounded-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">CritiScan ICU AI</h1>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-600">Patient:</p>
                  <Badge>{patient.name}</Badge>
                  {patient.medical_record_number && (
                    <Badge variant="outline">MRN: {patient.medical_record_number}</Badge>
                  )}
                </div>
              </div>
            </div>
            <Button 
              onClick={() => navigate('/patients')}
              variant="outline"
              size="sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              All Patients
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Patient Info */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-500">Patient Name</p>
                <p className="font-medium">{patient.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Medical Record Number</p>
                <p className="font-medium">{patient.medical_record_number || 'Not Provided'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date of Birth</p>
                <p className="font-medium">
                  {patient.date_of_birth 
                    ? format(new Date(patient.date_of_birth), 'MM/dd/yyyy')
                    : 'Not Provided'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
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

export default PatientDetail;
