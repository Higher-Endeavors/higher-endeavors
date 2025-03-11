"use client";

import { Avatar, Dropdown } from "flowbite-react";
import { signInHandler } from "@/app/lib/signInHandler";
import { useSession } from "next-auth/react";
import Link from 'next/link';

export default function DropdownMenu() {

    const { data: session } = useSession();

    const firstName = session?.user?.first_name ?? null;
    const lastName = session?.user?.last_name ?? null;
    const fullName = session?.user?.name ?? "User name";
    const emailAddress = session?.user?.email ?? "Email address";
    var initials = "";
    if (firstName && lastName) {
        initials = (firstName.charAt(0) + lastName.charAt(0)).toLowerCase();
    } else {
        const initials = null;
    }


    async function signOutHandler() {
        const cognitoClient = process.env.NEXT_PUBLIC_COGNITO_CLIENT;
        const cognitoAuthUrl = process.env.NEXT_PUBLIC_COGNITO_AUTH_URL;

        try {
            await fetch('/api/signout', {
                method: 'POST',
                headers: { 'Content-Type': 'plain/text' },
            });
        } catch (error) {
            console.error('Error signing out:', error);
        }

        window.open(`https://auth.higherendeavors.com/logout?client_id=${cognitoClient}&logout_uri=${cognitoAuthUrl}`, "_self");
    }

    return (
        <Dropdown
            label={<Avatar placeholderInitials={initials} rounded />}
            arrowIcon={false}
            inline
            className="[&_ul]:list-none [&_ul]:p-0"
        >
            <Dropdown.Header>
                <span className="block text-sm">{session?.user?.name ?? "User name"}</span>
                <span className="block truncate text-sm font-medium">{session?.user?.email ?? "Email address"}</span>
            </Dropdown.Header>
            {session && (
                <>
                    <Dropdown.Item as={Link} href="/user/dashboard">
                        Dashboard
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} href="/guide/table-of-contents">
                        Guide Table of Contents
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} href="/user/bio">User Bio</Dropdown.Item>
                    <Dropdown.Item as={Link} href="/user/settings">User Settings</Dropdown.Item>
                </>
            )}
            <Dropdown.Divider />
            {!session && (
                <Dropdown.Item onClick={async () => {
                    await signInHandler("")
                }}>Sign in</Dropdown.Item>
            )}
            {session && (
                <Dropdown.Item onClick={() => signOutHandler()}>Sign out</Dropdown.Item>
            )}
        </Dropdown>
    );
}
