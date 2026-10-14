import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } from '@/lib/site';

export async function generateMetadata({ params }) {
  const { slug } = await params;

  try {
    await connectDB();
    const product = await Product.findOne({ slug, isActive: true }).lean();

    if (!product) {
      return {
        title: 'Product Not Found',
        description: 'This product is not available.',
      };
    }

    // "title" feeds the <title> tag, which the root layout already
    // templates as "%s | SITE_NAME" — appending the site name here too
    // would show it twice. openGraph/twitter titles aren't templated, so
    // they get their own version with the site name included.
    const title = product.metaTitle || product.name;
    const ogTitle = product.metaTitle || `${product.name} | ${SITE_NAME}`;
    const description = product.metaDescription ||
      product.shortDescription ||
      `${product.name} - ${product.category} - Genuine product available at Furr & Feather's Hospital Pakistan. COD available.`;

    const imageUrl = product.images?.[0] || `${SITE_URL}${DEFAULT_OG_IMAGE}`;
    const price = product.discountPrice > 0 && product.discountPrice < product.price
      ? product.discountPrice
      : product.price;

    return {
      title,
      description,
      keywords: [
        product.name, product.category, product.brand,
        'pakistan', 'buy online', 'veterinary', 'pet medicine',
        product.suitableFor,
      ].filter(Boolean),
      alternates: {
        canonical: `${SITE_URL}/products/${slug}`,
      },
      openGraph: {
        title: ogTitle,
        description,
        url: `${SITE_URL}/products/${slug}`,
        type: 'website',
        images: [{ url: imageUrl, width: 800, height: 800, alt: product.name }],
      },
      twitter: {
        card: 'summary_large_image',
        title: ogTitle,
        description,
        images: [imageUrl],
      },
    };
  } catch (err) {
    return {
      title: "Furr & Feather's Hospital",
      description: "Pakistan's trusted veterinary online store.",
    };
  }
}

export default function ProductLayout({ children }) {
  return children;
}
