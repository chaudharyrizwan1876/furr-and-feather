// Single source of truth for product categories — used by the home page,
// shop sidebar, footer, admin categories page and the dedicated
// /shop/[category] routes, so the list and slugs never drift apart.
export const CATEGORIES = [
  { name: 'Dog Medicines', slug: 'dog-medicines', icon: '🐕' },
  { name: 'Cat Medicines', slug: 'cat-medicines', icon: '🐈' },
  { name: 'Cat & Dog Medicines', slug: 'cat-dog-medicines', icon: '🐾', combined: true },
  { name: 'Bird Medicines', slug: 'bird-medicines', icon: '🦜' },
  { name: 'Parasite Treatment', slug: 'parasite-treatment', icon: '💊' },
  { name: 'Deworming', slug: 'deworming', icon: '💊' },
  { name: 'Supplements', slug: 'supplements', icon: '💊' },
  { name: 'Pet Food', slug: 'pet-food', icon: '🍖' },
  { name: 'Pain Relief & Symptomatic Care', slug: 'pain-relief-symptomatic-care', icon: '💉' },
  { name: 'Skin & External Care', slug: 'skin-external-care', icon: '🧴' },
  { name: 'Equipment & Devices', slug: 'equipment-devices', icon: '🔧' },
  { name: 'Accessories', slug: 'accessories', icon: '🦴' },
];

export function getCategoryBySlug(slug) {
  return CATEGORIES.find((c) => c.slug === slug) || null;
}

export function getCategoryByName(name) {
  return CATEGORIES.find((c) => c.name === name) || null;
}

// The dedicated Shop URL for a category — falls back to the generic Shop
// page if the name isn't one of the known categories.
export function categoryUrl(name) {
  const cat = getCategoryByName(name);
  return cat ? `/shop/${cat.slug}` : '/shop';
}

// "Cat & Dog Medicines" is a combined view over 3 underlying category values
// — this builds the right Mongo filter for whichever category is requested.
export function categoryDbFilter(name) {
  if (name === 'Cat & Dog Medicines') {
    return { $in: ['Cat & Dog Medicines', 'Cat Medicines', 'Dog Medicines'] };
  }
  return name;
}

// A short, category-specific intro paragraph shown on each /shop/[category]
// page — gives Google and visitors unique on-page content instead of every
// category page looking like a bare product grid with only the names
// differing.
const CATEGORY_INTROS = {
  'Dog Medicines': 'Genuine, vet-approved medicines for dogs, from everyday health support to treatment for specific conditions. All products are sourced from authorized distributors and delivered across Pakistan with Cash on Delivery in Rawalpindi and Islamabad.',
  'Cat Medicines': 'Trusted medicines for cats, covering common feline health needs. Every product listed here is genuine and backed by fast delivery across Pakistan, with Cash on Delivery available in Rawalpindi and Islamabad.',
  'Cat & Dog Medicines': 'A combined range of medicines suitable for both cats and dogs, ideal for multi pet households. All products are genuine and ship nationwide across Pakistan.',
  'Bird Medicines': 'Specialized medicines for pet birds, including treatments for common avian health issues. Sourced from authorized suppliers and delivered across Pakistan.',
  'Parasite Treatment': 'Tick, flea, and parasite control products for dogs and cats, including trusted brands like Bravecto and NexGard. Genuine products with nationwide delivery and Cash on Delivery in Rawalpindi and Islamabad.',
  'Deworming': 'Dewormers for dogs and cats, from broad spectrum tablets to routine maintenance formulas, dosed to match your pet\'s age and weight. All products are genuine and authorized for sale in Pakistan.',
  'Supplements': 'Vitamin syrups, calcium supplements, and milk replacers to support your pet\'s growth, immunity, and recovery. Genuine products with fast delivery across Pakistan.',
  'Pet Food': 'Dry and wet food for cats and dogs, from budget friendly everyday options to premium formulas for kittens, puppies, and pets with specific dietary needs.',
  'Pain Relief & Symptomatic Care': 'Medicines for pain relief and common symptoms in pets, including syrups for digestive and urinary issues. All products are genuine and sourced from authorized distributors.',
  'Skin & External Care': 'Topical treatments and sprays for skin conditions, wounds, and external care in pets. Genuine products delivered across Pakistan.',
  'Equipment & Devices': 'Pet care equipment and devices, including microchips and scanners, for clinics and pet owners across Pakistan.',
  'Accessories': 'Everyday accessories for pets, selected for quality and durability, with fast delivery across Pakistan.',
};

export function categoryIntro(name) {
  return CATEGORY_INTROS[name] || `Shop genuine ${name.toLowerCase()} online in Pakistan, with Cash on Delivery in Rawalpindi and Islamabad and fast delivery nationwide.`;
}
