import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';
import { NextResponse } from 'next/server';

// GET /api/blogs — Sab blogs fetch karo
// ?published=true — sirf published blogs (customer-facing pages ke liye)
export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const publishedOnly = searchParams.get('published') === 'true';

    const filter = publishedOnly ? { isPublished: true } : {};
    const blogs = await Blog.find(filter).sort({ createdAt: -1 });

    return NextResponse.json(blogs);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// Slug banane ka helper — title se URL-friendly slug generate karta hai
function generateSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// POST /api/blogs — Naya blog post banao
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    if (!body.title || !body.content) {
      return NextResponse.json({ message: 'Title aur content zaroori hain' }, { status: 400 });
    }

    let slug = body.slug?.trim() ? generateSlug(body.slug) : generateSlug(body.title);

    // Slug unique hai ya nahi check karo, agar nahi to number add karo
    let uniqueSlug = slug;
    let counter = 1;
    while (await Blog.findOne({ slug: uniqueSlug })) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    const blog = await Blog.create({
      title: body.title.trim(),
      slug: uniqueSlug,
      content: body.content,
      excerpt: body.excerpt?.trim() || body.content.slice(0, 150) + '...',
      image: body.image || '',
      category: body.category || 'General',
      author: body.author?.trim() || 'Admin',
      isPublished: body.isPublished ?? false,
      metaTitle: body.metaTitle?.trim() || body.title.trim(),
      metaDescription: body.metaDescription?.trim() || body.excerpt?.trim() || '',
      focusKeyword: body.focusKeyword?.trim() || '',
    });

    return NextResponse.json(blog, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
