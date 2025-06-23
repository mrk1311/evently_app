// utils/storage.ts
import * as FileSystem from 'expo-file-system';
import { supabase } from '@/utils/supabase';

export const uploadImageToSupabase = async (uri: string, bucket: string) => {
  try {
    // Read the file as base64 string
    const base64Data = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    // Extract file extension
    const fileExt = uri.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;
    
    // Upload to Supabase
    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, decodeBase64(base64Data), {
        contentType: `image/${fileExt}`,
      });
    
    if (error) throw error;
    
    return supabase.storage
      .from(bucket)
      .getPublicUrl(filePath).data.publicUrl;
  } catch (error) {
    console.error('Image upload failed:', error);
    throw error;
  }
};

// Helper to convert base64 to ArrayBuffer
const decodeBase64 = (base64: string) => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  return bytes.buffer;
};