'use client';

import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import GeneralInfo from './GeneralInfo';
import LifestyleInfo from './LifestyleInfo';
import HealthInfo from './HealthInfo';
import NutritionInfo from './NutritionInfo';
import FitnessInfo from './FitnessInfo';

type FormData = {
  // Define the form data types here
};

const IntakeForm = () => {
  const methods = useForm<FormData>();
  const [step, setStep] = useState(1);

  const onSubmit = async (data: FormData) => {
    try {
      // Placeholder for POST function to submit form data to the backend
      await fetch('/api/intake-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      // Clear form data from local storage after successful submission
      localStorage.removeItem('intakeFormData');
      // Reset form state and navigate to a success page or display a success message
    } catch (error) {
      console.error('Error submitting form:', error);
      // Handle error state
    }
  };

  const nextStep = () => {
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const saveProgress = () => {
    const formData = methods.getValues();
    localStorage.setItem('intakeFormData', JSON.stringify(formData));
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <GeneralInfo />;
      case 2:
        return <LifestyleInfo />;
      case 3:
        return <HealthInfo />;
      case 4:
        return <NutritionInfo />;
      case 5:
        return <FitnessInfo />;
      default:
        return null;
    }
  };

  return (
    <FormProvider {...methods}>
      <form className="mx-auto px-12 py-8 lg:px-36 xl:px-72" onSubmit={methods.handleSubmit(onSubmit)}>
        {renderStep()}
        {/* <button
          type="button"
          onClick={saveProgress}
          className="hover:shadow-form rounded-md bg-purple-500 hover:bg-[#9400D3] my-4 py-3 px-8 text-base font-semibold text-white outline-none mr-4 mb-4"
        >
          Save Progress
        </button> */}
        {step > 1 && (
          <button
            type="button"
            onClick={prevStep}
            className="hover:shadow-form rounded-md bg-purple-500 hover:bg-[#9400D3] my-4 py-3 px-8 text-base font-semibold text-white outline-none mr-4 mb-4"
          >
            Previous
          </button>
        )}
        {step < 5 ? (
          <button
            type="button"
            onClick={nextStep}
            className="hover:shadow-form rounded-md bg-purple-500 hover:bg-[#9400D3] my-4 py-3 px-8 text-base font-semibold text-white outline-none mr-4 mb-4"
          >
            Next
          </button>
        ) : (
          <button
            type="submit"
            className="hover:shadow-form rounded-md bg-purple-500 hover:bg-[#9400D3] my-4 py-3 px-8 text-base font-semibold text-white outline-none mr-4 mb-4"
          >
            Submit
          </button>
        )}
      </form>
    </FormProvider>
  );
};

export default IntakeForm; 