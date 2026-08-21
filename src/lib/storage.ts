const storage = () => typeof window === "undefined" ? null : window.localStorage;
export const clientStorage = {
  getAuthToken: () => storage()?.getItem("kw_api_token") ?? null,
  setAuthToken: (value: string) => storage()?.setItem("kw_api_token", value),
  clearAuthToken: () => storage()?.removeItem("kw_api_token"),
  getCartToken: () => storage()?.getItem("cart_token") ?? null,
  setCartToken: (value: string) => storage()?.setItem("cart_token", value),
  clearCartToken: () => storage()?.removeItem("cart_token"),
  getDiscountCode: () => storage()?.getItem("discount_code") ?? null,
  setDiscountCode: (value: string) => storage()?.setItem("discount_code", value),
  clearDiscountCode: () => storage()?.removeItem("discount_code"),
};
