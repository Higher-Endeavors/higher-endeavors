import { type NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(request: NextRequest) {
  try {
    // Create Checkout Sessions from body params.
    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      line_items: [
        {
          // Provide the exact Price ID (for example, pr_1234) of
          // the product you want to sell
          price: 'price_1QL9QTDCooGuySd3Wg3fxq5K',
          quantity: 1,
        },
      ],
      mode: "subscription",
      return_url: `${request.headers.get(
        "origin"
      )}/subscribe/checkout-result?session_id={CHECKOUT_SESSION_ID}`,
      automatic_tax: { enabled: true },
    });

    return NextResponse.json({ clientSecret: session.client_secret });
  } catch (err: any) {
    console.log("Error: ", err);
    return NextResponse.json({ error: err.type, status: err.statusCode });
  }
}

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get("session_id");
    if (!sessionId) {
      return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
    }
    
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    return NextResponse.json({
      status: session.status,
      customer_email: session.customer_details?.email,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.type, status: err.statusCode });
  }
}
