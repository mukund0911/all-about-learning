export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const THUMBNAIL_COLORS = [
  "from-indigo-600 to-violet-600",
  "from-cyan-600 to-blue-600",
  "from-violet-600 to-pink-600",
  "from-emerald-600 to-teal-600",
  "from-orange-600 to-red-600",
  "from-blue-600 to-indigo-600",
  "from-pink-600 to-rose-600",
  "from-teal-600 to-cyan-600",
];

export function randomThumbnailColor(): string {
  return THUMBNAIL_COLORS[Math.floor(Math.random() * THUMBNAIL_COLORS.length)];
}
