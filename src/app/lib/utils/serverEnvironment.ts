import { headers } from 'next/headers';

export async function getServerEnvironment(): Promise<string> {
  const headersList = await headers();
  const host = (await headers()).get("host");

  if (host?.includes("qa.higherendeavors.com")) {
    return 'qa';
  } else if (host?.includes("higherendeavors.com")) {
    return 'production';
  } else {
    return 'development';
  }
}
