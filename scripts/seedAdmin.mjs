// Yeh script SIRF EK DAFA chalani hai, taake admin account database mein ban jaye.
// Chalane ka tareeqa (project ke root folder mein, jahan package.json hai):
//
//     node scripts/seedAdmin.mjs
//
// Yeh script khud .env.local file parse kar leti hai, koi extra package install
// karne ki zaroorat nahi.

import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// .env.local file ko manually parse karte hain (dotenv package install karne ki zaroorat nahi)
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

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    addresses: [
      {
        street: { type: String },
        city: { type: String },
        province: { type: String },
      },
    ],
  },
  { timestamps: true }
);

// IMPORTANT: Mongoose 9 mein pre('save') hooks ko ab "next" callback nahi
// milta — async function use karni hoti hai (next() call karne se
// "next is not a function" error aata hai). Yeh asal src/models/User.js
// mein bhi fix kiya gaya hai, yahan wahi sahi pattern use kar rahe hain.
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

// =====================================================
// YAHAN APNA ADMIN ACCOUNT KA DETAIL DALEIN
// =====================================================
const ADMIN_NAME = 'Admin';
const ADMIN_EMAIL = 'admin@furrgmail.com';
const ADMIN_PASSWORD = 'Admin@123';
// =====================================================

async function seedAdmin() {
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI .env.local mein nahi mila.');
    process.exit(1);
  }

  console.log('⏳ MongoDB se connect ho rahe hain...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ MongoDB connected.');

  const existing = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });

  if (existing) {
    if (existing.isAdmin) {
      console.log(`ℹ️  Admin account already maujood hai: ${ADMIN_EMAIL}`);
    } else {
      existing.isAdmin = true;
      await existing.save();
      console.log(`✅ Existing account (${ADMIN_EMAIL}) ko admin bana diya gaya.`);
    }
  } else {
    await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL.toLowerCase(),
      password: ADMIN_PASSWORD, // plain text — pre('save') hook isko hash kar dega
      isAdmin: true,
    });
    console.log(`✅ Naya admin account ban gaya: ${ADMIN_EMAIL}`);
  }

  console.log('\nAb in credentials se /account page par login karein:');
  console.log(`   Email: ${ADMIN_EMAIL}`);
  console.log(`   Password: ${ADMIN_PASSWORD}`);

  await mongoose.disconnect();
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
