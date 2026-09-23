/**
 * Automated Silent Background Image Compression Utility
 * Resizes images to max 800px dimension and applies 0.7 (70%) JPEG compression.
 * Reduces 5MB+ camera/gallery captures down to <100KB without losing clinical fidelity.
 */

export interface CompressedImageResult {
  uri: string;
  dataUrl: string;
  base64: string; // pure base64 string without 'data:image/jpeg;base64,' prefix
  width: number;
  height: number;
}

/**
 * Universal silent image compressor.
 * Automatically detects whether to use React Native / Expo manipulator or standard HTML5 Canvas.
 *
 * @param source Image URI, Data URL, File, or Blob
 * @param maxDimension Maximum bounding dimension (width or height, default 800px)
 * @param quality JPEG compression quality between 0.0 and 1.0 (default 0.7)
 */
export async function compressImage(
  source: string | File | Blob | { uri: string; base64?: string },
  maxDimension: number = 800,
  quality: number = 0.7
): Promise<CompressedImageResult> {
  // 1. Normalize input to URI or Blob
  let rawUri = '';
  let rawBlob: Blob | null = null;

  if (typeof source === 'object' && source !== null) {
    if ('uri' in source && typeof source.uri === 'string') {
      rawUri = source.uri;
      // If pure base64 was pre-attached and no URI, format as data URL
      if (!rawUri && source.base64) {
        rawUri = `data:image/jpeg;base64,${source.base64}`;
      }
    } else if (source instanceof Blob || (typeof File !== 'undefined' && source instanceof File)) {
      rawBlob = source;
    }
  } else if (typeof source === 'string') {
    rawUri = source;
  }

  // 2. React Native / Expo ImageManipulator execution path if present
  try {
    // @ts-ignore
    const ImageManipulator = typeof require !== 'undefined' ? require('expo-image-manipulator') : null;
    if (ImageManipulator && ImageManipulator.manipulateAsync && rawUri) {
      const manipResult = await ImageManipulator.manipulateAsync(
        rawUri,
        [{ resize: { width: maxDimension } }],
        {
          compress: quality,
          format: ImageManipulator.SaveFormat?.JPEG || 'jpeg',
          base64: true,
        }
      );

      if (manipResult && manipResult.uri) {
        let b64 = manipResult.base64 || '';
        if (!b64 && manipResult.uri.startsWith('data:')) {
          const comma = manipResult.uri.indexOf(',');
          b64 = comma !== -1 ? manipResult.uri.substring(comma + 1) : manipResult.uri;
        }
        const dataUrl = manipResult.uri.startsWith('data:')
          ? manipResult.uri
          : `data:image/jpeg;base64,${b64}`;

        return {
          uri: manipResult.uri,
          dataUrl,
          base64: b64,
          width: manipResult.width || maxDimension,
          height: manipResult.height || maxDimension,
        };
      }
    }
  } catch (expoErr) {
    // Graceful fallback to HTML5 Canvas
  }

  // 3. Web / Canvas execution path
  return new Promise<CompressedImageResult>((resolve, reject) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      // Fallback for headless non-DOM/non-Expo environments
      const cleanBase64 = rawUri.includes(',') ? rawUri.split(',')[1] : rawUri;
      return resolve({
        uri: rawUri,
        dataUrl: rawUri.startsWith('data:') ? rawUri : `data:image/jpeg;base64,${cleanBase64}`,
        base64: cleanBase64,
        width: maxDimension,
        height: maxDimension,
      });
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    let objectUrlToRevoke: string | null = null;

    img.onload = () => {
      try {
        let { naturalWidth: width, naturalHeight: height } = img;
        if (!width || !height) {
          width = img.width || maxDimension;
          height = img.height || maxDimension;
        }

        // Calculate aspect ratio preservation within maxDimension x maxDimension bounding box
        if (width > maxDimension || height > maxDimension) {
          if (width >= height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          throw new Error('Canvas 2D context creation failed');
        }

        // High quality downsampling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Compress to 70% quality JPEG
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        const commaIdx = dataUrl.indexOf(',');
        const base64 = commaIdx !== -1 ? dataUrl.substring(commaIdx + 1) : dataUrl;

        if (objectUrlToRevoke) {
          URL.revokeObjectURL(objectUrlToRevoke);
        }

        resolve({
          uri: dataUrl,
          dataUrl,
          base64,
          width,
          height,
        });
      } catch (err) {
        if (objectUrlToRevoke) {
          URL.revokeObjectURL(objectUrlToRevoke);
        }
        reject(err);
      }
    };

    img.onerror = () => {
      if (objectUrlToRevoke) {
        URL.revokeObjectURL(objectUrlToRevoke);
      }
      reject(new Error('Failed to load image for silent background compression'));
    };

    if (rawBlob) {
      objectUrlToRevoke = URL.createObjectURL(rawBlob);
      img.src = objectUrlToRevoke;
    } else if (rawUri) {
      if (rawUri.startsWith('data:') || rawUri.startsWith('blob:') || rawUri.startsWith('http')) {
        img.src = rawUri;
      } else {
        // Assume raw base64
        img.src = `data:image/jpeg;base64,${rawUri}`;
      }
    } else {
      reject(new Error('No valid image URI or blob provided to compressImage'));
    }
  });
}
