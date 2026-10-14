// Shared slug helper — used wherever a brand name needs to become a
// URL-friendly slug (brand pages, product detail brand links), so they
// always agree on the same slug for the same name.
export function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
