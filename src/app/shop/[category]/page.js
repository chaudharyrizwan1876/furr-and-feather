import { notFound } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { toPlain } from '@/lib/serialize';
import { getCategoryBySlug, categoryDbFilter } from '@/lib/categories';
import { SITE_URL } from '@/lib/site';
import ShopView from '@/components/ShopView';

// Cache each category page for 60 seconds instead of hitting the database on
// every single visit — new/edited products still show up within a minute.
export const revalidate = 60;

export async function generateMetadata({ params }) {
  const { category } = await params;
  const cat = getCategoryBySlug(category);
  if (!cat) {
    return { title: 'Category Not Found' };
  }

  const title = `${cat.name} in Pakistan: Genuine Products, COD Available`;
  const description = `Shop genuine ${cat.name.toLowerCase()} online in Pakistan. Cash on Delivery in Rawalpindi and Islamabad, fast delivery nationwide. 100% authentic products at Furr & Feather's Hospital.`;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/shop/${cat.slug}` },
    openGraph: { title, description, url: `${SITE_URL}/shop/${cat.slug}`, type: 'website' },
  };
}

async function getProducts(categoryName) {
  await connectDB();
  const products = await Product.find({ isActive: true, category: categoryDbFilter(categoryName) })
    .sort({ createdAt: -1 })
    .lean();
  return toPlain(products);
}

export default async function ShopCategoryPage({ params, searchParams }) {
  const { category } = await params;
  const cat = getCategoryBySlug(category);
  if (!cat) notFound();

  const sp = await searchParams;
  const featured = sp?.featured === 'true';

  const products = await getProducts(cat.name);

  return <ShopView initialProducts={products} initialCategory={cat.name} initialFeatured={featured} />;
}
