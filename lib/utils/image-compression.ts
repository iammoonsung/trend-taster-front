import imageCompression from 'browser-image-compression'

export interface CompressionOptions {
  maxSizeMB?: number
  maxWidthOrHeight?: number
  useWebWorker?: boolean
  fileType?: string
}

/**
 * Compresses an image file to reduce size while maintaining quality
 * @param file - The original image file
 * @param options - Compression options
 * @returns Compressed image file
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const defaultOptions = {
    maxSizeMB: 2, // Maximum file size in MB
    maxWidthOrHeight: 1920, // Max width or height in pixels
    useWebWorker: true, // Use web worker for better performance
    fileType: file.type, // Preserve original file type
  }

  const compressionOptions = { ...defaultOptions, ...options }

  try {
    const compressedFile = await imageCompression(file, compressionOptions)

    // Log compression results
    console.log(`Original size: ${(file.size / 1024 / 1024).toFixed(2)} MB`)
    console.log(`Compressed size: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`)
    console.log(`Reduction: ${(((file.size - compressedFile.size) / file.size) * 100).toFixed(1)}%`)

    return compressedFile
  } catch (error) {
    console.error('Image compression failed:', error)
    throw new Error('Failed to compress image')
  }
}

/**
 * Validates image file type
 * @param file - The file to validate
 * @returns True if valid image, false otherwise
 */
export function isValidImageType(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  return validTypes.includes(file.type)
}

/**
 * Validates image file size
 * @param file - The file to validate
 * @param maxSizeMB - Maximum allowed size in MB
 * @returns True if size is valid, false otherwise
 */
export function isValidImageSize(file: File, maxSizeMB: number = 10): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  return file.size <= maxSizeBytes
}

/**
 * Validates image file (type and size)
 * @param file - The file to validate
 * @param maxSizeMB - Maximum allowed size in MB
 * @returns Validation result with error message if invalid
 */
export function validateImageFile(
  file: File,
  maxSizeMB: number = 10
): { valid: boolean; error?: string } {
  if (!isValidImageType(file)) {
    return {
      valid: false,
      error: '지원하지 않는 파일 형식입니다. (JPG, PNG, WEBP만 가능)',
    }
  }

  if (!isValidImageSize(file, maxSizeMB)) {
    return {
      valid: false,
      error: `파일 크기가 너무 큽니다. (최대 ${maxSizeMB}MB)`,
    }
  }

  return { valid: true }
}

/**
 * Generates a unique file name with timestamp and random string
 * @param originalName - Original file name
 * @returns Unique file name
 */
export function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 8)
  const extension = originalName.split('.').pop() || 'jpg'
  return `${timestamp}-${randomString}.${extension}`
}
