import { NextResponse } from "next/server";
import Stripe from "stripe";
import { SingleQuery } from "@/app/lib/dbAdapter";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: Request) {
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      await (await req.blob()).text(),
      req.headers.get("stripe-signature") as string,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    // On error, log and return the error message.
    if (err! instanceof Error) console.log(err);
    console.log(`❌ Error message: ${errorMessage}`);
    return NextResponse.json(
      { message: `Webhook Error: ${errorMessage}` },
      { status: 400 }
    );
  }

  // Successfully constructed event.
  // console.log("✅ Success:", event.id);

  const permittedEvents: string[] = [
    "customer.subscription.deleted",
    "customer.deleted",
  ];

  if (permittedEvents.includes(event.type)) {
    let data;

    try {
      switch (event.type) {
        case "customer.subscription.deleted":
          data = event.data.object as Stripe.Subscription;
          const subscriptionQueryText = {
            text: "UPDATE users SET role = $1 WHERE stripe_cust_id = $2",
            values: [null, data.customer],
          };
          try {
            const result = await SingleQuery(subscriptionQueryText);
          } catch (error) {
            console.error("Failed to update user:", error);
          }
          break;
        case "customer.deleted":
          data = event.data.object as Stripe.Customer;
          const customerQueryText = {
            text: "UPDATE users SET stripe_cust_id = $1, role = $2 WHERE stripe_cust_id = $3",
            values: [null, null, data.id],
          };
          try {
            const result = await SingleQuery(customerQueryText);
          } catch (error) {
            console.error("Failed to update user:", error);
          }
          break;
        default:
          throw new Error(`Unhandled event: ${event.type}`);
      }
    } catch (error) {
      console.log(error);
      return NextResponse.json(
        { message: "Webhook handler failed" },
        { status: 500 }
      );
    }
  }
  // Return a response to acknowledge receipt of the event.
  return NextResponse.json({ message: "Received" }, { status: 200 });
}
