// Mongoose documents (even after .lean()) contain ObjectId/Date instances that
// cannot cross the Server Component -> Client Component boundary as props.
// This strips them down to plain JSON-safe values (ids become strings, etc).
export function toPlain(doc) {
  return JSON.parse(JSON.stringify(doc));
}
