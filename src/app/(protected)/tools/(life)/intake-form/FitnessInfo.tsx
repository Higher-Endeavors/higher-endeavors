import React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

const FitnessInfo = () => {
  const { register, control } = useFormContext();
  const formValues = useWatch({ control });

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Fitness Information</h2>
      <div>Purpose: Gather information about current fitness level, exercise habits, and fitness goals.</div>
      <div>
        <h3>Current Activity Level</h3>
        
        <div>
          <label htmlFor="exerciseFrequency" className="block mb-1 text-lg font-semibold">
            Frequency and type of exercise per week (if any)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="totalExerciseDays" className="block mb-1 text-lg font-semibold">
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
              <label htmlFor="resistanceTrainingDays" className="block mb-1 text-lg font-semibold">
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
              <label htmlFor="cardioTrainingDays" className="block mb-1 text-lg font-semibold">
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
        <div>
          <label htmlFor="availableTime" className="block mb-1 pt-2 text-lg font-semibold">
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
      <div>
        <h3>Exercise Preferences & History</h3>
        <div>
          <label htmlFor="exercisePreferences" className="block mb-1 pt-2 text-lg font-semibold">
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
          <label htmlFor="fitnessResources" className="block mb-1 pt-2 text-lg font-semibold">
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
          <label htmlFor="coachExperience" className="block mb-1 pt-2 text-lg font-semibold">
            Have you ever worked with a coach or used personalized programming?
          </label>
          <select
            id="coachExperience"
            {...register('coachExperience')}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-400 dark:text-slate-800"
          >
            <option value="">Select...</option>
            <option value="regularly">Yes, regularly</option>
            <option value="occasionally">Yes, occasionally</option>
            <option value="never">No, I've always self-programmed</option>
          </select>
        </div>
        {(formValues?.coachExperience === 'regularly' || formValues?.coachExperience === 'occasionally') && (
          <div>
            <label htmlFor="trainingHistory" className="block mb-1 pt-2 text-lg font-semibold">
              Past involvement in structured training programs or with a Fitness Professional
            </label>
            <textarea
              id="trainingHistory"
              {...register('trainingHistory')}
              placeholder="Please describe your experience working with coaches or following personalized programs"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Detailed Exercise History</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="yearsResistanceTraining" className="block mb-1">
              Years of Resistance Training Experience
            </label>
            <select
              id="yearsResistanceTraining"
              {...register('yearsResistanceTraining')}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-400 dark:text-slate-800"
            >
              <option value="">Select...</option>
              <option value="0">No experience</option>
              <option value="<1">Less than 1 year</option>
              <option value="1-2">1-2 years</option>
              <option value="3-5">3-5 years</option>
              <option value="5-10">5-10 years</option>
              <option value=">10">More than 10 years</option>
            </select>
          </div>
          <div>
            <label htmlFor="lastResistanceTraining" className="block mb-1">
              Last Time You Performed Resistance Training
            </label>
            <select
              id="lastResistanceTraining"
              {...register('lastResistanceTraining')}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-400 dark:text-slate-800"
            >
              <option value="">Select...</option>
              <option value="currently">Currently training</option>
              <option value="<1month">Less than 1 month ago</option>
              <option value="1-3months">1-3 months ago</option>
              <option value="3-6months">3-6 months ago</option>
              <option value="6-12months">6-12 months ago</option>
              <option value=">12months">More than 12 months ago</option>
              <option value="never">Never</option>
            </select>
          </div>
        </div>
        <div className="mt-4">
          <label htmlFor="consistentTrainingPeriod" className="block mb-1">
            Longest Period of Consistent Training (2+ days per week)
          </label>
          <select
            id="consistentTrainingPeriod"
            {...register('consistentTrainingPeriod')}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-400 dark:text-slate-800"
          >
            <option value="">Select...</option>
            <option value="never">Never trained consistently</option>
            <option value="<3months">Less than 3 months</option>
            <option value="3-6months">3-6 months</option>
            <option value="6-12months">6-12 months</option>
            <option value="1-2years">1-2 years</option>
            <option value="2-5years">2-5 years</option>
            <option value=">5years">More than 5 years</option>
          </select>
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
      <div className="space-y-6">
        <h3 className="text-2xl font-bold pt-4">Resistance Training Assessment</h3>
        
        {/* General Background */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold">General Background</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="yearsTraining" className="block mb-1 text-lg font-semibold">
                How many years have you been practicing resistance training?
              </label>
              <select
                id="yearsTraining"
                {...register('yearsTraining')}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-400 dark:text-slate-800"
              >
                <option value="">Select...</option>
                <option value="less-than-1">Less than 1 year</option>
                <option value="1-3">1–3 years</option>
                <option value="3-5">3–5 years</option>
                <option value="more-than-5">More than 5 years</option>
              </select>
            </div>

            <div>
              <label htmlFor="recentConsistency" className="block mb-1 text-lg font-semibold">
                How consistently have you trained in the past 6 months?
              </label>
              <select
                id="recentConsistency"
                {...register('recentConsistency')}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-400 dark:text-slate-800"
              >
                <option value="">Select...</option>
                <option value="not-at-all">Not at all</option>
                <option value="sporadically">Sporadically (1–2 times per month)</option>
                <option value="semi-regularly">Semi-regularly (1–2 times per week)</option>
                <option value="regularly">Regularly (3+ times per week)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block mb-1 text-lg font-semibold">What types of resistance training have you done?</label>
            <div className="space-y-2">
              {[
                { id: 'bodyweight', label: 'Bodyweight training (e.g., push-ups, pull-ups)' },
                { id: 'machine', label: 'Machine-based training' },
                { id: 'freeWeights', label: 'Free weights (e.g., dumbbells, barbells)' },
                { id: 'functional', label: 'Functional training (e.g., kettlebells, sandbags)' },
                { id: 'olympic', label: 'Olympic lifting' },
                { id: 'powerlifting', label: 'Powerlifting' },
                { id: 'other', label: 'Other' }
              ].map((type) => (
                <div key={type.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`trainingTypes.${type.id}`}
                    {...register(`trainingTypes.${type.id}`)}
                    className="mr-2"
                  />
                  <label htmlFor={`trainingTypes.${type.id}`}>{type.label}</label>
                </div>
              ))}
            </div>
            {formValues?.trainingTypes?.other && (
              <div className="mt-2">
                <label htmlFor="trainingTypesOther" className="block mb-1">Please specify:</label>
                <input
                  type="text"
                  id="trainingTypesOther"
                  {...register('trainingTypesOther')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-800"
                />
              </div>
            )}
          </div>
        </div>

        {/* Training Practices */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold">Training Practices</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="trainingFrequency" className="block mb-1 text-lg font-semibold">
                What is your typical training frequency?
              </label>
              <select
                id="trainingFrequency"
                {...register('trainingFrequency')}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-400 dark:text-slate-800"
              >
                <option value="">Select...</option>
                <option value="less-than-1">Less than 1 time per week</option>
                <option value="1-2">1–2 times per week</option>
                <option value="3-4">3–4 times per week</option>
                <option value="5-plus">5+ times per week</option>
              </select>
            </div>

            <div>
              <label htmlFor="sessionDuration" className="block mb-1 text-lg font-semibold">
                How long are your typical resistance training sessions?
              </label>
              <select
                id="sessionDuration"
                {...register('sessionDuration')}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-400 dark:text-slate-800"
              >
                <option value="">Select...</option>
                <option value="less-than-30">Less than 30 minutes</option>
                <option value="30-60">30–60 minutes</option>
                <option value="60-90">60–90 minutes</option>
                <option value="more-than-90">More than 90 minutes</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block mb-1 text-lg font-semibold">What types of training programs have you followed?</label>
            <div className="space-y-2">
              {[
                { id: 'generalFitness', label: 'General fitness (e.g., circuit training)' },
                { id: 'hypertrophy', label: 'Hypertrophy (muscle growth-focused)' },
                { id: 'strength', label: 'Strength-focused (low reps, high weight)' },
                { id: 'power', label: 'Power (explosive movements)' },
                { id: 'endurance', label: 'Endurance (high reps, low weight)' },
                { id: 'sportSpecific', label: 'Sport-specific training' },
                { id: 'other', label: 'Other' }
              ].map((program) => (
                <div key={program.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`programs.${program.id}`}
                    {...register(`programs.${program.id}`)}
                    className="mr-2"
                  />
                  <label htmlFor={`programs.${program.id}`}>{program.label}</label>
                </div>
              ))}
            </div>
            {formValues?.programs?.sportSpecific && (
              <div className="mt-2">
                <label htmlFor="sportSpecific" className="block mb-1">Please specify sport:</label>
                <input
                  type="text"
                  id="sportSpecific"
                  {...register('sportSpecific')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-800"
                />
              </div>
            )}
            {formValues?.programs?.other && (
              <div className="mt-2">
                <label htmlFor="programsOther" className="block mb-1">Please specify:</label>
                <input
                  type="text"
                  id="programsOther"
                  {...register('programsOther')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-800"
                />
              </div>
            )}
          </div>
        </div>

        {/* Exercise Preferences */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold">Exercise Preferences</h4>
          
          <div>
            <label className="block mb-1 text-lg font-semibold">Which exercises are you most confident performing?</label>
            <div className="space-y-2">
              {[
                { id: 'squats', label: 'Squats (e.g., back squat, goblet squat)' },
                { id: 'deadlifts', label: 'Deadlifts (e.g., conventional, Romanian)' },
                { id: 'benchPress', label: 'Bench press' },
                { id: 'pullUps', label: 'Pull-ups or chin-ups' },
                { id: 'overheadPress', label: 'Overhead press' },
                { id: 'lunges', label: 'Lunges' },
                { id: 'core', label: 'Core-focused exercises' },
                { id: 'other', label: 'Other' }
              ].map((exercise) => (
                <div key={exercise.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`confidentExercises.${exercise.id}`}
                    {...register(`confidentExercises.${exercise.id}`)}
                    className="mr-2"
                  />
                  <label htmlFor={`confidentExercises.${exercise.id}`}>{exercise.label}</label>
                </div>
              ))}
            </div>
            {formValues?.confidentExercises?.other && (
              <div className="mt-2">
                <label htmlFor="confidentExercisesOther" className="block mb-1">Please specify:</label>
                <input
                  type="text"
                  id="confidentExercisesOther"
                  {...register('confidentExercisesOther')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-800"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block mb-1 text-lg font-semibold">Which exercises need improvement or cause discomfort?</label>
            <div className="space-y-2">
              {[
                { id: 'squats', label: 'Squats' },
                { id: 'deadlifts', label: 'Deadlifts' },
                { id: 'benchPress', label: 'Bench press' },
                { id: 'overheadPress', label: 'Overhead press' },
                { id: 'pullUps', label: 'Pull-ups or chin-ups' },
                { id: 'other', label: 'Other' }
              ].map((exercise) => (
                <div key={exercise.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`improvementExercises.${exercise.id}`}
                    {...register(`improvementExercises.${exercise.id}`)}
                    className="mr-2"
                  />
                  <label htmlFor={`improvementExercises.${exercise.id}`}>{exercise.label}</label>
                </div>
              ))}
            </div>
            {formValues?.improvementExercises?.other && (
              <div className="mt-2">
                <label htmlFor="improvementExercisesOther" className="block mb-1">Please specify:</label>
                <input
                  type="text"
                  id="improvementExercisesOther"
                  {...register('improvementExercisesOther')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-800"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block mb-1 text-lg font-semibold">How do you approach recovery?</label>
            <div className="space-y-2">
              {[
                { id: 'stretching', label: 'Stretching or mobility exercises' },
                { id: 'foamRolling', label: 'Foam rolling or massage' },
                { id: 'activeRecovery', label: 'Active recovery (e.g., light cardio, yoga)' },
                { id: 'restDays', label: 'Rest days' },
                { id: 'noStructure', label: "I don't have a structured recovery plan" },
                { id: 'other', label: 'Other' }
              ].map((recovery) => (
                <div key={recovery.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`recovery.${recovery.id}`}
                    {...register(`recovery.${recovery.id}`)}
                    className="mr-2"
                  />
                  <label htmlFor={`recovery.${recovery.id}`}>{recovery.label}</label>
                </div>
              ))}
            </div>
            {formValues?.recovery?.other && (
              <div className="mt-2">
                <label htmlFor="recoveryOther" className="block mb-1">Please specify:</label>
                <input
                  type="text"
                  id="recoveryOther"
                  {...register('recoveryOther')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-800"
                />
              </div>
            )}
          </div>
        </div>

        {/* Self-Assessment */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold">Self-Assessment</h4>
          
          <div>
            <label htmlFor="techniqueUnderstanding" className="block mb-1 text-lg font-semibold">
              How would you rate your understanding of proper resistance training form and technique?
            </label>
            <select
              id="techniqueUnderstanding"
              {...register('techniqueUnderstanding')}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-400 dark:text-slate-800"
            >
              <option value="">Select...</option>
              <option value="beginner">Beginner (need guidance on most exercises)</option>
              <option value="intermediate">Intermediate (familiar with basic exercises, need occasional feedback)</option>
              <option value="advanced">Advanced (confident in technique and programming)</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 text-lg font-semibold">How do you monitor progress in your training?</label>
            <div className="space-y-2">
              {[
                { id: 'bodyComposition', label: 'Body composition changes (e.g., weight, body fat percentage)' },
                { id: 'strengthIncreases', label: 'Strength increases (e.g., lifting heavier weights)' },
                { id: 'repsSetsProg', label: 'Reps and sets progression' },
                { id: 'feelingEnergy', label: 'Feeling or energy levels' },
                { id: 'other', label: 'Other' }
              ].map((progress) => (
                <div key={progress.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`progressMonitoring.${progress.id}`}
                    {...register(`progressMonitoring.${progress.id}`)}
                    className="mr-2"
                  />
                  <label htmlFor={`progressMonitoring.${progress.id}`}>{progress.label}</label>
                </div>
              ))}
            </div>
            {formValues?.progressMonitoring?.other && (
              <div className="mt-2">
                <label htmlFor="progressMonitoringOther" className="block mb-1">Please specify:</label>
                <input
                  type="text"
                  id="progressMonitoringOther"
                  {...register('progressMonitoringOther')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-800"
                />
              </div>
            )}
          </div>
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