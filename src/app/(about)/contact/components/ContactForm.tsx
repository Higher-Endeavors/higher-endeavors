'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Turnstile } from '@marsidev/react-turnstile';

type FormData = {
  firstname: string;
  lastname: string;
  email: string;
  message: string;
};

async function sendErrorEmail(replyTo: string, subject: string, body: string) {
  try {
    await fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ replyTo, subject, body }),
    });
  } catch (error) {
    console.error('Failed to send error email:', error);
  }
}

export default function ContactForm() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>();
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isErrorVisible, setIsErrorVisible] = useState(false);

  const onSubmit = async (data: FormData) => {
    if (!turnstileToken) {
      setSubmitError('Please complete the Turnstile challenge');
      setIsErrorVisible(true);
      return;
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, turnstileToken }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit form');
      }

      reset();
      setSubmitError(null);
      setIsErrorVisible(false);
      // Show success message
    } catch (error) {
      console.log('Form submission error:', error);
      setSubmitError('An error occurred. Please try again.');
      setIsErrorVisible(true);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md mx-auto">
      <div className={`mb-4 p-4 bg-red-100 text-red-700 rounded-md ${isErrorVisible ? 'block' : 'hidden'}`}>
        {submitError}
      </div>

      <div className='mb-2'>
        <label
          htmlFor='name'
          className='mb-3 block text-base font-medium text-black dark:text-white'
        >
          First Name
        </label>
        <input
          {...register('firstname', { required: 'First name is required' })}
          id="firstname"
          className='w-full rounded-md border border-gray-300 bg-white py-3 px-6 text-base font-medium text-gray-700 outline-none focus:border-purple-500 focus:shadow-md'
        />
        {errors.firstname && <span className="text-red-500 text-sm mt-1">{errors.firstname.message}</span>}
      </div>

      <div className='mb-2'>
        <label
          htmlFor='name'
          className='mb-3 block text-base font-medium text-black dark:text-white'
        >
          Last Name
        </label>
        <input
          {...register('lastname', { required: 'Last name is required' })}
          id="lastname"
          className='w-full rounded-md border border-gray-300 bg-white py-3 px-6 text-base font-medium text-gray-700 outline-none focus:border-purple-500 focus:shadow-md'
        />
        {errors.lastname && <span className="text-red-500 text-sm mt-1">{errors.lastname.message}</span>}
      </div>

      <div className='mb-5'>
        <label
          htmlFor='email'
          className='mb-3 block text-base font-medium text-black dark:text-white'
        >
          Email Address
        </label>
        <input
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address',
            }
          })}
          id="email"
          className='w-full rounded-md border border-gray-300 bg-white py-3 px-6 text-base font-medium text-gray-700 outline-none focus:border-purple-500 focus:shadow-md'
        />
        {errors.email && <span className="text-red-500 text-sm mt-1">{errors.email.message}</span>}
      </div>

      <div className='mb-5'>
        <label
          htmlFor='message'
          className='mb-3 block text-base font-medium text-black dark:text-white'
        >
          Message
        </label>
        <textarea
          {...register('message', { required: 'Message is required' })}
          id="message"
          className='w-full resize-none rounded-md border border-gray-300 bg-white py-3 px-6 text-base font-medium text-gray-700 outline-none focus:border-purple-500 focus:shadow-md'
          rows={4}
        ></textarea>
        {errors.message && <span className="text-red-500 text-sm mt-1">{errors.message.message}</span>}
      </div>

      <div className='mb-5'>
        <Turnstile
          siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''}
          onSuccess={(token) => setTurnstileToken(token)}
          onError={(error) => {
            console.log('Turnstile client error', error)
            setSubmitError('Turnstile verification failed. Please try again.');
            setIsErrorVisible(true);
            sendErrorEmail(
              'noreply@higherendeavors.com',
              'Turnstile Error',
              `Turnstile client error: ${error }`);
          }}
          options={{ retry: "never" }}
        />
      </div>

      <button
        type="submit"
        disabled={!turnstileToken}
        className='hover:shadow-form rounded-md bg-purple-500 hover:bg-[#9400D3] py-3 px-8 text-base font-semibold text-white outline-none'
      >
        Submit
      </button>
    </form>
  );
}