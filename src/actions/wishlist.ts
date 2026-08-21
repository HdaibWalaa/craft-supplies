import { addWishlistProduct, fetchWishlist, removeWishlistProduct } from "@/lib/api/wishlist";
import { clientStorage } from "@/lib/storage";
type Result = { error: string; requiresLogin: true; wishlisted?: undefined } | { wishlisted: boolean; error?: undefined; requiresLogin?: undefined };
export async function toggleWishlist(productId: string, _productSlug: string): Promise<Result> { if (!clientStorage.getAuthToken()) return { error: "Please log in to use your wishlist.", requiresLogin: true }; const existing = (await fetchWishlist()).some((product) => product.id === productId); if (existing) await removeWishlistProduct(productId); else await addWishlistProduct(productId); window.dispatchEvent(new Event("storefront:refresh")); return { wishlisted: !existing }; }
