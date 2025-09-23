/**
 * Base URL for images storage
 */
const IMAGE_BASE_URL = 'https://princetect.peaklink.pro/BackEnd/storage/app/public/';

/**
 * Builds the complete image URL by combining base URL with image path
 * @param imagePath - The relative path of the image
 * @returns Complete image URL or null if no image path provided
 */
export function buildImageUrl(imagePath: string | null | undefined): string | null {
  if (!imagePath || imagePath.trim() === '') {
    return null;
  }

  // Remove leading slash if present to avoid double slashes
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  
  return `${IMAGE_BASE_URL}${cleanPath}`;
}

/**
 * Gets the full image URL for display, with fallback to default placeholder
 * @param imagePath - The relative path of the image
 * @param fallback - Fallback URL if image path is empty (optional)
 * @returns Complete image URL or fallback
 */
export function getImageUrl(imagePath: string | null | undefined, fallback?: string): string {
  const imageUrl = buildImageUrl(imagePath);
  return imageUrl || fallback || '/placeholder-logo.svg';
}

/**
 * Gets the full employee photo URL for display, with fallback to employee placeholder
 * @param imagePath - The relative path of the employee photo
 * @param fallback - Fallback URL if image path is empty (optional)
 * @returns Complete image URL or fallback
 */
export function getEmployeePhotoUrl(imagePath: string | null | undefined, fallback?: string): string {
  const imageUrl = buildImageUrl(imagePath);
  return imageUrl || fallback || '/placeholder-employee.svg';
}

/**
 * Extracts the relative path from a complete image URL
 * @param fullUrl - The complete image URL
 * @returns Relative path or original URL if it doesn't contain base URL
 */
export function extractImagePath(fullUrl: string | null | undefined): string {
  if (!fullUrl) return '';
  
  if (fullUrl.startsWith(IMAGE_BASE_URL)) {
    return fullUrl.replace(IMAGE_BASE_URL, '');
  }
  
  return fullUrl;
}