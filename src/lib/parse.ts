export function parseImages(images: string): { url: string; alt: string }[] {
  try {
    return JSON.parse(images);
  } catch {
    return [];
  }
}

export function parseJsonObject(json: string | null | undefined): Record<string, string> {
  if (!json) return {};
  try {
    return JSON.parse(json);
  } catch {
    return {};
  }
}
