import { Flame, Heart, Users } from "lucide-react";
import { getAboutPage } from "@/lib/data";
import { PageMetadata } from "@/components/PageMetadata";

export default async function AboutPage() {
  const about = await getAboutPage();

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
      <PageMetadata title={about.title} description={about.paragraph_1} />
      <h1 className="font-display text-4xl font-semibold text-ink-900">{about.title}</h1>
      <p className="mt-5 text-lg leading-relaxed text-ink-600">
        {about.paragraph_1}
      </p>
      <p className="mt-4 leading-relaxed text-ink-600">
        {about.paragraph_2}
      </p>

      <div className="mt-12 grid gap-8 sm:grid-cols-3">
        <div>
          <Flame className="h-6 w-6 text-terracotta-600" />
          <h3 className="mt-3 font-semibold text-ink-900">{about.features[2].title}</h3>
          <p className="mt-1 text-sm text-ink-600">{about.features[2].description}</p>
        </div>
        <div>
          <Users className="h-6 w-6 text-terracotta-600" />
          <h3 className="mt-3 font-semibold text-ink-900">{about.features[1].title}</h3>
          <p className="mt-1 text-sm text-ink-600">{about.features[1].description}</p>
        </div>
        <div>
          <Heart className="h-6 w-6 text-terracotta-600" />
          <h3 className="mt-3 font-semibold text-ink-900">{about.features[0].title}</h3>
          <p className="mt-1 text-sm text-ink-600">{about.features[0].description}</p>
        </div>
      </div>
    </div>
  );
}
