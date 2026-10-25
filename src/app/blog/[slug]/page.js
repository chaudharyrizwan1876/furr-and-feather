import Link from 'next/link';
import { notFound } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';
import Product from '@/models/Product';
import { toPlain } from '@/lib/serialize';
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } from '@/lib/site';
import { categoryUrl } from '@/lib/categories';
import BackButton from '@/components/BackButton';
import ProductCard from '@/components/ProductCard';
import { optimizedImage } from '@/lib/cloudinaryUrl';

// Cache each blog post for 60 seconds instead of hitting the database on
// every single visit.
export const revalidate = 60;

// Blog categories don't use the same names as product categories — this
// maps a post's category to the product category its readers are most
// likely shopping for, so the article can link straight to those products.
const BLOG_TO_PRODUCT_CATEGORY = {
  'Dog Care': 'Dog Medicines',
  'Cat Care': 'Cat Medicines',
  'Bird Care': 'Bird Medicines',
};

async function getBlogData(slug) {
  await connectDB();
  const postDoc = await Blog.findOne({ slug, isPublished: true }).lean();
  if (!postDoc) return null;
  const post = toPlain(postDoc);

  const relatedDocs = await Blog.find({ category: post.category, isPublished: true, slug: { $ne: post.slug } })
    .limit(2)
    .lean();
  const relatedPosts = toPlain(relatedDocs);

  // Products relevant to this article — from the matching product category
  // when there is one, otherwise just the store's featured picks. Either
  // way, the article links through to real product/category pages instead
  // of being a dead end.
  const productCategory = BLOG_TO_PRODUCT_CATEGORY[post.category];
  const productFilter = productCategory ? { category: productCategory, isActive: true } : { isActive: true, isFeatured: true };
  const relatedProductDocs = await Product.find(productFilter).limit(4).lean();
  const relatedProducts = toPlain(relatedProductDocs);
  const shopUrl = productCategory ? categoryUrl(productCategory) : '/shop';
  const shopLabel = productCategory || 'All Products';

  return { post, relatedPosts, relatedProducts, shopUrl, shopLabel };
}

export default async function BlogDetailPage({ params }) {
  const { slug } = await params;
  const data = await getBlogData(slug);

  if (!data) {
    notFound();
  }

  const { post, relatedPosts, relatedProducts, shopUrl, shopLabel } = data;
  // Content can be written as semantic HTML (headings, links, lists — styled
  // by the .blog-content rules in globals.css) for proper formatting and
  // internal links. Older plain-text posts (no HTML tags) still fall back
  // to one paragraph per line, same as before.
  const isHtmlContent = /<[a-z][\s\S]*>/i.test(post.content);
  const paragraphs = isHtmlContent ? [] : post.content.split('\n').filter((p) => p.trim());

  // JSON-LD Article schema — lets Google show author/date in search results
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || '',
    image: [post.image || `${SITE_URL}${DEFAULT_OG_IMAGE}`],
    datePublished: post.createdAt,
    dateModified: post.updatedAt || post.createdAt,
    author: { '@type': 'Organization', name: post.author || SITE_NAME },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}${DEFAULT_OG_IMAGE}` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/blog/${post.slug}` },
  };

  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />

      {/* Breadcrumb */}
      <div style={{ backgroundColor: 'white', padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <BackButton fallback="/blog" />
          <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            <Link href="/" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Home</Link>
            {' → '}
            <Link href="/blog" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Blog</Link>
            {' → '} {post.title}
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '32px 20px', maxWidth: '800px' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '36px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
          <span style={{ backgroundColor: '#f0f1ff', color: 'var(--primary)', padding: '5px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>{post.category}</span>

          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text)', margin: '18px 0 14px', lineHeight: '1.3' }}>{post.title}</h1>

          <div style={{ display: 'flex', gap: '20px', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid var(--border)' }}>
            <span>📅 {new Date(post.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            <span>✍️ By {post.author}</span>
          </div>

          {post.image && (
            <div style={{ backgroundColor: 'var(--bg)', height: '280px', borderRadius: '12px', overflow: 'hidden', marginBottom: '28px' }}>
              <img src={optimizedImage(post.image, 900)} alt={post.title} loading="eager" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}

          {isHtmlContent ? (
            <div className="blog-content" dangerouslySetInnerHTML={{ __html: post.content }} />
          ) : (
            paragraphs.map((para, i) => (
              <p key={i} style={{ fontSize: '15px', lineHeight: '1.9', color: 'var(--text)', marginBottom: '18px' }}>{para}</p>
            ))
          )}

          {/* Share */}
          <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)' }}>Share this article:</span>
            <button style={{ padding: '6px 16px', borderRadius: '20px', border: 'none', backgroundColor: '#1877f2', color: 'white', cursor: 'pointer', fontSize: '13px' }}>Facebook</button>
            <button style={{ padding: '6px 16px', borderRadius: '20px', border: 'none', backgroundColor: '#25D366', color: 'white', cursor: 'pointer', fontSize: '13px' }}>WhatsApp</button>
          </div>
        </div>

        {/* Shop Related Products — links the article through to the actual
            products its readers are likely looking for */}
        {relatedProducts.length > 0 && (
          <div style={{ marginTop: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--primary)' }}>Shop {shopLabel}</h2>
              <Link href={shopUrl} style={{ fontSize: '13px', fontWeight: '600', color: 'var(--primary)', textDecoration: 'none' }}>View All →</Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
              {relatedProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        )}

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div style={{ marginTop: '28px' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '16px' }}>Related Articles</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}
              data-related-grid>
              {relatedPosts.map((rp) => (
                <Link key={rp.slug} href={`/blog/${rp.slug}`} style={{ textDecoration: 'none' }}>
                  <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '8px', backgroundColor: 'var(--bg)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                      {rp.image ? <img src={optimizedImage(rp.image, 100)} alt={rp.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '📄'}
                    </div>
                    <span style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text)' }}>{rp.title}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 600px) {
          [data-related-grid] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
