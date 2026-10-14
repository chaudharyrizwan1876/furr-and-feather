import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import { slugify } from '@/lib/slugify';

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
    // Root layout already templates the <title> as "%s | SITE_NAME" — the
    // site name isn't repeated here to avoid it showing twice.
    const title = `${brandName} Products in Pakistan`;
    const ogTitle = `${brandName} Products in Pakistan | ${SITE_NAME}`;
    const description = `Shop genuine ${brandName} products in Pakistan. Cash on Delivery available in Rawalpindi and Islamabad. Fast delivery nationwide.`;

    return {
      title,
      description,
      alternates: {
        canonical: `${SITE_URL}/brand/${slug}`,
      },
      openGraph: {
        title: ogTitle,
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
