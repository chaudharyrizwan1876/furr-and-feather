// This script only needs to run ONCE. For EVERY product, it will:
// - DELETE existing reviews
// - Add 5 NEW reviews, all 5-STAR
// - Set the product's rating = 5.0 and numReviews = 5
//
// How to run it (from the project root folder, where package.json is located):
//
//     node scripts/setAllFiveStars.mjs
//
// WARNING: This will PERMANENTLY delete existing reviews (whether they were
// seeded earlier or submitted by real customers). If you want to keep any
// real customer reviews, note them down somewhere first.

import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env.local file not found. Run this script from the project root folder.');
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

const productSchema = new mongoose.Schema(
  { name: String, rating: Number, numReviews: Number },
  { timestamps: true, strict: false }
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

const reviewerNames = [
  'Ahmed Raza', 'Sana Malik', 'Bilal Ahmed', 'Ayesha Khan', 'Usman Tariq',
  'Hina Shahid', 'Fahad Iqbal', 'Mariam Aslam', 'Hassan Butt', 'Zainab Riaz',
  'Omar Farooq', 'Sadia Yousaf', 'Imran Sheikh', 'Noor Fatima', 'Asad Ali',
  'Komal Siddiqui', 'Waqas Hussain', 'Rabia Anjum', 'Junaid Akhtar', 'Hira Naeem',
  'Tariq Mehmood', 'Saba Qureshi', 'Kashif Javed', 'Mehwish Saleem', 'Faisal Khalid',
];

const reviewTemplates = [
  'Bohat acha product hai, {product} bilkul genuine mila aur delivery bhi time par hui.',
  'Mera pet pehle bohat pareshan tha lekin {product} use karne ke baad farq saaf nazar aa raha hai. Highly recommended!',
  'Quality bohat achi hai, packaging bhi professional thi. {product} dobara order karunga.',
  '{product} ka result bohat acha mila, vet ne bhi yehi recommend kiya tha. Shukriya Furr & Feather\'s!',
  'Pehli dafa is store se order kiya, {product} expected se behtar nikla. COD ka option bhi convenient hai.',
  'Asli product hai, market mein nakli bohat milte hain lekin yahan se confidence ke sath order kar sakte hain.',
  'Mere dog ko {product} se kaafi araam mila hai, ab regular yahin se order karta hoon.',
  'Bilkul original product, price bhi reasonable hai market ke comparison mein. Recommended hai sabko.',
  'Customer service bhi acha hai aur product bhi genuine. {product} ne expectations poori ki.',
  'Bohat satisfied hoon is purchase se, packaging neat thi aur product bhi seal pack mila.',
  'Vet ki advice par order kiya tha, {product} ka effect dekh kar khush hoon. Trust kar sakte hain is store par.',
  'Excellent quality! {product} bilkul waisa hi mila jaisa website par dikhaya gaya tha.',
];

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

async function setAllFiveStars() {
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in .env.local.');
    process.exit(1);
  }

  console.log('⏳ Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ MongoDB connected.\n');

  const products = await Product.find({});
  console.log(`📦 Found ${products.length} products. Setting each to 5-star rating with 5 reviews...\n`);

  for (const product of products) {
    // Delete existing reviews for this product
    await Review.deleteMany({ product: product._id });

    // Pick new names, avoiding duplicates
    const usedNames = new Set();
    const reviewsToCreate = [];

    for (let i = 0; i < 5; i++) {
      let name = pickRandom(reviewerNames);
      while (usedNames.has(name)) {
        name = pickRandom(reviewerNames);
      }
      usedNames.add(name);

      reviewsToCreate.push({
        product: product._id,
        customerName: name,
        rating: 5,
        comment: buildComment(product.name),
        isApproved: true,
      });
    }

    await Review.insertMany(reviewsToCreate);

    product.rating = 5;
    product.numReviews = 5;
    await product.save();

    console.log(`✅ ${product.name} — 5⭐ rating, 5 reviews`);
  }

  console.log(`\n🎉 Done! ${products.length} products now have a 5-star rating with 5 reviews.`);

  await mongoose.disconnect();
  process.exit(0);
}

setAllFiveStars().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
