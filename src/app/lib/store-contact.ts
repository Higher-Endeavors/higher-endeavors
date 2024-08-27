import { FormData } from '../(about)/contact/components/ContactForm';

export function storeContact(data: FormData) {
  const apiEndpoint = '/api/db';

  fetch(apiEndpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .catch((err) => {
      alert(err);
    });
}