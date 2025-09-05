// Utility function to get the base URL for client fetch calls
import { headers } from "next/headers";

export async function getFetchBaseUrl(): Promise<string> {
  const host = window.location.host;
  const protocol = host?.includes("localhost") ? "http" : "https";

  return `${protocol}://${host}`;
}
