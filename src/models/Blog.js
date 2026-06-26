import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    excerpt: { type: String },
    image: { type: String },
    category: { type: String },
    author: { type: String, default: 'Admin' },
    isPublished: { type: Boolean, default: false },
    metaTitle: { type: String },
    metaDescription: { type: String },
    focusKeyword: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Blog || mongoose.model('Blog', blogSchema);