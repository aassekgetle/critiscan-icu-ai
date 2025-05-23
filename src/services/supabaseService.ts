
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

// Authentication service
export const authService = {
  signUp: async (email: string, password: string) => {
    return await supabase.auth.signUp({ email, password });
  },
  
  signIn: async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password });
  },
  
  signOut: async () => {
    return await supabase.auth.signOut();
  },
  
  getCurrentUser: async () => {
    const { data } = await supabase.auth.getSession();
    return data?.session?.user;
  }
};

// Patient service
export const patientService = {
  createPatient: async (patientData: any) => {
    const { data, error } = await supabase
      .from('patients')
      .insert(patientData)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },
  
  getPatients: async () => {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data;
  },
  
  getPatientById: async (id: string) => {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return data;
  }
};

// File upload service
export const fileService = {
  uploadImage: async (file: File, folderName: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${folderName}/${uuidv4()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('medical_images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) throw error;
    
    const { data: publicUrlData } = supabase.storage
      .from('medical_images')
      .getPublicUrl(fileName);
    
    return {
      path: fileName,
      url: publicUrlData.publicUrl
    };
  }
};

// ABG results service
export const abgService = {
  createABG: async (abgData: any) => {
    const { data, error } = await supabase
      .from('abg_results')
      .insert(abgData)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },
  
  getABGByPatientId: async (patientId: string) => {
    const { data, error } = await supabase
      .from('abg_results')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data;
  }
};

// Ventilator settings service
export const ventilatorService = {
  createVentilatorSettings: async (ventData: any) => {
    const { data, error } = await supabase
      .from('ventilator_settings')
      .insert(ventData)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },
  
  getVentilatorByPatientId: async (patientId: string) => {
    const { data, error } = await supabase
      .from('ventilator_settings')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data;
  }
};

// Lab results service
export const labService = {
  createLabResults: async (labData: any) => {
    const { data, error } = await supabase
      .from('lab_results')
      .insert(labData)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },
  
  getLabsByPatientId: async (patientId: string) => {
    const { data, error } = await supabase
      .from('lab_results')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data;
  }
};

// Treatment plan service
export const treatmentPlanService = {
  createTreatmentPlan: async (planData: any) => {
    const { data, error } = await supabase
      .from('treatment_plans')
      .insert(planData)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },
  
  getTreatmentPlansByPatientId: async (patientId: string) => {
    const { data, error } = await supabase
      .from('treatment_plans')
      .select(`
        *,
        abg_results (*),
        ventilator_settings (*),
        lab_results (*)
      `)
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data;
  }
};
