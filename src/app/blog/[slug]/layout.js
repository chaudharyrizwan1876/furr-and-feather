import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';

const SITE_URL = 'https://furrandfeathers.com';

export async function generateMetadata({ params }) {
  const { slug } = await params;

  try {
    await connectDB();
    const post = await Blog.findOne({ slug, isPublished: true }).lean();

    if (!post) {
      return { title: 'Blog Post Not Found' };
    }

    const title = post.metaTitle || post.title;
    const description = post.metaDescription || post.excerpt || '';

    return {
      title,
      description,
      keywords: post.focusKeyword ? [post.focusKeyword] : undefined,
      alternates: { canonical: `${SITE_URL}/blog/${slug}` },
      openGraph: {
        title,
        description,
        type: 'article',
        url: `${SITE_URL}/blog/${slug}`,
        images: post.image ? [{ url: post.image }] : undefined,
      },
    };
  } catch (err) {
    return { title: "Furr & Feather's Hospital Blog" };
  }
}

export default function BlogSlugLayout({ children }) {
  return children;
}
