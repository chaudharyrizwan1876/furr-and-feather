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
    description: { type: String, required: true },
    shortDescription: { type: String },
    price: { type: Number, required: true }, // Base price (agar variants nahi hain) ya sabse kam variant price
    discountPrice: { type: Number },
    category: { type: String, required: true },
    brand: { type: String },
    images: [{ type: String }],
    stock: { type: Number, required: true, default: 0 }, // Sirf tab use hoga jab variants nahi hain
    sku: { type: String },
    unit: { type: String },
    suitableFor: { type: String },
    variants: [variantSchema], // Multiple weight/size variants ke liye
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    numSold: { type: Number, default: 0 }, // Kitni baar bik chuka hai - har order par automatically increment hota hai
    metaTitle: { type: String },
    metaDescription: { type: String },
    focusKeyword: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model('Product', productSchema);