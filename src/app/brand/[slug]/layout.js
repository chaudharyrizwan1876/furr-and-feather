import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';

const SITE_URL = 'https://furrandfeathers.com';

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function generateMetadata({ params }) {
  const { slug } = await params;

  try {
    await connectDB();
    const products = await Product.find({ isActive: true }).select('brand').lean();
    const matched = products.find((p) => p.brand && slugify(p.brand) === slug);

    if (!matched) {
      return { title: 'Brand Not Found' };
    }

    const brandName = matched.brand;
    const title = `${brandName} Products in Pakistan | Furr & Feather's Hospital`;
    const description = `Shop genuine ${brandName} products in Pakistan. Cash on Delivery available in Rawalpindi and Islamabad. Fast delivery nationwide.`;

    return {
      title,
      description,
      alternates: {
        canonical: `${SITE_URL}/brand/${slug}`,
      },
      openGraph: {
        title,
        description,
        url: `${SITE_URL}/brand/${slug}`,
        type: 'website',
      },
    };
  } catch (err) {
    return {
      title: "Furr & Feather's Hospital",
      description: "Pakistan's trusted veterinary online store.",
    };
  }
}

export default function BrandLayout({ children }) {
  return children;
}
