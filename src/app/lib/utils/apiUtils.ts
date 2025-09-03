// Utility function to get the base URL for API calls
import { headers } from "next/headers";

export async function getApiBaseUrl(): Promise<string> {
  const host = (await headers()).get("host");
  const protocol = host?.includes("localhost") ? "http" : "https";

  return `${protocol}://${host}`;
}
