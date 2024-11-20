import { type NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/app/auth";
import { SingleQuery } from "@/app/lib/dbAdapter";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(request: NextRequest) {
  const { priceType, priceCode } = await request.json();
  const session = await auth();
  const userId = session?.user.id;

  const queryText = {
    text: `SELECT stripe_cust_id FROM users WHERE id = ${userId}`,
  };
  const result =  await SingleQuery(queryText);
  const stripeCustId = result.rows[0].stripe_cust_id;
  console.log("result: ", stripeCustId);

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      ...(stripeCustId ? { customer: stripeCustId } : (priceType === "payment" ? { customer_creation: "if_required" } : {})),
      ui_mode: "embedded",
      line_items: [
        {
          price: `${priceCode}`,
          quantity: 1,
        },
      ],
      mode: priceType as 'subscription' | 'payment',
      return_url: `${request.headers.get(
        "origin"
      )}/sales/checkout-result?session_id={CHECKOUT_SESSION_ID}`,
      automatic_tax: { enabled: true },
      // ...(priceType === "payment" ? { customer_creation: "if_required" } : {}),
    });
    return NextResponse.json({ clientSecret: checkoutSession.client_secret });
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
    
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);
    // console.log("Checkout Session: ", checkoutSession)

    return NextResponse.json({
      status: checkoutSession.status,
      customer_email: checkoutSession.customer_details?.email,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.type, status: err.statusCode });
  }
}
