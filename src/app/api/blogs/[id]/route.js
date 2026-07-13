import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';
import { NextResponse } from 'next/server';

// GET /api/blogs/:id — Ek blog fetch karo (edit form ke liye)
export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const blog = await Blog.findById(id);
    if (!blog) {
      return NextResponse.json({ message: 'Blog nahi mila' }, { status: 404 });
    }
    return NextResponse.json(blog);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// PUT /api/blogs/:id — Blog update karo
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const blog = await Blog.findById(id);
    if (!blog) {
      return NextResponse.json({ message: 'Blog nahi mila' }, { status: 404 });
    }

    Object.keys(body).forEach((key) => {
      blog[key] = body[key];
    });
    await blog.save();

    return NextResponse.json(blog);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// DELETE /api/blogs/:id — Blog delete karo
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const blog = await Blog.findByIdAndDelete(id);
    if (!blog) {
      return NextResponse.json({ message: 'Blog nahi mila' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Blog delete ho gaya' });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
