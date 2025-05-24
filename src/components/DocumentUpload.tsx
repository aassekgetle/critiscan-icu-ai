
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { subscriptionService, SubscriptionTier } from '@/services/subscriptionService';
import { toast } from '@/hooks/use-toast';

interface DocumentUploadProps {
  selectedTier: SubscriptionTier;
  onUploadComplete: () => void;
}

const DocumentUpload = ({ selectedTier, onUploadComplete }: DocumentUploadProps) => {
  const [uploading, setUploading] = useState<string>('');
  const [uploadedDocs, setUploadedDocs] = useState<Set<string>>(new Set());

  const handleFileUpload = async (file: File, documentType: string) => {
    if (!file) return;

    setUploading(documentType);
    try {
      await subscriptionService.uploadDocument(file, documentType);
      setUploadedDocs(prev => new Set([...prev, documentType]));
      toast({
        title: "Document Uploaded",
        description: "Your document has been uploaded and is under review.",
      });
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload document. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading('');
    }
  };

  const getDocumentLabel = (docType: string) => {
    const labels: Record<string, string> = {
      'student_id': 'Valid Student ID',
      'acceptance_letter': 'School Acceptance Letter',
      'professional_license': 'Professional License',
      'employment_letter': 'Employment Letter'
    };
    return labels[docType] || docType;
  };

  const allDocsUploaded = selectedTier.documentTypes.every(type => uploadedDocs.has(type));

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center">
          <FileText className="h-6 w-6 mr-2" />
          Document Verification Required
        </CardTitle>
        <CardDescription>
          Upload the following documents for your {selectedTier.name} subscription
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {selectedTier.documentTypes.map((docType) => {
          const isUploaded = uploadedDocs.has(docType);
          const isUploading = uploading === docType;
          
          return (
            <div key={docType} className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">
                  {getDocumentLabel(docType)}
                </Label>
                {isUploaded && (
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Uploaded
                  </Badge>
                )}
                {isUploading && (
                  <Badge variant="secondary">
                    <Clock className="h-3 w-3 mr-1" />
                    Uploading...
                  </Badge>
                )}
              </div>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors">
                <Input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, docType);
                  }}
                  disabled={isUploading || isUploaded}
                  className="hidden"
                  id={`upload-${docType}`}
                />
                <label
                  htmlFor={`upload-${docType}`}
                  className={`flex flex-col items-center justify-center space-y-2 cursor-pointer ${
                    isUploading || isUploaded ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Upload className="h-8 w-8 text-gray-400" />
                  <p className="text-sm text-gray-600 text-center">
                    {isUploaded ? 'Document uploaded successfully' : 
                     isUploading ? 'Uploading...' : 
                     'Click to upload or drag and drop'}
                  </p>
                  <p className="text-xs text-gray-500">
                    PDF, JPG, PNG, DOC, DOCX (max 10MB)
                  </p>
                </label>
              </div>
            </div>
          );
        })}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Verification Process:</p>
              <ul className="space-y-1">
                <li>• AI pre-screening with human review for uncertain cases</li>
                <li>• Verification typically takes 1-2 business days</li>
                <li>• You'll receive email notifications about status updates</li>
                <li>• Access granted only after verification approval</li>
              </ul>
            </div>
          </div>
        </div>

        {allDocsUploaded && (
          <div className="text-center">
            <Button onClick={onUploadComplete} size="lg" className="w-full">
              Continue to Payment
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentUpload;
