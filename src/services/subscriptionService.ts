
import { supabase } from "@/integrations/supabase/client";

export interface SubscriptionTier {
  id: 'student' | 'nurse' | 'doctor' | 'teacher';
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  description: string;
  requirements: string[];
  documentTypes: string[];
}

export const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    id: 'student',
    name: 'Students',
    monthlyPrice: 5,
    yearlyPrice: 60,
    description: 'For current students in healthcare programs',
    requirements: ['Valid student ID', 'Current school acceptance letter'],
    documentTypes: ['student_id', 'acceptance_letter']
  },
  {
    id: 'nurse',
    name: 'Nurses/Hospital Staff',
    monthlyPrice: 20,
    yearlyPrice: 240,
    description: 'For licensed nursing professionals and hospital staff',
    requirements: ['Active professional license'],
    documentTypes: ['professional_license']
  },
  {
    id: 'doctor',
    name: 'Doctors',
    monthlyPrice: 40,
    yearlyPrice: 480,
    description: 'For licensed medical doctors',
    requirements: ['Current medical board license'],
    documentTypes: ['professional_license']
  },
  {
    id: 'teacher',
    name: 'Teachers/Health Educators',
    monthlyPrice: 15,
    yearlyPrice: 180,
    description: 'For healthcare educators and teachers',
    requirements: ['Institutional employment letter'],
    documentTypes: ['employment_letter']
  }
];

export const subscriptionService = {
  getUserProfile: async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .single();
    
    if (error) throw error;
    return data;
  },

  updateProfile: async (updates: any) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', (await supabase.auth.getUser()).data.user?.id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  uploadDocument: async (file: File, documentType: string) => {
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error('Not authenticated');

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.data.user.id}/${documentType}_${Date.now()}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('verification-docs')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data, error } = await supabase
      .from('verification_documents')
      .insert({
        user_id: user.data.user.id,
        document_type: documentType,
        file_path: uploadData.path,
        file_name: file.name
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  getUserDocuments: async () => {
    const { data, error } = await supabase
      .from('verification_documents')
      .select('*')
      .order('uploaded_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  getUserSubscription: async () => {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  }
};
