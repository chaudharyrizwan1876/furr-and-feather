import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';
import { toPlain } from '@/lib/serialize';
import BlogListView from '@/components/BlogListView';

// Cache the rendered page for 60 seconds instead of hitting the database on
// every single visit — a newly published post still appears within a minute.
export const revalidate = 60;

async function getBlogs() {
  await connectDB();
  const blogs = await Blog.find({ isPublished: true }).sort({ createdAt: -1 }).lean();
  return toPlain(blogs);
}

export default async function BlogPage() {
  const blogs = await getBlogs();

  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '20px 20px', textAlign: 'center' }}>
        <div className="container">
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '6px' }}>Our Pet Care Blog</h1>
          <p style={{ opacity: 0.85, fontSize: '13px' }}>Helpful tips and advice for your pet's health and wellbeing</p>
        </div>
      </div>

      <div className="container" style={{ padding: '32px 20px' }}>
        <BlogListView blogs={blogs} />
      </div>
    </div>
  );
}
