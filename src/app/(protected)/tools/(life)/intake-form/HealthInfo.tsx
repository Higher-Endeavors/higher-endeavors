import React from 'react';
import { useFormContext } from 'react-hook-form';

const HealthInfo = () => {
  const { register } = useFormContext();

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Health Information</h2>
      <div>Purpose: Gather information about current health status, medical history, and health concerns.</div>
      <div>
        <h3>General Health Status</h3>
        <div>
          <label htmlFor="overallHealth" className="block mb-1">
            How would you rate your overall health?
          </label>
          <select
            id="overallHealth"
            {...register('overallHealth')}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-800"
          >
            <option value="">Select...</option>
            <option value="poor">Poor</option>
            <option value="fair">Fair</option>
            <option value="good">Good</option>
            <option value="excellent">Excellent</option>
          </select>
        </div>
        <div>
          <label htmlFor="chronicConditions" className="block mb-1">
            Any diagnosed chronic conditions (e.g., diabetes, hypertension)
          </label>
          <textarea
            id="chronicConditions"
            {...register('chronicConditions')}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div>
        <h3>Medical History</h3>
        <div>
          <label htmlFor="pastInjuriesSurgeries" className="block mb-1">
            Significant past injuries or surgeries
          </label>
          <textarea
            id="pastInjuriesSurgeries"
            {...register('pastInjuriesSurgeries')}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="currentHealthIssues" className="block mb-1">
            Current or recent health issues
          </label>
          <textarea
            id="currentHealthIssues"
            {...register('currentHealthIssues')}
            placeholder="Describe any current or recent health issues you're dealing with. Include physical limitations, pain points, and any ongoing health concerns."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div>
        <label htmlFor="mainHealthConcerns" className="block mb-1">
          What are your main health concerns?
        </label>
        <textarea
          id="mainHealthConcerns"
          {...register('mainHealthConcerns')}
          placeholder="Describe your main health concerns, including any specific symptoms or issues you're dealing with."
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label htmlFor="concernsOnset" className="block mb-1">
          When did you first experience these concerns?
        </label>
        <input
          type="text"
          id="concernsOnset"
          {...register('concernsOnset')}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label htmlFor="concernsManagement" className="block mb-1">
          How have you dealt with these concerns in the past?
        </label>
        <textarea
          id="concernsManagement"
          {...register('concernsManagement')}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label htmlFor="successWithApproaches" className="block mb-1">
          Have you experienced any success with these approaches?
        </label>
        <textarea
          id="successWithApproaches"
          {...register('successWithApproaches')}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label htmlFor="currentMedications" className="block mb-1">
          Current Medications
        </label>
        <textarea
          id="currentMedications"
          {...register('currentMedications')}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <h3>Healthcare Team</h3>
        <div>
          <label htmlFor="underPhysicianCare" className="block mb-1">
            Are you currently under the care of a physician or specialist?
          </label>
          <textarea
            id="underPhysicianCare"
            {...register('underPhysicianCare')}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="advisedLifestyleChanges" className="block mb-1">
            Have you been advised by a medical professional to make lifestyle changes?
          </label>
          <textarea
            id="advisedLifestyleChanges"
            {...register('advisedLifestyleChanges')}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div>
        <h3>Sleep Habits</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="sleepHours" className="block mb-1">
              Average hours of sleep per night
            </label>
            <input
              type="number"
              id="sleepHours"
              {...register('sleepHours')}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="sleepConsistency" className="block mb-1">
              Bedtime and wake-up time consistency
            </label>
            <input
              id="sleepConsistency"
              {...register('sleepConsistency')}
              placeholder="e.g., 10pm - 6am"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="sleepQuality" className="block mb-1">
              Quality of sleep
            </label>
            <textarea
              id="sleepQuality"
              {...register('sleepQuality')}
              placeholder="e.g., refreshed upon waking, difficulty falling asleep"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthInfo; 