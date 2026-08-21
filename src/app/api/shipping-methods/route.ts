import { NextResponse } from "next/server";
import { fetchShippingMethods } from "@/lib/api/shipping";

export async function GET(request: Request) {
  const governorate = new URL(request.url).searchParams.get("governorate") ?? "";
  if (!governorate) return NextResponse.json({ data: [] });
  const data = await fetchShippingMethods(governorate);
  return NextResponse.json({ data });
}
