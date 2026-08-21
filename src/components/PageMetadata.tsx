export function PageMetadata({ title, description }: { title: string; description?: string | null }) {
  const fullTitle = `${title} | Kiln & Wick Craft Supply`;
  return <><title>{fullTitle}</title>{description ? <meta name="description" content={description} /> : null}<meta property="og:title" content={title} />{description ? <meta property="og:description" content={description} /> : null}</>;
}
