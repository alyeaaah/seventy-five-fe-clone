/**
 * Compresses an image file to reduce size while maintaining quality
 * Preserves PNG transparency and format.
 * @param file - The image file to compress
 * @returns Promise<File> - The compressed image file
 */
export const compressImage = (file: File): Promise<File> => {
  return new Promise((resolve) => {
    // Keep track of the original file type (e.g., 'image/png' or 'image/jpeg')
    const fileType = file.type;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Clean up the object URL to avoid memory leaks
      URL.revokeObjectURL(img.src);

      // Check if compression/resizing is needed
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

      if (ctx) {
        // Clear canvas to guarantee alpha channel/transparency is preserved
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
      }

      // If it's a JPEG, use 0.8 quality. If it's a PNG, quality parameter is ignored by browsers.
      const quality = fileType === 'image/jpeg' ? 0.8 : undefined;

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: fileType,
              lastModified: Date.now()
            });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        },
        fileType,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      resolve(file);
    };
    
    img.src = URL.createObjectURL(file);
  });
};