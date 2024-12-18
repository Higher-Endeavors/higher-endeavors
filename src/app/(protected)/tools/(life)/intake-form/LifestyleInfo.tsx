import React from 'react';
import { useFormContext } from 'react-hook-form';

const LifestyleInfo = () => {
  const { register, watch } = useFormContext();

  return (
    <div className="space-y-4">
      <h2>Lifestyle Information</h2>
      <div>Purpose: Gather information about daily routines, stress levels, and lifestyle factors.</div>
      <div>
        <h3 className="">Daily Routine Overview</h3>
        <div>
          <label htmlFor="weekdayRoutine" className="block mb-1">
            What does a typical weekday look like for you?
          </label>
          <textarea
            id="weekdayRoutine"
            {...register('weekdayRoutine')}
            placeholder="Briefly describe your typical weekday routine, including work, family, and personal time. When possible, include specific times for each activity, including meals, exercise, and sleep."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="weekendRoutine" className="block mb-1">
            How do weekends differ, if at all?
          </label>
          <textarea
            id="weekendRoutine"
            {...register('weekendRoutine')}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div>
        <h3>Stress and Mental Well-Being</h3>
        <div>
          <label htmlFor="stressLevel" className="block mb-1">
            Current perceived stress level (scale of 0-10)
          </label>
          <div className="flex items-center space-x-4">
            {[...Array(11)].map((_, index) => (
              <div key={index} className="flex items-center">
                <input
                  type="radio"
                  id={`stressLevel-${index}`}
                  value={index}
                  {...register('stressLevel')}
                  className="mr-2"
                />
                <label htmlFor={`stressLevel-${index}`}>{index}</label>
              </div>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="stressors" className="block mb-1 pt-4">
            Common stressors (select all that apply)
          </label>
          <div>
            <label>
              <input
                type="checkbox"
                value="work"
                {...register('stressors')}
                className="mr-2"
              />
              Work
            </label>
          </div>
          <div>
            <label>
              <input
                type="checkbox"
                value="family"
                {...register('stressors')}
                className="mr-2"
              />
              Family
            </label>
          </div>
          <div>
            <label>
              <input
                type="checkbox"
                value="finances"
                {...register('stressors')}
                className="mr-2"
              />
              Finances
            </label>
          </div>
          <div>
            <label>
              <input
                type="checkbox"
                value="environment"
                {...register('stressors')}
                className="mr-2"
              />
              Environment
            </label>
          </div>
          <div>
            <label>
              <input
                type="checkbox"
                value="nutrition"
                {...register('stressors')}
                className="mr-2"
              />
              Nutrition
            </label>
          </div>
          <div>
            <label>
              <input
                type="checkbox"
                value="physicalActivity"
                {...register('stressors')}
                className="mr-2"
              />
              Physical Activity
            </label>
          </div>
          <div>
            <label>
              <input
                type="checkbox"
                value="other"
                {...register('stressors')}
                className="mr-2"
              />
              Other
            </label>
          </div>
        </div>
        <div>
          <label htmlFor="stressManagement" className="block mb-1 pt-4">
            Any current practices for stress management
          </label>
          <textarea
            id="stressManagement"
            {...register('stressManagement')}
            placeholder="Please describe any practices you use to manage stress (e.g., meditation, exercise, therapy, hobbies)"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-800"
          />
        </div>
      </div>
      <div>
        <h3>Lifestyle Influences on Goals</h3>
        <div>
          <label htmlFor="lifestyleFactors" className="block mb-1">
            Are there any lifestyle factors that might impact your progress?
          </label>
          <textarea
            id="lifestyleFactors"
            {...register('lifestyleFactors')}
            placeholder="e.g., long work hours, frequent travel, family obligations, etc."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div>
        <h3>Substance Use</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="daysPerWeek" className="block mb-1">
              Days of alcohol use per week
            </label>
            <select
              id="daysPerWeek"
              {...register('alcoholDaysPerWeek')}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-400 dark:text-slate-800"
            >
              <option value="NA">N/A - Do not drink</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
              <option value="7">7</option>
            </select>
          </div>
          <div>
            <label htmlFor="drinksPerDay" className="block mb-1">
              Average drinks per day
            </label>
            <input
              type="number"
              id="drinksPerDay"
              {...register('alcoholDrinksPerDay')}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-800"
            />
          </div>
          <div>
            <label htmlFor="drinksPerWeek" className="block mb-1">
              Average drinks per week
            </label>
            <input
              type="number"
              id="drinksPerWeek"
              {...register('alcoholDrinksPerWeek')}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-800"
            />
          </div>
          <div>
            <label htmlFor="tobaccoDrugUse" className="block mb-1">
              Tobacco or recreational drug use
            </label>
            <select
              id="tobaccoDrugUse"
              {...register('tobaccoDrugUse')}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-400 dark:text-slate-800"
            >
              <option value="">Select...</option>
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </div>
        </div>
        {watch('tobaccoDrugUse') === 'yes' && (
          <div className="mt-4">
            <div className="mt-2">
              <label htmlFor="tobaccoDrugDetails" className="block mb-1">
                Please provide details
              </label>
              <textarea
                id="tobaccoDrugDetails"
                {...register('tobaccoDrugDetails')}
                placeholder="Please describe your tobacco or recreational drug use"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-800"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LifestyleInfo; 