'use client';

import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import GeneralInfo from './GeneralInfo';
import LifestyleInfo from './LifestyleInfo';
import HealthInfo from './HealthInfo';
import NutritionInfo from './NutritionInfo';
import FitnessInfo from './FitnessInfo';
import { clientLogger } from '@/app/lib/logging/logger.client';

// Define a schema that allows all fields to be optional but ensures correct types
const formSchema = z.object({
  // Weight-related fields - optional but must be numbers if provided
  currentWeight: z.number().min(0).max(1000).optional().nullable(),
  idealWeight: z.number().min(0).max(1000).optional().nullable(),
  weightOneYearAgo: z.number().min(0).max(1000).optional().nullable(),
  
  // Relationship fields
  relationshipStatus: z.string().optional(),
  parentalStatus: z.string().optional(),
  numberOfChildren: z.number().min(0).max(20).optional().nullable(),
  children: z.array(
    z.object({
      age: z.number().min(0).max(100).optional(),
      gender: z.string().optional()
    })
  ).optional(),
  
  // Text fields - all optional
  familyLivingSituation: z.string().optional(),
  employmentStatus: z.string().optional(),
  occupationSchedule: z.string().optional(),
  recreationHobbies: z.string().optional(),
  primaryGoal: z.string().optional(),
  goalTimeframe: z.string().optional(),
  motivationLevel: z.number().min(1).max(10).optional().nullable(),
  supportSystem: z.string().optional(),
  previousExperience: z.string().optional(),
  majorLifeChanges: z.string().optional()
}).partial(); // Make all fields optional

type FormData = z.infer<typeof formSchema>;

const IntakeForm = () => {
  const methods = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentWeight: null,
      idealWeight: null,
      weightOneYearAgo: null,
      numberOfChildren: null,
      motivationLevel: null
    }
  });
  
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loadSavedData = async () => {
      try {
        // First try to load from localStorage
        const savedData = localStorage.getItem('intakeFormData');
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          methods.reset(parsedData);
          setIsLoading(false);
          return;
        }

        // If no localStorage data, fetch from API
        const response = await fetch('/api/user/intake-form');
        const data = await response.json();
        
        // Reset form with data (will be empty object if no data exists)
        methods.reset(data);
      } catch (error) {
        clientLogger.error('Error loading intake form data', error);
        // On error, just start with an empty form
        methods.reset({});
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedData();
  }, [methods]);

  const onSubmit = async (data: FormData) => {
    setSubmitError(null);
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/user/intake-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setSubmitError(result.error || 'Failed to submit form. Please try again.');
        return;
      }

      // Clear form data from local storage after successful submission
      localStorage.removeItem('intakeFormData');
      
      // Redirect to success page or dashboard
      router.push('/user/dashboard?success=intake-form');
    } catch (error) {
      clientLogger.error('Error submitting intake form', error);
      setSubmitError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
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

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <FormProvider {...methods}>
      <form className="mx-auto px-12 py-8 lg:px-36 xl:px-72" onSubmit={methods.handleSubmit(onSubmit)}>
        {renderStep()}
        {submitError && (
          <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-md">
            {submitError}
          </div>
        )}
        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={saveProgress}
            className="hover:shadow-form rounded-md bg-gray-500 hover:bg-gray-600 py-3 px-8 text-base font-semibold text-white outline-none"
          >
            Save Progress
          </button>
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="hover:shadow-form rounded-md bg-purple-500 hover:bg-[#9400D3] py-3 px-8 text-base font-semibold text-white outline-none mr-4"
                disabled={isSubmitting}
              >
                Previous
              </button>
            )}
            {step < 5 ? (
              <button
                type="button"
                onClick={nextStep}
                className="hover:shadow-form rounded-md bg-purple-500 hover:bg-[#9400D3] py-3 px-8 text-base font-semibold text-white outline-none"
                disabled={isSubmitting}
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                className="hover:shadow-form rounded-md bg-purple-500 hover:bg-[#9400D3] py-3 px-8 text-base font-semibold text-white outline-none disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            )}
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default IntakeForm; 