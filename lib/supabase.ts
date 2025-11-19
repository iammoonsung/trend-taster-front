import { createClient } from '@supabase/supabase-js'

// Use placeholder values during build time, actual values at runtime
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTI4MDAsImV4cCI6MTk2MDc2ODgwMH0.placeholder'

// Only warn in browser (runtime), not during build
if (typeof window !== 'undefined') {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('Supabase credentials not found. Image upload will not work.')
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Uploads an image file to Supabase Storage
 * @param file - The image file to upload
 * @param filePath - The path where the file will be stored in the bucket
 * @returns The public URL of the uploaded image
 */
export async function uploadImageToSupabase(
  file: File,
  filePath: string
): Promise<string> {
  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    throw new Error(`Image upload failed: ${error.message}`)
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from('product-images').getPublicUrl(data.path)

  return publicUrl
}

/**
 * Checks if a file exists in Supabase Storage
 * @param filePath - The path to check
 * @returns True if file exists, false otherwise
 */
export async function checkFileExists(filePath: string): Promise<boolean> {
  const { data, error } = await supabase.storage.from('product-images').list('', {
    search: filePath,
  })

  if (error) {
    console.error('Error checking file existence:', error)
    return false
  }

  return data.length > 0
}
