async function fetchAPI(query) {
  const url = process.env.NEXT_PUBLIC_STRAPI_REST_API_URL;

  const res = await fetch(url.concat(query), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.STRAPI_REST_API_SECRET}`,
    },
  }
);
const json = await res.json()
if (json.error) {
  throw new Error('Failed to fetch API')
}

return json.data

}

export async function getArticleBySlug(slug) {
  const data = await fetchAPI(
    `/api/guides?filters[slug][$eq]=${slug}&fields[0]=title&fields[1]=excerpt&fields[2]=body`
  );
  return data;
}
