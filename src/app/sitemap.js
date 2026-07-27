import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import Blog from '@/models/Blog';

const SITE_URL = 'https://furrandfeathers.com'; // ← Your domain

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default async function sitemap() {
  // Static pages
  const staticPages = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/shop`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/track-order`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
  ];

  let productPages = [];
  let blogPages = [];
  let brandPages = [];

  try {
    await connectDB();

    const products = await Product.find({ isActive: true }).select('slug brand updatedAt').lean();
    productPages = products.map((product) => ({
      url: `${SITE_URL}/products/${product.slug}`,
      lastModified: product.updatedAt || new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    // Unique brand slugs, derived from active products
    const uniqueBrandSlugs = new Set();
    products.forEach((p) => {
      if (p.brand) uniqueBrandSlugs.add(slugify(p.brand));
    });
    brandPages = Array.from(uniqueBrandSlugs).map((brandSlug) => ({
      url: `${SITE_URL}/brand/${brandSlug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    const blogs = await Blog.find({ isPublished: true }).select('slug updatedAt').lean();
    blogPages = blogs.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: post.updatedAt || new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    }));
  } catch (err) {
    console.error('Sitemap: failed to fetch data', err);
  }

  return [...staticPages, ...blogPages, ...brandPages, ...productPages];
}
