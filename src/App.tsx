import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LocaleProvider } from "@/components/i18n/LocaleProvider";
import { DEFAULT_LOCALE, isLocale, localeDirection, LOCALE_COOKIE } from "@/lib/i18n/config";
import { ProtectedRoute } from "@/auth/ProtectedRoute";
import { AsyncContent, AsyncRoute } from "@/routes/AsyncRoute";
import HomePage from "@/pages/HomePage";
import ShopPage from "@/pages/ShopPage";
import ProductPage from "@/pages/ProductPage";
import CategoryPage from "@/pages/CategoryPage";
import CartPage from "@/pages/CartPage";
import CheckoutPage from "@/pages/checkout/CheckoutPage";
import CheckoutSuccessPage from "@/pages/checkout/CheckoutSuccessPage";
import SearchPage from "@/pages/SearchPage";
import AccountPage from "@/pages/account/AccountPage";
import LoginPage from "@/pages/account/LoginPage";
import RegisterPage from "@/pages/account/RegisterPage";
import ForgotPasswordPage from "@/pages/account/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/account/ResetPasswordPage";
import AddressesPage from "@/pages/account/AddressesPage";
import OrdersPage from "@/pages/account/OrdersPage";
import WishlistPage from "@/pages/account/WishlistPage";
import BlogPage from "@/pages/blog/BlogPage";
import BlogPostPage from "@/pages/blog/BlogPostPage";
import AboutPage from "@/pages/AboutPage";
import ContactPage from "@/pages/ContactPage";
import FaqPage from "@/pages/FaqPage";
import ShippingReturnsPage from "@/pages/ShippingReturnsPage";
import PrivacyPage from "@/pages/PrivacyPage";
import TermsPage from "@/pages/TermsPage";
import { PageMetadata } from "@/components/PageMetadata";

const routes: Array<{ path: string; page: unknown; protected?: boolean; title?: string; description?: string }> = [
  { path: "/", page: HomePage, title: "Handmade & Home-Based Craft Supplies", description: "Shop candle-making, resin, soap-making, molds, fragrances, concrete, and wooden craft supplies. Warm, well-tested materials for makers of every level." },
  { path: "/shop", page: ShopPage, title: "Shop All Craft Supplies" },
  { path: "/product/:slug", page: ProductPage }, { path: "/category/:slug", page: CategoryPage },
  { path: "/cart", page: CartPage, title: "Your Cart" }, { path: "/checkout", page: CheckoutPage, protected: true, title: "Checkout" }, { path: "/checkout/success", page: CheckoutSuccessPage, title: "Order Confirmation" }, { path: "/search", page: SearchPage, title: "Search Results" },
  { path: "/account", page: AccountPage, protected: true, title: "My Account" }, { path: "/account/login", page: LoginPage, title: "Log In" }, { path: "/account/register", page: RegisterPage, title: "Create Account" }, { path: "/account/forgot-password", page: ForgotPasswordPage, title: "Reset Your Password" }, { path: "/account/reset-password/:token", page: ResetPasswordPage, title: "Reset Your Password" }, { path: "/account/addresses", page: AddressesPage, protected: true, title: "My Addresses" }, { path: "/account/orders", page: OrdersPage, protected: true, title: "My Orders" }, { path: "/account/wishlist", page: WishlistPage, protected: true, title: "Wishlist" },
  { path: "/blog", page: BlogPage, title: "Tutorials & Inspiration" }, { path: "/blog/:slug", page: BlogPostPage }, { path: "/about", page: AboutPage, title: "About Us" }, { path: "/contact", page: ContactPage, title: "Contact Us" }, { path: "/faq", page: FaqPage, title: "Frequently Asked Questions" }, { path: "/shipping-returns", page: ShippingReturnsPage, title: "Shipping & Returns" }, { path: "/privacy", page: PrivacyPage, title: "Privacy Policy" }, { path: "/terms", page: TermsPage, title: "Terms of Service" },
];
function NotFound() { useEffect(() => { document.title = "Page Not Found | Craft Supplies"; }, []); return <div className="mx-auto max-w-3xl px-4 py-24 text-center"><h1 className="font-display text-4xl font-semibold text-ink-900">Page not found</h1><p className="mt-3 text-ink-500">The page you requested does not exist.</p></div>; }
export default function App() {
  const [locale, setLocale] = useState(() => { const value = localStorage.getItem(LOCALE_COOKIE); return isLocale(value) ? value : DEFAULT_LOCALE; });
  useEffect(() => { const update = () => { const value = localStorage.getItem(LOCALE_COOKIE); setLocale(isLocale(value) ? value : DEFAULT_LOCALE); }; window.addEventListener("storefront:locale", update); return () => window.removeEventListener("storefront:locale", update); }, []);
  useEffect(() => { document.documentElement.lang = locale; document.documentElement.dir = localeDirection(locale); }, [locale]);
  return <LocaleProvider locale={locale}><div className="flex min-h-screen flex-col"><AsyncContent render={Header} cacheKey={`header:${locale}`} /><main className="flex-1"><Routes>{routes.map((route) => { const content = <><AsyncRoute page={route.page} />{route.title ? <PageMetadata title={route.title} description={route.description} /> : null}</>; return <Route key={route.path} path={route.path} element={route.protected ? <ProtectedRoute>{content}</ProtectedRoute> : content} />; })}<Route path="/admin/*" element={<Navigate to={`${import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8000"}/admin`} replace />} /><Route path="*" element={<NotFound />} /></Routes></main><AsyncContent render={Footer} cacheKey={`footer:${locale}`} /></div></LocaleProvider>;
}
