export function slugify(value: string) {
  // Replace spaces with _
  // Remove all non-word characters
  return value
    .toLowerCase()
    .replace(/ /g, '_')
    .replace(/[^\w-]+/g, '');
}
