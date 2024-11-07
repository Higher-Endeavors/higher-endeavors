import axios from 'axios';

async function fetchAPI(query) {
  const url = process.env.NEXT_PUBLIC_STRAPI_REST_API_URL;
  
  try {
    const response = await axios.get(url.concat(query), {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.STRAPI_REST_API_SECRET}`,
      },
    });
    
    return response.data.data;
  } catch (error) {
    throw new Error('Failed to Axios GET failed');
  }
}

export async function getArticleBySlug(slug) {
  const data = await fetchAPI(
    `/api/guides?filters[slug][$eq]=${slug}&fields[0]=title&fields[1]=excerpt&fields[2]=body`
  );
  return data;
}
