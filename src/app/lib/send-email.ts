import { FormData } from '../(about)/contact/components/ContactForm';

export function sendEmail(data: FormData) {
  const apiEndpoint = '/api/email';

  fetch(apiEndpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .catch((err) => {
      alert(err);
    });
}