import Stripe from "stripe";
import { redirect } from 'next/navigation';
import { auth } from "@/app/auth";
import { SingleQuery } from "@/app/lib/dbAdapter";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

async function updateUser(custStripeId: string, custRole: string | null ) {
  const session = await auth();
  const userId = session?.user.id;
  const queryText = {
    text: 'UPDATE users SET stripe_cust_id = $1, role = $2 WHERE id = $3',
    values: [custStripeId, custRole, userId]
  };
try {
  const result =  await SingleQuery(queryText);

  } catch (error) {
    console.error('Failed to update user:', error);
  }
}

export default async function Page(props: {
  searchParams?: Promise<{
    session_id?: string;
  }>;
}){
  const searchParams = await props.searchParams;
  if (!searchParams?.session_id)
    throw new Error("Please provide a valid session_id (`cs_test_...`)");

  const checkoutSession: Stripe.Checkout.Session =
    await stripe.checkout.sessions.retrieve(searchParams.session_id);

  const checkoutStatus = checkoutSession.status;

  if (checkoutStatus === 'open') {
    return (
      redirect('/')
    )
  }

  if (checkoutStatus === 'complete') {
    const checkoutMode = checkoutSession.mode;
    const custRole = checkoutSession.mode == "subscription" ? "user" : null;
    const custStripeId = checkoutSession.customer as string;
    const custEmail = checkoutSession.customer_email;

    updateUser(custStripeId, custRole)
    
    return (
      <section id="success">
        <p>
          We appreciate your business! A confirmation email will be sent to {custEmail}.

          If you have any questions, please email <a href="mailto:orders@example.com">orders@example.com</a>.
        </p>
      </section>
    )
  }

  return null;
}
