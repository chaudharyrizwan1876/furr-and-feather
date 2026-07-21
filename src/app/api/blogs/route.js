import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';
import { NextResponse } from 'next/server';

// GET /api/blogs — Fetch all blogs
// ?published=true — only published blogs (for customer-facing pages)
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

// Slug generation helper — generates a URL-friendly slug from the title
function generateSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// POST /api/blogs — Create a new blog post
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    if (!body.title || !body.content) {
      return NextResponse.json({ message: 'Title and content are required' }, { status: 400 });
    }

    let slug = body.slug?.trim() ? generateSlug(body.slug) : generateSlug(body.title);

    // Check if the slug is unique, and append a number if it isn't
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
