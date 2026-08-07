"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { getCart, getCartTotals } from "@/lib/cart";
import { validateDiscountCode } from "@/lib/discount";
import { computeOrderTotals, type ShippingMethodKey } from "@/lib/pricing";
import { isStripeConfigured, getStripe } from "@/lib/stripe";
import { sendEmail } from "@/lib/email";

const addressSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  fullName: z.string().min(2, "Enter your full name."),
  line1: z.string().min(3, "Enter your street address."),
  line2: z.string().optional(),
  city: z.string().min(1, "Enter your city."),
  state: z.string().min(1, "Enter your state/province."),
  postalCode: z.string().min(3, "Enter your postal code."),
  country: z.string().min(2).default("US"),
  phone: z.string().optional(),
  shippingMethod: z.enum(["standard", "express"]).default("standard"),
  saveAddress: z.coerce.boolean().optional(),
});

export type CheckoutState = { error?: string };

export async function createOrder(_prev: CheckoutState, formData: FormData): Promise<CheckoutState> {
  const parsed = addressSchema.safeParse({
    email: formData.get("email"),
    fullName: formData.get("fullName"),
    line1: formData.get("line1"),
    line2: formData.get("line2") || undefined,
    city: formData.get("city"),
    state: formData.get("state"),
    postalCode: formData.get("postalCode"),
    country: formData.get("country") || "US",
    phone: formData.get("phone") || undefined,
    shippingMethod: formData.get("shippingMethod") || "standard",
    saveAddress: formData.get("saveAddress") ? true : false,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check your shipping details." };
  }
  const data = parsed.data;

  const cart = await getCart();
  if (!cart || cart.items.length === 0) {
    return { error: "Your cart is empty." };
  }

  for (const item of cart.items) {
    if (item.quantity > item.variant.stock) {
      return { error: `Sorry, only ${item.variant.stock} of "${item.product.name}" (${item.variant.name}) left in stock.` };
    }
  }

  const session = await auth();
  const cookieStore = await cookies();
  const discountCode = cookieStore.get("discount_code")?.value ?? null;

  const { subtotal } = getCartTotals(cart);
  let discountAmount = 0;
  if (discountCode) {
    const result = await validateDiscountCode(discountCode, subtotal);
    if (result.valid) discountAmount = result.amount;
  }

  const { shippingCost, taxTotal, total } = computeOrderTotals({
    subtotal,
    discountAmount,
    shippingMethod: data.shippingMethod as ShippingMethodKey,
  });

  let addressId: string | undefined;
  if (session?.user && data.saveAddress) {
    const existingCount = await prisma.address.count({ where: { userId: session.user.id } });
    const address = await prisma.address.create({
      data: {
        userId: session.user.id,
        fullName: data.fullName,
        line1: data.line1,
        line2: data.line2,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country,
        phone: data.phone,
        isDefault: existingCount === 0,
      },
    });
    addressId = address.id;
  }

  const orderNumber = `KW-${randomUUID().slice(0, 8).toUpperCase()}`;
  const paymentMethod = isStripeConfigured() ? "stripe" : "simulated";

  const order = await prisma.order.create({
    data: {
      orderNumber,
      userId: session?.user?.id,
      guestEmail: session?.user ? undefined : data.email,
      status: paymentMethod === "simulated" ? "PAID" : "PENDING",
      subtotal,
      shippingCost,
      taxTotal,
      discountTotal: discountAmount,
      discountCode: discountAmount > 0 ? discountCode : undefined,
      total,
      shippingAddress: JSON.stringify({
        fullName: data.fullName,
        line1: data.line1,
        line2: data.line2,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country,
        phone: data.phone,
      }),
      addressId,
      shippingMethod: data.shippingMethod,
      paymentMethod,
      items: {
        create: cart.items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          productName: item.product.name,
          variantName: item.variant.name,
          price: item.variant.price,
          quantity: item.quantity,
        })),
      },
    },
  });

  // Reserve stock at order placement (see README for the Stripe-abandoned-cart caveat).
  for (const item of cart.items) {
    await prisma.productVariant.update({
      where: { id: item.variantId },
      data: { stock: { decrement: item.quantity } },
    });
  }

  if (discountCode && discountAmount > 0) {
    await prisma.discountCode.update({
      where: { code: discountCode },
      data: { usageCount: { increment: 1 } },
    });
  }

  if (paymentMethod === "stripe") {
    const stripe = getStripe();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: data.email,
      line_items: cart.items.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: { name: `${item.product.name} — ${item.variant.name}` },
          unit_amount: Math.round(item.variant.price * 100),
        },
        quantity: item.quantity,
      })),
      shipping_options: [
        { shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: { amount: Math.round(shippingCost * 100), currency: "usd" },
          display_name: data.shippingMethod === "express" ? "Express Shipping" : "Standard Shipping",
        }},
      ],
      metadata: { orderId: order.id, orderNumber },
      success_url: `${siteUrl}/checkout/success?order=${orderNumber}`,
      cancel_url: `${siteUrl}/checkout`,
    });

    await prisma.order.update({ where: { id: order.id }, data: { stripeSessionId: checkoutSession.id } });
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    cookieStore.delete("discount_code");

    if (checkoutSession.url) redirect(checkoutSession.url);
    return { error: "Could not start Stripe Checkout. Please try again." };
  }

  // Simulated payment: mark paid immediately and send a confirmation email.
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  cookieStore.delete("discount_code");

  await sendEmail({
    to: data.email,
    subject: `Order Confirmed — ${orderNumber}`,
    text: `Thanks for your order, ${data.fullName}!\n\nOrder ${orderNumber}\nTotal: $${total.toFixed(2)}\n\nWe'll email you when it ships.`,
  });

  redirect(`/checkout/success?order=${orderNumber}`);
}
