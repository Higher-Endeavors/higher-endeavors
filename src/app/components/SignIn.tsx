import { signIn } from "@/app/auth"
 
export default function SignIn() {
  return (
    <form
      action={async () => {
        "use server"
        await signIn()
      }}
    >
      <button type="submit">Signin with Cognito</button>
    </form>
  )
} 