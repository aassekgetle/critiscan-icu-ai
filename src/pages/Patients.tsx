
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Activity, UserPlus, Search, FileText } from 'lucide-react';
import { patientService, authService } from '@/services/supabaseService';
import { toast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { format } from 'date-fns';

const Patients = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showNewPatientForm, setShowNewPatientForm] = useState(false);
  const [newPatient, setNewPatient] = useState({ name: '', medical_record_number: '', date_of_birth: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        
        if (!currentUser) {
          navigate('/');
          return;
        }
        
        setUser(currentUser);
        loadPatients();
      } catch (error) {
        console.error("Auth error:", error);
        navigate('/');
      }
    };
    
    checkAuth();
  }, [navigate]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const data = await patientService.getPatients();
      setPatients(data || []);
    } catch (error) {
      console.error("Error loading patients:", error);
      toast({
        title: "Error Loading Patients",
        description: "There was a problem loading your patients",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPatient.name) {
      toast({
        title: "Missing Information",
        description: "Patient name is required",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const patientData = {
        ...newPatient,
        user_id: user.id
      };
      
      await patientService.createPatient(patientData);
      
      toast({
        title: "Patient Created",
        description: `${newPatient.name} has been added successfully`
      });
      
      setNewPatient({ name: '', medical_record_number: '', date_of_birth: '' });
      setShowNewPatientForm(false);
      loadPatients();
    } catch (error) {
      console.error("Error creating patient:", error);
      toast({
        title: "Error Creating Patient",
        description: "There was a problem creating the patient",
        variant: "destructive"
      });
    }
  };

  const handleSelectPatient = (patient: any) => {
    navigate(`/patients/${patient.id}`);
  };

  const filteredPatients = patients.filter(patient => 
    patient.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.medical_record_number?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                <p className="text-sm text-gray-600">Patient Management</p>
              </div>
            </div>
            <Button 
              onClick={() => navigate('/')}
              variant="outline"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Patients</h2>
          <Button onClick={() => setShowNewPatientForm(!showNewPatientForm)}>
            <UserPlus className="h-4 w-4 mr-2" />
            {showNewPatientForm ? 'Cancel' : 'New Patient'}
          </Button>
        </div>

        {showNewPatientForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Add New Patient</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreatePatient} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Patient Name</Label>
                    <Input 
                      id="name" 
                      value={newPatient.name}
                      onChange={(e) => setNewPatient({...newPatient, name: e.target.value})}
                      placeholder="Full Name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mrn">Medical Record Number</Label>
                    <Input 
                      id="mrn" 
                      value={newPatient.medical_record_number}
                      onChange={(e) => setNewPatient({...newPatient, medical_record_number: e.target.value})}
                      placeholder="MRN (Optional)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input 
                      id="dob" 
                      type="date"
                      value={newPatient.date_of_birth}
                      onChange={(e) => setNewPatient({...newPatient, date_of_birth: e.target.value})}
                      placeholder="DOB (Optional)"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit">Save Patient</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Patient List</CardTitle>
              <div className="relative w-64">
                <Search className="h-4 w-4 absolute top-3 left-3 text-gray-400" />
                <Input
                  placeholder="Search patients"
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-6">
                <div className="mx-auto h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600"></div>
                <p className="mt-2 text-sm text-gray-500">Loading patients...</p>
              </div>
            ) : patients.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No patients yet</h3>
                <p className="text-sm text-gray-500 mt-1">Click "New Patient" to add someone</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>MRN</TableHead>
                      <TableHead>Date of Birth</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPatients.map((patient) => (
                      <TableRow key={patient.id}>
                        <TableCell className="font-medium">{patient.name}</TableCell>
                        <TableCell>{patient.medical_record_number || '-'}</TableCell>
                        <TableCell>
                          {patient.date_of_birth ? format(new Date(patient.date_of_birth), 'MM/dd/yyyy') : '-'}
                        </TableCell>
                        <TableCell>
                          {format(new Date(patient.created_at), 'MM/dd/yyyy')}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleSelectPatient(patient)}
                          >
                            Select
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Toaster />
    </div>
  );
};

export default Patients;
