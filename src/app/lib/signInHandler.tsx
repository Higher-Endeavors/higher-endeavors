"use server";

import { signIn } from "@/app/auth"


export async function signInHandler(redirect: string) {
    if (redirect == "") {
        await signIn("cognito");
    } else {
    await signIn("cognito", { redirectTo: redirect });
    }
}
