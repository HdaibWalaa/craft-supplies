export function PageMetadata({ title, description }: { title: string; description?: string | null }) {
  const fullTitle = `${title} | Craft Supplies`;
  return <><title>{fullTitle}</title>{description ? <meta name="description" content={description} /> : null}<meta property="og:site_name" content="Craft Supplies" /><meta property="og:title" content={fullTitle} />{description ? <meta property="og:description" content={description} /> : null}</>;
}
