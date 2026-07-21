// This script only needs to run ONCE to create the admin account in the database.
// How to run it (from the project root folder, where package.json is located):
//
//     node scripts/seedAdmin.mjs
//
// This script parses the .env.local file itself, so there's no need to
// install an extra package.

import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Manually parse the .env.local file (no need to install the dotenv package)
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

// IMPORTANT: In Mongoose 9, pre('save') hooks no longer receive a "next"
// callback — an async function must be used instead (calling next() causes
// a "next is not a function" error). This has also been fixed in the actual
// src/models/User.js — the same correct pattern is used here.
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

// =====================================================
// ENTER YOUR ADMIN ACCOUNT DETAILS HERE
// =====================================================
const ADMIN_NAME = 'Admin';
const ADMIN_EMAIL = 'admin@furrgmail.com';
const ADMIN_PASSWORD = 'Admin@123';
// =====================================================

async function seedAdmin() {
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in .env.local.');
    process.exit(1);
  }

  console.log('⏳ Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ MongoDB connected.');

  const existing = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });

  if (existing) {
    if (existing.isAdmin) {
      console.log(`ℹ️  Admin account already exists: ${ADMIN_EMAIL}`);
    } else {
      existing.isAdmin = true;
      await existing.save();
      console.log(`✅ Existing account (${ADMIN_EMAIL}) has been made admin.`);
    }
  } else {
    await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL.toLowerCase(),
      password: ADMIN_PASSWORD, // plain text — the pre('save') hook will hash it
      isAdmin: true,
    });
    console.log(`✅ New admin account created: ${ADMIN_EMAIL}`);
  }

  console.log('\nYou can now log in at /account with these credentials:');
  console.log(`   Email: ${ADMIN_EMAIL}`);
  console.log(`   Password: ${ADMIN_PASSWORD}`);

  await mongoose.disconnect();
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
