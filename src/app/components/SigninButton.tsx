import { signIn } from "@/app/auth"
 
export function SignIn() {
  return (
    <form
      action={async () => {
        "use server"
        await signIn("cognito")
      }}
    >
      <button type="submit">Sign in</button>
    </form>
  )
}