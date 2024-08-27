'use client';

import { useForm, SubmitHandler } from "react-hook-form"
import { useEffect } from 'react'
import { sendEmail } from '@/app/lib/send-email';
import { storeContact } from '@/app/lib/store-contact';

export type FormData = {
  firstname: string;
  lastname: string;
  email: string;
  message: string;
};

const Contact = () => {
  const { register, handleSubmit, reset, formState: { isSubmitSuccessful, errors }, } = useForm<FormData>();

  const onSubmit: SubmitHandler<FormData> = (data) => {
        sendEmail(data);
        storeContact(data);
  }

  useEffect(() => {
    reset()
  }, [isSubmitSuccessful])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md mx-auto">
      <div className='mb-2'>
        <label
          htmlFor='name'
          className='mb-3 block text-base font-medium text-black dark:text-white'
        >
          First Name
        </label>
        <input
          type='text'
          placeholder='First Name'
          className='w-full rounded-md border border-gray-300 bg-white py-3 px-6 text-base font-medium text-gray-700 outline-none focus:border-purple-500 focus:shadow-md'
          {...register('firstname', { required: "First name is required" })}
        />
      </div>
      {errors.firstname && <p className="errorMsg">{errors.firstname.message}</p>}
      <div className='mb-2'>
        <label
          htmlFor='name'
          className='mb-3 block text-base font-medium text-black dark:text-white'
        >
          Last Name
        </label>
        <input
          type='text'
          placeholder='Last Name'
          className='w-full rounded-md border border-gray-300 bg-white py-3 px-6 text-base font-medium text-gray-700 outline-none focus:border-purple-500 focus:shadow-md'
          {...register('lastname', { required: "Last name is required" })}
        />
      </div>
      {errors.lastname && <p className="errorMsg">{errors.lastname.message}</p>}
      <div className='mb-5'>
        <label
          htmlFor='email'
          className='mb-3 block text-base font-medium text-black dark:text-white'
        >
          Email Address
        </label>
        <input
          type='email'
          placeholder='example@domain.com'
          className='w-full rounded-md border border-gray-300 bg-white py-3 px-6 text-base font-medium text-gray-700 outline-none focus:border-purple-500 focus:shadow-md'
          {...register('email', {
            required: "Valid email is required",
            pattern: {
              value: /^[^@ ]+@[^@ ]+\.[^@ .]{2,}$/,
              message: "Email is not valid."
            }
          })}
        />
        {errors.email && <p className="errorMsg">{errors.email.message}</p>}

      </div>
      <div className='mb-5'>
        <label
          htmlFor='message'
          className='mb-3 block text-base font-medium text-black dark:text-white'
        >
          Message
        </label>
        <textarea
          rows={4}
          placeholder='Type your message'
          className='w-full resize-none rounded-md border border-gray-300 bg-white py-3 px-6 text-base font-medium text-gray-700 outline-none focus:border-purple-500 focus:shadow-md'
          {...register('message', { required: "Why send an email with no message?" })}
        ></textarea>
        {errors.message && <p className="errorMsg">{errors.message.message}</p>}

      </div>
      <div>
        <button className='hover:shadow-form rounded-md bg-purple-500 hover:bg-[#9400D3] py-3 px-8 text-base font-semibold text-white outline-none'>
          Submit
        </button>
      </div>
    </form>
  );
};

export default Contact;