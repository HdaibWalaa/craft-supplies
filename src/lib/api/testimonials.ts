import { apiRequest } from "@/lib/api/client";

export type Testimonial = { id: string; rating: number; comment: string; authorName: string; product: { name: string; slug: string } };
export async function fetchTestimonials() { return (await apiRequest<{ data: Testimonial[] }>("testimonials", { revalidate: 300 })).data; }
