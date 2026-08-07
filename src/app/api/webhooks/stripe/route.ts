import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { sendEmail } from "@/lib/email";

/**
 * Marks an order PAID once Stripe confirms payment. Only reachable when
 * STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET are configured — register this
 * route (`/api/webhooks/stripe`) in the Stripe dashboard once real keys
 * are added. The simulated checkout path used by default doesn't need this.
 */
export async function POST(req: Request) {
  if (!isStripeConfigured() || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 400 });
  }

  const stripe = getStripe();
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature ?? "", process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;
    if (orderId) {
      const order = await prisma.order.update({
        where: { id: orderId },
        data: { status: "PAID" },
      });
      await sendEmail({
        to: session.customer_email ?? order.guestEmail ?? "",
        subject: `Order Confirmed — ${order.orderNumber}`,
        text: `Thanks for your order!\n\nOrder ${order.orderNumber}\nTotal: $${order.total.toFixed(2)}\n\nWe'll email you when it ships.`,
      });
    }
  }

  return NextResponse.json({ received: true });
}
