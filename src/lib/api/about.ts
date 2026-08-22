import { apiRequest } from "@/lib/api/client";

export type AboutPageContent = {
  title: string;
  paragraph_1: string;
  paragraph_2: string;
  features: Array<{
    title: string;
    description: string;
  }>;
};

export async function fetchAboutPage() {
  return apiRequest<{ data: AboutPageContent }>("about-page", { cache: "no-store" });
}
