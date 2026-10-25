// Appends Cloudinary's on-the-fly transformation params to an image URL so
// it's served already resized, compressed, and in a modern format (WebP/AVIF
// via f_auto), instead of the original upload (which can be several MB when
// it comes from an AI image generator). Works on any existing Cloudinary URL
// without needing to re-upload the image.
//
// width: the largest size the image is ever displayed at (in CSS pixels).
// Cloudinary serves a 2x version for retina screens automatically via dpr_auto.
export function optimizedImage(url, width = 800) {
  if (!url || typeof url !== 'string' || !url.includes('/upload/')) {
    return url;
  }
  return url.replace('/upload/', `/upload/f_auto,q_auto,dpr_auto,w_${width}/`);
}
