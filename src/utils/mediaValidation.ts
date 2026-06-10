const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export function validateProfileImage(file: File) {
  if (!IMAGE_TYPES.includes(file.type)) {
    return 'Please choose a JPG, PNG, WEBP, or GIF image.';
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return 'Image must be 5MB or smaller.';
  }
  return null;
}
