/**
 * Compresses an image file to reduce size while maintaining quality
 * @param file - The image file to compress
 * @returns Promise<File> - The compressed image file
 */
export const compressImage = (file: File): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Check if compression is needed
      const needsCompression =
        file.size > 1.2 * 1024 * 1024 || // > 1.2MB
        img.width > 2000 ||
        img.height > 2000;

      if (!needsCompression) {
        resolve(file);
        return;
      }

      // Calculate new dimensions (max 2000x2000)
      let { width, height } = img;
      const maxSize = 2000;

      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);

      canvas.toBlob((blob) => {
        if (blob) {
          const compressedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          resolve(compressedFile);
        } else {
          resolve(file);
        }
      }, 'image/jpeg', 0.8); // 80% quality
    };

    img.onerror = () => resolve(file);
    img.src = URL.createObjectURL(file);
  });
};
