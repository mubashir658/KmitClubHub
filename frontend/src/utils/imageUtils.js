/**
 * Helper function to get the correct image URL
 * Handles both uploaded images (from backend) and external URLs
 * @param {string} imageUrl - The image URL from the database
 * @returns {string} - The complete image URL
 */
export const getImageUrl = (imageUrl) => {
  if (!imageUrl) {
    return "/placeholder.svg";
  }
  
  // If it's already a full URL (http/https), return as is
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  
  // If it's a relative path (uploaded image), prepend backend URL
  if (imageUrl.startsWith('/')) {
    return `http://localhost:5000${imageUrl}`;
  }
  
  // Fallback to placeholder
  return "/placeholder.svg";
};
