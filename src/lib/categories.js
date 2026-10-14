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
