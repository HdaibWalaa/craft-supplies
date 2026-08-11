export function parseImages(images: string | { url: string; alt?: string }[]): { url: string; alt: string }[] {
  if (Array.isArray(images)) return images.map((image) => ({ url: image.url, alt: image.alt ?? "" }));
  try {
    return JSON.parse(images);
  } catch {
    return [];
  }
}

export function parseJsonObject(json: string | Record<string, string> | { slug: string; value: string }[] | null | undefined): Record<string, string> {
  if (!json) return {};
  if (Array.isArray(json)) return Object.fromEntries(json.map((item) => [item.slug, item.value]));
  if (typeof json === "object") return json;
  try {
    return JSON.parse(json);
  } catch {
    return {};
  }
}
