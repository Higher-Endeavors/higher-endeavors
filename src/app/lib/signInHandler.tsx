"use server";

import { signIn } from "@/app/auth"


export async function signInHandler() {
    await signIn("cognito")
}
