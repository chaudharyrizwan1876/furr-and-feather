// Yeh script SIRF EK DAFA chalani hai, taake har product ke liye 3 reviews
// (Roman Urdu mein) aur ek random "number of sold" value generate ho jaye.
//
// Chalane ka tareeqa (project ke root folder mein, jahan package.json hai):
//
//     node scripts/seedReviewsAndSales.mjs
//
// NOTE: Yeh script un products ko SKIP kar deti hai jin ke pehle se reviews
// maujood hain — taake dobara chalane se duplicate reviews na banein.
// Agar aap baad mein naye products add karein, yeh script dobara chala
// sakte hain — sirf nayi products ko reviews milenge.

import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env.local file nahi mili. Yeh script project ke root folder se chalayein.');
    process.exit(1);
  }
  const content = fs.readFileSync(envPath, 'utf-8');
  content.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) return;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    process.env[key] = value;
  });
}

loadEnvLocal();

// ===== Schemas (asal models se match karte hain) =====
const variantSchema = new mongoose.Schema({
  label: String,
  price: Number,
  stock: Number,
});

const productSchema = new mongoose.Schema(
  {
    name: String,
    slug: String,
    description: String,
    shortDescription: String,
    price: Number,
    discountPrice: Number,
    category: String,
    brand: String,
    images: [String],
    stock: Number,
    sku: String,
    unit: String,
    suitableFor: String,
    variants: [variantSchema],
    isFeatured: Boolean,
    isActive: Boolean,
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    numSold: { type: Number, default: 0 },
    metaTitle: String,
    metaDescription: String,
    focusKeyword: String,
  },
  { timestamps: true }
);

const reviewSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    customerName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    isApproved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);

// ===== Roman Urdu reviewer names (Pakistani names ka mix) =====
const reviewerNames = [
  'Ahmed Raza', 'Sana Malik', 'Bilal Ahmed', 'Ayesha Khan', 'Usman Tariq',
  'Hina Shahid', 'Fahad Iqbal', 'Mariam Aslam', 'Hassan Butt', 'Zainab Riaz',
  'Omar Farooq', 'Sadia Yousaf', 'Imran Sheikh', 'Noor Fatima', 'Asad Ali',
  'Komal Siddiqui', 'Waqas Hussain', 'Rabia Anjum', 'Junaid Akhtar', 'Hira Naeem',
  'Tariq Mehmood', 'Saba Qureshi', 'Kashif Javed', 'Mehwish Saleem', 'Faisal Khalid',
];

// ===== Roman Urdu review templates =====
// {product} placeholder se product ka naam insert hoga
const reviewTemplates = [
  'Bohat acha product hai, {product} bilkul genuine mila aur delivery bhi time par hui.',
  'Mera pet pehle bohat pareshan tha lekin {product} use karne ke baad farq saaf nazar aa raha hai. Highly recommended!',
  'Quality bohat achi hai, packaging bhi professional thi. {product} dobara order karunga.',
  '{product} ka result bohat acha mila, vet ne bhi yehi recommend kiya tha. Shukriya Furr & Feather\'s!',
  'Pehli dafa is store se order kiya, {product} expected se behtar nikla. COD ka option bhi convenient hai.',
  'Asli product hai, market mein nakli bohat milte hain lekin yahan se confidence ke sath order kar sakte hain.',
  'Delivery thori late hui lekin product ki quality ne sab compensate kar diya. {product} effective hai.',
  'Mere dog ko {product} se kaafi araam mila hai, ab regular yahin se order karta hoon.',
  'Bilkul original product, price bhi reasonable hai market ke comparison mein. Recommended hai sabko.',
  'Customer service bhi acha hai aur product bhi genuine. {product} ne expectations poori ki.',
  'Bohat satisfied hoon is purchase se, packaging neat thi aur product bhi seal pack mila.',
  'Vet ki advice par order kiya tha, {product} ka effect dekh kar khush hoon. Trust kar sakte hain is store par.',
];

// Random integer between min and max (inclusive)
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom(arr) {
  return arr[randInt(0, arr.length - 1)];
}

function buildComment(productName) {
  const template = pickRandom(reviewTemplates);
  return template.replace('{product}', productName);
}

async function seedReviewsAndSales() {
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI .env.local mein nahi mila.');
    process.exit(1);
  }

  console.log('⏳ MongoDB se connect ho rahe hain...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ MongoDB connected.\n');

  const products = await Product.find({});
  console.log(`📦 ${products.length} products mile.\n`);

  let seededCount = 0;
  let skippedCount = 0;

  for (const product of products) {
    const existingReviewsCount = await Review.countDocuments({ product: product._id });

    if (existingReviewsCount > 0) {
      skippedCount++;
      continue;
    }

    // 3 reviews banao har product ke liye
    // Rating: zyada tar 4-5 ke beech, kuch products 5-star, kuch 4.x
    const usedNames = new Set();
    const reviewsToCreate = [];

    for (let i = 0; i < 3; i++) {
      let name = pickRandom(reviewerNames);
      while (usedNames.has(name)) {
        name = pickRandom(reviewerNames);
      }
      usedNames.add(name);

      // Rating distribution: 50% 5-star, 35% 4-star, 15% 3-star (zyada tar positive)
      const ratingRoll = Math.random();
      let rating;
      if (ratingRoll < 0.5) rating = 5;
      else if (ratingRoll < 0.85) rating = 4;
      else rating = 3;

      reviewsToCreate.push({
        product: product._id,
        customerName: name,
        rating,
        comment: buildComment(product.name),
        isApproved: true, // seeded reviews directly approved hain
      });
    }

    await Review.insertMany(reviewsToCreate);

    // Product ka average rating aur numReviews update karo
    const avgRating = reviewsToCreate.reduce((sum, r) => sum + r.rating, 0) / reviewsToCreate.length;
    // Round to 1 decimal — kabhi 5.0, kabhi 4.7, 4.9 jaisi values aayengi naturally
    const roundedRating = Math.round(avgRating * 10) / 10;

    // numSold — 10 se 20 ke darmiyan random starting value
    const initialNumSold = randInt(10, 20);

    product.rating = roundedRating;
    product.numReviews = reviewsToCreate.length;
    product.numSold = initialNumSold;
    await product.save();

    console.log(`✅ ${product.name} — rating: ${roundedRating}⭐, reviews: 3, sold: ${initialNumSold}`);
    seededCount++;
  }

  console.log(`\n🎉 Done! ${seededCount} products ko reviews mile, ${skippedCount} products skip hue (already reviews thay).`);

  await mongoose.disconnect();
  process.exit(0);
}

seedReviewsAndSales().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
