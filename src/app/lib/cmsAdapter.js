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

export async function getRecentArticles() {
  const data = await fetchAPI(
    `/api/guides?sort[0]=createdAt:desc&pagination[limit]=5&fields[0]=title&fields[1]=excerpt&fields[2]=slug`
  );
  return data;
}

export async function getArticles() {
  const data = await fetchAPI(
    `/api/guides?fields[0]=title&fields[1]=slug&fields[2]=excerpt&populate[0]=categories&sort[0]=createdAt:desc`
  );
  return { data };
}
export async function getRecipes() {
  const data = await fetchAPI(
    `/api/recipes?fields[0]=title&fields[1]=slug&fields[2]=excerpt&populate[0]=tags&populate[1]=categories&sort[0]=createdAt:desc`
  );
  return { data };
}

export async function getRecipeBySlug(slug) {
  const data = await fetchAPI(
    `/api/recipes?filters[slug][$eq]=${slug}&fields[0]=title&fields[1]=excerpt&fields[2]=body`
  );
  return data;
}

export async function getRecentRecipes() {
  const data = await fetchAPI(
    `/api/recipes?sort[0]=createdAt:desc&pagination[limit]=5&fields[0]=title&fields[1]=excerpt&fields[2]=slug`
  );
  return data;
}
