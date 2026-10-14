// Single place to update the domain once it's finalized — every page that
// builds canonical URLs, Open Graph tags or the sitemap imports from here
// instead of hardcoding the domain separately.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://furrandfeathers.com';
export const SITE_NAME = "Furr & Feather's Hospital";

// Fallback social-preview image — used wherever a page doesn't have its own
// image (e.g. a product/blog post with no uploaded photo).
export const DEFAULT_OG_IMAGE = '/petsss.png';
