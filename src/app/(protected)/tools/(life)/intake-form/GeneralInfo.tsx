import React from 'react';
import Select from 'react-select';
import countries from 'world-countries';
import { useFormContext, Controller } from 'react-hook-form';

// Format country data for react-select
let countryOptions = countries.map((country) => ({
  value: country.cca2, // ISO Alpha-2 code (e.g., US, GB)
  label: country.name.common, // Country name
}));

// Find United States and move it to the front of the array
const usIndex = countryOptions.findIndex(country => country.value === 'US');
if (usIndex > -1) {
  const us = countryOptions.splice(usIndex, 1)[0];
  countryOptions = [us, ...countryOptions];
}

const GeneralInfo = () => {
  const {
    register,
    control,
    formState: { errors },
    watch,
    setValue,
  } = useFormContext();

  React.useEffect(() => {
    if (watch('parentalStatus') === 'parent') {
      setValue('numberOfChildren', '1');
    }
  }, [watch('parentalStatus'), setValue]);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">General Information</h2>
      <div>Purpose: Establish basic demographics, personal background, and primary motivations.</div>
      {/* Address Section */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Address</h3>

        {/* Address Lines Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Address Line 1 */}
          <div>
            <label htmlFor="addressLine1" className="block mb-1">Address Line 1</label>
            <input
              type="text"
              id="addressLine1"
              placeholder="Street address, P.O. Box, etc."
              {...register('addressLine1', { required: 'Address Line 1 is required' })}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 dark:text-slate-800 ${
                errors.addressLine1 ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {errors.addressLine1 && <span className="text-red-500 text-sm">{errors.addressLine1.message as string}</span>}
          </div>

          {/* Address Line 2 */}
          <div>
            <label htmlFor="addressLine2" className="block mb-1">Address Line 2 (optional)</label>
            <input
              type="text"
              id="addressLine2"
              placeholder="Apartment, suite, unit, etc."
              {...register('addressLine2')}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-800"
            />
          </div>
        </div>

        {/* City, State, Postal Code, Country Row */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* City */}
          <div>
            <label htmlFor="city" className="block mb-1">City</label>
            <input
              type="text"
              id="city"
              placeholder="City"
              {...register('city', { required: 'City is required' })}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 dark:text-slate-800 ${
                errors.city ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {errors.city && <span className="text-red-500 text-sm">{errors.city.message as string}</span>}
          </div>

          {/* State/Province */}
          <div>
            <label htmlFor="stateProvince" className="block mb-1">State/Province/Region</label>
            <input
              type="text"
              id="stateProvince"
              placeholder="State, Province, or Region"
              {...register('stateProvince')}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-800"
            />
          </div>

          {/* Postal Code */}
          <div>
            <label htmlFor="postalCode" className="block mb-1">Postal Code</label>
            <input
              type="text"
              id="postalCode"
              placeholder="Postal Code"
              {...register('postalCode', { required: 'Postal Code is required' })}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 dark:text-slate-800 ${
                errors.postalCode ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {errors.postalCode && <span className="text-red-500 text-sm">{errors.postalCode.message as string}</span>}
          </div>

          {/* Country */}
          <div>
            <label htmlFor="country" className="block mb-1">Country</label>
            <Controller
              name="country"
              control={control}
              rules={{ required: 'Country is required' }}
              render={({ field }) => (
                <Select
                  {...field}
                  options={countryOptions}
                  placeholder="Select a country"
                  classNamePrefix="react-select"
                  styles={{
                    option: (baseStyles, state) => ({
                      ...baseStyles,
                      color: '#1e293b', // text-slate-800
                    }),
                    singleValue: (baseStyles, state) => ({
                      ...baseStyles,
                      color: '#1e293b', // text-slate-800
                    }),
                    input: (baseStyles) => ({
                      ...baseStyles,
                      color: '#1e293b', // text-slate-800
                    }),
                  }}
                />
              )}
            />
            {errors.country && <span className="text-red-500 text-sm">{errors.country.message as string}</span>}
          </div>
        </div>
      </div>
      
      <div>
        <label htmlFor="phoneNumber" className="block mb-1">
          Phone Number
        </label>
        <input
          type="tel"
          id="phoneNumber"
          {...register('phoneNumber', { required: 'Phone number is required' })}
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 dark:text-slate-800 ${
            errors.phoneNumber ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
          }`}
        />
        {errors.phoneNumber && (
          <span className="text-red-500 text-sm">{errors.phoneNumber.message as string}</span>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="dateOfBirth" className="block mb-1">
            Date of Birth
          </label>
          <input
            type="date"
            id="dateOfBirth"
            {...register('dateOfBirth')}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-800"
          />
        </div>
        <div>
          <label htmlFor="gender" className="block mb-1">
            Gender
          </label>
          <select
            id="gender"
            {...register('gender')}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-400 dark:text-slate-800"
          >
            <option value="">Select...</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label htmlFor="height" className="block mb-1">
            Height
          </label>
          <input
            type="text"
            id="height"
            {...register('height')}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-800"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="currentWeight" className="block mb-1">
            Current Weight
          </label>
          <input
            type="number"
            id="currentWeight"
            {...register('currentWeight')}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-800"
          />
        </div>
        <div>
          <label htmlFor="idealWeight" className="block mb-1">
            Ideal Weight
          </label>
          <input
            type="number"
            id="idealWeight"
            {...register('idealWeight')}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-800"
          />
        </div>
        <div>
          <label htmlFor="weightOneYearAgo" className="block mb-1">
            Weight One Year Ago
          </label>
          <input
            type="number"
            id="weightOneYearAgo"
            {...register('weightOneYearAgo')}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-800"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="relationshipStatus" className="block mb-1">
            Relationship Status
          </label>
          <select
            id="relationshipStatus"
            {...register('relationshipStatus')}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-400 dark:text-slate-800"
          >
            <option value="">Select...</option>
            <option value="married">Married</option>
            <option value="divorced">Divorced</option>
            <option value="widowed">Widowed</option>
            <option value="dating">Dating</option>
            <option value="single">Single</option>
            <option value="prefer-not-to-say">Prefer not to say</option>
          </select>
        </div>
        <div>
          <label htmlFor="parentalStatus" className="block mb-1">
            Parental Status
          </label>
          <select
            id="parentalStatus"
            {...register('parentalStatus')}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-400 dark:text-slate-800"
          >
            <option value="">Select...</option>
            <option value="parent">Parent</option>
            <option value="expecting">Expecting a child</option>
            <option value="not-parent">Not a parent</option>
            <option value="prefer-not-to-say">Prefer not to say</option>
          </select>
        </div>
      </div>
      
      {watch('parentalStatus') === 'parent' && (
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <label htmlFor="numberOfChildren" className="block">
              Number of Children:
            </label>
            <select
              id="numberOfChildren"
              {...register('numberOfChildren')}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-400 dark:text-slate-800"
            >
              <option value="">Select...</option>
              {[...Array(10)].map((_, index) => (
                <option key={index} value={index + 1}>
                  {index + 1}
                </option>
              ))}
            </select>
          </div>
          
          {[...Array(parseInt(watch('numberOfChildren') || 1))].map((_, index) => (
            <div key={index} className="grid grid-cols-2 gap-4 p-4 border border-gray-200 rounded-md">
              <h4 className="col-span-2 font-semibold">Child {index + 1}</h4>
              <div>
                <label htmlFor={`children.${index}.age`} className="block mb-1">
                  Age
                </label>
                <input
                  type="number"
                  id={`children.${index}.age`}
                  {...register(`children.${index}.age`)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-800"
                />
              </div>
              <div>
                <label htmlFor={`children.${index}.gender`} className="block mb-1">
                  Gender
                </label>
                <select
                  id={`children.${index}.gender`}
                  {...register(`children.${index}.gender`)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-400 dark:text-slate-800"
                >
                  <option value="">Select...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
      <div>
        <label htmlFor="familyLivingSituation" className="block mb-1">
          Family/Living Situation
        </label>
        <textarea
          id="familyLivingSituation"
          {...register('familyLivingSituation')}
          placeholder="Briefly describe your family living situation, number of people in your household, and any other relevant information."
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-800"
        />
      </div>
      <div>
        <label htmlFor="employmentStatus" className="block mb-1">
          What is your current employment status
        </label>
        <select
          id="employmentStatus"
          {...register('employmentStatus')}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-400 dark:text-slate-800"
        >
          <option value="">Select...</option>
          <option value="full-time">Full-time</option>
          <option value="part-time">Part-time</option>
          <option value="unemployed">Unemployed</option>
          <option value="self-employed">Self-employed</option>
          <option value="home-maker">Home-maker</option>
          <option value="student">Student</option>
          <option value="retired">Retired</option>
        </select>
      </div>
      <div>
        <label htmlFor="occupationSchedule" className="block mb-1">
          Occupation and Schedule
        </label>
        <textarea
          id="occupationSchedule"
          {...register('occupationSchedule')}
          placeholder="Briefly describe your typical work schedule and/or major daily commitments."
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-800"
        />
      </div>
      <div>
        <label htmlFor="recreationHobbies" className="block mb-1">
          Recreation/Hobbies
        </label>
        <textarea
          id="recreationHobbies"
          {...register('recreationHobbies')}
          placeholder="Briefly describe what you like to do in your free time (e.g., reading, hiking, painting, etc.)."
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-800"
        />
      </div>
      <div>
        <label htmlFor="primaryGoal" className="block mb-1">
          Primary Goal or Focus
        </label>
        <textarea
          id="primaryGoal"
          {...register('primaryGoal')}
          placeholder="Briefly describe your goals and how you are hoping Higher Endeavors can help you achieve them."
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-800"
        />
      </div>
      <div>
        <label htmlFor="goalTimeframe" className="block mb-1">
          Specific timeframe for the goal
        </label>
        <input
          type="text"
          id="goalTimeframe"
          {...register('goalTimeframe')}
          placeholder="e.g., 3 months, 6 months, 1 year, or a specific date"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-800"
        />
      </div>
      <div>
        <div className="space-y-2">
          <label className="block mb-1">Motivation level (scale of 1-10)</label>
          <div className="flex items-center space-x-4">
            {[...Array(10)].map((_, index) => (
              <div key={index} className="flex items-center">
                <input
                  type="radio"
                  id={`motivationLevel-${index + 1}`}
                  value={index + 1}
                  {...register('motivationLevel')}
                  className="mr-2"
                />
                <label htmlFor={`motivationLevel-${index + 1}`}>{index + 1}</label>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div>
        <label htmlFor="supportSystem" className="block mb-1">
        Do you have friends, family, or coworkers supporting your goals?
        </label>
        <textarea
          id="supportSystem"
          {...register('supportSystem')}
          placeholder="Briefly describe how you currently receive support for your goals."
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-800"
        />
      </div>
      <div>
        <label htmlFor="previousExperience" className="block mb-1">
          Previous experience with wellness, nutrition, or fitness professionals
        </label>
        <textarea
          id="previousExperience"
          {...register('previousExperience')}
          placeholder="Briefly describe your previous experience with wellness, nutrition, or fitness professionals."
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-800"
        />
      </div>
      {/* <div>
        <label htmlFor="travelExperience" className="block mb-1">
          Experience living or traveling outside of the United States
        </label>
        <textarea
          id="travelExperience"
          {...register('travelExperience')}
          placeholder="Briefly describe your experience living or traveling outside of the United States."
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-800"
        />
      </div> */}
      <div>
        <label htmlFor="majorLifeChanges" className="block mb-1">
          Recent major life changes
        </label>
        <textarea
          id="majorLifeChanges"
          {...register('majorLifeChanges')}
          placeholder="Describe recent major life changes that have recently occured (e.g., job change, move, relationship change, etc.)."
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-800"
        />
      </div>
      {/* <div>
        <label htmlFor="majorLosses" className="block mb-1">
          Major losses experienced
        </label>
        <textarea
          id="majorLosses"
          {...register('majorLosses')}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-800"
        />
      </div>
      <div>
        <label htmlFor="timeOffWork" className="block mb-1">
          Time taken off from work or school in the last year
        </label>
        <textarea
          id="timeOffWork"
          {...register('timeOffWork')}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-800"
        />
      </div> */}
    </div>
  );
};

export default GeneralInfo; 