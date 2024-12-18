import React from 'react';
import { useFormContext } from 'react-hook-form';

const FitnessInfo = () => {
  const { register } = useFormContext();

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Fitness Information</h2>
      <div>Purpose: Gather information about current fitness level, exercise habits, and fitness goals.</div>
      <div>
        <h3>Current Activity Level</h3>
        
        <div>
          <label htmlFor="exerciseFrequency" className="block mb-1">
            Frequency and type of exercise per week (if any)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="totalExerciseDays" className="block mb-1">
                Total exercise days per week
              </label>
              <select
                id="totalExerciseDays"
                {...register('totalExerciseDays')}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-400 dark:text-slate-800"
              >
                <option value="">Select...</option>
                <option value="0">0</option>
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
              <label htmlFor="resistanceTrainingDays" className="block mb-1">
                Resistance training days per week
              </label>
              <select
                id="resistanceTrainingDays"
                {...register('resistanceTrainingDays')}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-400 dark:text-slate-800"
              >
                <option value="">Select...</option>
                <option value="0">0</option>
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
              <label htmlFor="cardioTrainingDays" className="block mb-1">
                CardioMetabolic training days per week
              </label>
              <select
                id="cardioTrainingDays"
                {...register('cardioTrainingDays')}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-400 dark:text-slate-800"
              >
                <option value="">Select...</option>
                <option value="0">0</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      <div>
        <h3>Exercise Preferences & History</h3>
        <div>
          <label htmlFor="exercisePreferences" className="block mb-1">
            Preferred forms of exercise
          </label>
          <textarea
            id="exercisePreferences"
            {...register('exercisePreferences')}
            placeholder="e.g., running, weightlifting, yoga, cycling, etc."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="trainingHistory" className="block mb-1">
            Past involvement in structured training programs or with a Fitness Professional
          </label>
          <textarea
            id="trainingHistory"
            {...register('trainingHistory')}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div>
        <h3>Fitness Environment & Resources</h3>
        <div>
          <label htmlFor="fitnessResources" className="block mb-1">
            Access to a gym, home workout equipment, or outdoor spaces
          </label>
          <textarea
            id="fitnessResources"
            {...register('fitnessResources')}
            placeholder="e.g., gym name, home exercise equipment available, etc."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="availableTime" className="block mb-1">
            Time available to dedicate to exercise each week
          </label>
          <input
            type="text"
            id="availableTime"
            {...register('availableTime')}
            placeholder="e.g., realistic number of days per week and amount of time per day"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      {/* <div>
        <h3>Injury History & Limitations</h3>
        <div>
          <label htmlFor="injuryHistory" className="block mb-1">
            Past or current injuries affecting exercise participation (knee, back, shoulder issues)
          </label>
          <textarea
            id="injuryHistory"
            {...register('injuryHistory')}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="movementDiscomfort" className="block mb-1">
            Any pain or discomfort during certain movements
          </label>
          <textarea
            id="movementDiscomfort"
            {...register('movementDiscomfort')}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div> */}
      {/* <div>
        <h3>Specific Fitness Goals</h3>
        <div>
          <label htmlFor="fitnessGoals" className="block mb-1">
            Goals related to strength, endurance, flexibility, body composition, or skill development
          </label>
          <textarea
            id="fitnessGoals"
            {...register('fitnessGoals')}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="fitnessTimeline" className="block mb-1">
            Timeline or specific benchmarks (e.g., run a 5K, perform a certain number of push-ups)
          </label>
          <textarea
            id="fitnessTimeline"
            {...register('fitnessTimeline')}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div> */}
    </div>
  );
};

export default FitnessInfo; 