//"use client"
import { signOut } from "@/app/auth"
 
 export default function SignOut() {
  return (
    <form
      action={async () => {
        "use server"
        await signOut()
      }}
    >
      <button type="submit">Signout</button>
    </form>
  )
}
 
/* export default function SignOut() {
  return <button onClick={() => signOut()}>Sign Out</button>
} */