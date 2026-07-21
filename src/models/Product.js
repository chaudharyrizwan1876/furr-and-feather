import mongoose from 'mongoose';

const variantSchema = new mongoose.Schema({
  label: { type: String, required: true }, // e.g. "4.5-10kg" or "1.5kg"
  price: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 },
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    shortDescription: { type: String },
    price: { type: Number, required: true },
    discountPrice: { type: Number },
    category: { type: String, required: true },
    brand: { type: String },
    images: [{ type: String }],
    stock: { type: Number, default: 0 },
    sku: { type: String },
    unit: { type: String },
    suitableFor: { type: String },
    variants: [variantSchema], // For multiple weight/size variants
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    numSold: { type: Number, default: 0 }, // Total units sold - automatically incremented on each order

    // For manual ordering — controlled by the Admin via up/down arrows.
    // Lower number = shown first.
    sortOrder: { type: Number, default: 0 },       // Shop page display order
    featuredOrder: { type: Number, default: 0 },   // Home page "Featured Products" order (kept separate so it doesn't conflict with the Shop page order)

    metaTitle: { type: String },
    metaDescription: { type: String },
    focusKeyword: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model('Product', productSchema);
