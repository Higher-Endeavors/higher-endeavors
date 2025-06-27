// Test

'use client';

import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Select from 'react-select';
import countries from 'world-countries';
import { Toast } from 'flowbite-react';
import { HiCheck, HiX } from 'react-icons/hi';
import { bioFormSchema, type BioFormData, type CountryOption } from '../types/bio';
import { useUserSettings } from '@/app/lib/hooks/useUserSettings';

// Format country data for react-select
let countryOptions = countries.map((country) => ({
  value: country.cca2,
  label: country.name.common,
}));

// Find United States and move it to the front of the array
const usIndex = countryOptions.findIndex(country => country.value === 'US');
if (usIndex > -1) {
  const us = countryOptions.splice(usIndex, 1)[0];
  countryOptions = [us, ...countryOptions];
}

export default function BioForm() {
  const { settings } = useUserSettings();
  const [showSuccessToast, setShowSuccessToast] = React.useState(false);
  const [showErrorToast, setShowErrorToast] = React.useState(false);
  const [selectedGender, setSelectedGender] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BioFormData>({
    resolver: zodResolver(bioFormSchema),
  });

  // Watch the gender field
  React.useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'gender') {
        setSelectedGender(value.gender || '');
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  // Load existing bio data
  useEffect(() => {
    const loadBioData = async () => {
      try {
        const response = await fetch('/api/user/bio');
        if (!response.ok) throw new Error('Failed to fetch bio data');
        
        const data = await response.json();
        if (Object.keys(data).length > 0) {
          // Convert snake_case to camelCase and set form values
          setValue('addressLine1', data.address_line_1);
          setValue('addressLine2', data.address_line_2);
          setValue('city', data.city);
          setValue('stateProvince', data.state_province);
          setValue('postalCode', data.postal_code);
          if (data.country) {
            const countryOption = countryOptions.find(c => c.value === data.country);
            setValue('country', countryOption);
          }
          setValue('phoneNumber', data.phone_number);
          // Format date for input
          if (data.date_of_birth) {
            const date = new Date(data.date_of_birth);
            setValue('dateOfBirth', date.toISOString().split('T')[0]);
          }
          setValue('gender', data.gender);
          setValue('height', data.height);
          setSelectedGender(data.gender);
        }
      } catch (error) {
        console.error('Error loading bio data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBioData();
  }, [setValue]);

  const onSubmit = async (data: BioFormData) => {
    try {
      const response = await fetch('/api/user/bio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to save bio data');
      }

      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (error) {
      console.error('Error saving bio:', error);
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed bottom-4 right-4 z-50">
          <Toast>
            <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-500">
              <HiCheck className="h-5 w-5" />
            </div>
            <div className="ml-3 text-sm font-normal">Bio updated successfully</div>
          </Toast>
        </div>
      )}

      {/* Error Toast */}
      {showErrorToast && (
        <div className="fixed bottom-4 right-4 z-50">
          <Toast>
            <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-500">
              <HiX className="h-5 w-5" />
            </div>
            <div className="ml-3 text-sm font-normal">Failed to update bio</div>
          </Toast>
        </div>
      )}

      {/* Personal Information Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold dark:text-slate-600">Personal Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Date of Birth */}
          <div>
            <label htmlFor="dateOfBirth" className="block mb-1 text-sm font-medium text-gray-700">
              Date of Birth
            </label>
            <input
              type="date"
              id="dateOfBirth"
              {...register('dateOfBirth')}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 dark:text-slate-800 ${
                errors.dateOfBirth ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {errors.dateOfBirth && (
              <span className="text-red-500 text-sm">{errors.dateOfBirth.message}</span>
            )}
          </div>

          {/* Gender */}
          <div>
            <label htmlFor="gender" className="block mb-1 text-sm font-medium text-gray-700">
              Gender
            </label>
            <select
              id="gender"
              {...register('gender')}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 dark:text-slate-800 ${
                errors.gender ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
              }`}
            >
              <option value="">Select...</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
            {errors.gender && (
              <span className="text-red-500 text-sm">{errors.gender.message}</span>
            )}
            {selectedGender === 'prefer-not-to-say' && (
              <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200 text-sm rounded-md">
                Note: Gender information is used throughout the site for various calculations and formulas, such as body fat percentage and other health metrics. Some features may have reduced accuracy or be unavailable without this information.
              </div>
            )}
          </div>

          {/* Height */}
          <div>
            <label htmlFor="height" className="block mb-1 text-sm font-medium text-gray-700">
              Height ({settings?.height_unit === 'metric' ? 'cm' : 'ft/in'})
              {/* Height ({settings?.general?.heightUnit === 'cm' ? 'cm' : 'ft/in'}) */}
            </label>
            <input
              type="text"
              id="height"
              {...register('height')}
              placeholder={settings?.height_unit === 'metric' ? 'e.g., 175' : 'e.g., 5\'10"'}
              {/* placeholder={settings?.general?.heightUnit === 'cm' ? 'e.g., 175' : 'e.g., 5\'10"'} */}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 dark:text-slate-800 ${
                errors.height ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {errors.height && (
              <span className="text-red-500 text-sm">{errors.height.message}</span>
            )}
          </div>
        </div>
      </div>

      {/* Contact Information Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold dark:text-slate-600">Contact Information</h2>
        
        <div>
          <label htmlFor="phoneNumber" className="block mb-1 text-sm font-medium text-gray-700">
            Phone Number
          </label>
          <input
            type="tel"
            id="phoneNumber"
            {...register('phoneNumber')}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 dark:text-slate-800 ${
              errors.phoneNumber ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
            }`}
          />
          {errors.phoneNumber && (
            <span className="text-red-500 text-sm">{errors.phoneNumber.message}</span>
          )}
        </div>
      </div>

      {/* Address Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold dark:text-slate-600">Address</h2>

        {/* Address Lines */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="addressLine1" className="block mb-1 text-sm font-medium text-gray-700">
              Address Line 1
            </label>
            <input
              type="text"
              id="addressLine1"
              {...register('addressLine1')}
              placeholder="Street address, P.O. Box, etc."
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 dark:text-slate-800 ${
                errors.addressLine1 ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {errors.addressLine1 && (
              <span className="text-red-500 text-sm">{errors.addressLine1.message}</span>
            )}
          </div>

          <div>
            <label htmlFor="addressLine2" className="block mb-1 text-sm font-medium text-gray-700">
              Address Line 2 (optional)
            </label>
            <input
              type="text"
              id="addressLine2"
              {...register('addressLine2')}
              placeholder="Apartment, suite, unit, etc."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-800"
            />
          </div>
        </div>

        {/* City, State, Postal Code, Country */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="city" className="block mb-1 text-sm font-medium text-gray-700">
              City
            </label>
            <input
              type="text"
              id="city"
              {...register('city')}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 dark:text-slate-800 ${
                errors.city ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {errors.city && (
              <span className="text-red-500 text-sm">{errors.city.message}</span>
            )}
          </div>

          <div>
            <label htmlFor="stateProvince" className="block mb-1 text-sm font-medium text-gray-700">
              State/Province
            </label>
            <input
              type="text"
              id="stateProvince"
              {...register('stateProvince')}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 dark:text-slate-800 ${
                errors.stateProvince ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {errors.stateProvince && (
              <span className="text-red-500 text-sm">{errors.stateProvince.message}</span>
            )}
          </div>

          <div>
            <label htmlFor="postalCode" className="block mb-1 text-sm font-medium text-gray-700">
              Postal Code
            </label>
            <input
              type="text"
              id="postalCode"
              {...register('postalCode')}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 dark:text-slate-800 ${
                errors.postalCode ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {errors.postalCode && (
              <span className="text-red-500 text-sm">{errors.postalCode.message}</span>
            )}
          </div>

          <div>
            <label htmlFor="country" className="block mb-1 text-sm font-medium text-gray-700">
              Country
            </label>
            <Controller
              name="country"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={countryOptions}
                  placeholder="Select a country"
                  classNamePrefix="react-select"
                  styles={{
                    option: (baseStyles) => ({
                      ...baseStyles,
                      color: '#1e293b',
                    }),
                    singleValue: (baseStyles) => ({
                      ...baseStyles,
                      color: '#1e293b',
                    }),
                    input: (baseStyles) => ({
                      ...baseStyles,
                      color: '#1e293b',
                    }),
                  }}
                />
              )}
            />
            {errors.country && (
              <span className="text-red-500 text-sm">{errors.country.message as string}</span>
            )}
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
            isSubmitting ? 'bg-purple-400' : 'bg-purple-600 hover:bg-purple-700'
          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
        >
          {isSubmitting ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </form>
  );
} 