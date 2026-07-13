const SITE_URL = 'https://furrandfeathers.com'; // ← Apna domain

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/', '/account'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
