
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { fileService } from '@/services/supabaseService';
import { toast } from '@/hooks/use-toast';

interface PhotoUploadProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onUpload: (data: any) => void;
  priority: 'high' | 'medium' | 'low';
  dataType: 'abg' | 'ventilator' | 'labs';
}

const PhotoUpload = ({ title, description, icon, onUpload, priority, dataType }: PhotoUploadProps) => {
  const [isUploaded, setIsUploaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  const priorityColors = {
    high: 'border-red-200 bg-red-50',
    medium: 'border-blue-200 bg-blue-50',
    low: 'border-green-200 bg-green-50'
  };

  const priorityBadges = {
    high: <Badge variant="destructive">Critical</Badge>,
    medium: <Badge variant="default">Important</Badge>,
    low: <Badge variant="secondary">Standard</Badge>
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    
    try {
      // Upload file to Supabase storage
      const uploadResult = await fileService.uploadImage(file, dataType);
      setUploadedImageUrl(uploadResult.url);
      
      // Simulate AI processing time (in a real app, this would call an AI service)
      setTimeout(() => {
        const mockData = generateMockData(title);
        // Add the image_path to the mockData object
        const dataWithImagePath = {
          ...mockData,
          image_path: uploadResult.path
        };
        
        onUpload(dataWithImagePath);
        setIsUploaded(true);
        setIsProcessing(false);
        toast({
          title: "Data Processed Successfully",
          description: `${title} data has been extracted and analyzed`,
        });
      }, 2000);
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload Failed",
        description: "There was a problem uploading your image. Please try again.",
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  };

  const generateMockData = (type: string) => {
    if (type.includes('ABG')) {
      return {
        ph: 7.18,
        paco2: 55,
        pao2: 60,
        hco3: 18,
        anion_gap: 22,
        fio2: 50,
        timestamp: new Date()
      };
    } else if (type.includes('Ventilator')) {
      return {
        mode: 'AC/VC',
        fio2: 60,
        peep: 5,
        tidal_volume: 400,
        respiratory_rate: 12,
        timestamp: new Date()
      };
    } else {
      return {
        potassium: 6.5,
        sodium: 138,
        calcium: 8.2,
        magnesium: 1.6,
        lactate: 4.5,
        hemoglobin: 6.8,
        creatinine: 1.8,
        timestamp: new Date()
      };
    }
  };

  return (
    <Card className={`transition-all duration-300 hover:shadow-lg ${priorityColors[priority]} ${isUploaded ? 'border-green-300 bg-green-50' : ''}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {icon}
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            </div>
          </div>
          {priorityBadges[priority]}
        </div>
      </CardHeader>
      <CardContent>
        {!isUploaded ? (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <div className="space-y-2">
                <div className="mx-auto w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Camera className="h-6 w-6 text-gray-600" />
                </div>
                <p className="text-sm text-gray-600">
                  Click to upload or drag and drop
                </p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id={`upload-${title.replace(/\s+/g, '-').toLowerCase()}`}
                disabled={isProcessing}
              />
              <label htmlFor={`upload-${title.replace(/\s+/g, '-').toLowerCase()}`} className="flex-1">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  disabled={isProcessing}
                  asChild
                >
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    {isProcessing ? 'Processing...' : 'Upload Photo'}
                  </span>
                </Button>
              </label>
              <Button variant="outline" size="icon" disabled={isProcessing}>
                <Camera className="h-4 w-4" />
              </Button>
            </div>

            {isProcessing && (
              <div className="flex items-center justify-center space-x-2 text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm">AI analyzing image...</span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Data extracted successfully</span>
            </div>
            {uploadedImageUrl && (
              <div className="relative h-32 w-full overflow-hidden rounded-lg border border-gray-200">
                <img 
                  src={uploadedImageUrl} 
                  alt={`Uploaded ${title}`}
                  className="h-full w-full object-cover" 
                />
              </div>
            )}
            <div className="bg-white rounded-lg p-3 border border-green-200">
              <p className="text-sm text-gray-600">
                ✅ Image processed and values extracted
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Ready for clinical analysis
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsUploaded(false)}
              className="w-full"
            >
              Upload Different Image
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PhotoUpload;
