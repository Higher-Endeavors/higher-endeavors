## Overview/ Objective

I need to create a page to allow Users to Plan, Act, and Analyze their Resistance Training Programs. 

## Project Details

### Feature Requirements

- The Resistance Training Program should enable Users to control the following variables
	- Pairing
		- The User should have the ability to drag and drop the exercise row, with all its associated variables, and the Pairing variable automatically reorders itself. This functionality should use the DND-Kit module and code. 
			- The DND-Kit functionality if found within the "tree" folder at /src/app/(protected)/tree. The code should be copied and repurposed as necessary for this functionality. The original code should be left as is for future use. 
		- Pairing should use the following format (A1, A2, B1, B2) with the letter signifying the group the exercise is a part of and the number signifying the order in which it should be executed. 
		- There needs to be the option to create Advanced Pairing programming for advanced lifts like Drop Sets, Cluster Sets, Rest-Pause, etc. 
			- In these cases, the following formatting should be used (A1-1, A1-2)
		- WU (Warm-Up) and CD (Cool-Down) should also be valid Pairing options. 
			- The User should have the ability to add WU (warm-up) sets before individual lifts, without resetting the overall Pairing progression
				- WU Squat / A1 Squat 8 Sets of 3 Repetitions / WU Bench Press / B1 Bench Press 8 Sets of 3 Repetitions
	- Exercise 
	- Sets
	- Repetitions
	- Load
	- Tempo
		- Tempo needs to be a four digit number (2010) with each digit representing a different phase of the lift (eccentric, pause, concentric, pause).
		- It is possible to use "X" as a digit in the tempo, which implies "explosive." This is almost exclusively found in the third digit (concentric) position. 
	- Rest
		- This should be an integer that represents the amount of seconds to rest between sets. 
	- Notes
		- The user should be able to enter notes in a text field box.
	- RPE 
		- Make optional field in the Settings section
	- RIR
		- Make optional field in the Settings section
- Calculations
	- The following calculations should be made to create a group of secondary variables
		- Volume
			- Per exercise: Multiply the sets by the repetitions to get a Repetition Volume, and then also multiply by the Load to get the Load Volume for each exercise.
			- Per Training Session: Perform the same calculations as above, but for the entire training session. 
			- During the Planning phase, there should be Goal based volumes, per session & weekly, to hit for certain muscle groups.
		- Time Under Tension: Using the duration of each repetition by adding up the Tempo digits, multiply that by the number of repetitions performed in the set.
		- Training Session Duration
			- Add the time-under-tension for each exercise and add the amount of rest in between each set to create a Total Session Duration.
	- The secondary variables should be displayed in a block below the main program block
	

- The functionality between the Plan and Act pages should be very similar, with more emphasis placed on the ability to edit the program on the Planning page. Any editing that takes place on the Act page, only affects that one session, not the overall program. 

#### Plan

- Phase/ Focus
	- The User needs to be able to select the Phase/ Focus of the Exercise Program. This should also be related to the Periodization Plan, that will be implemented in the future.
		- Phase/ Focus
			- GPP (General Physical Preparedness)	
			- Strength
			- Hypertrophy
			- Intensification
			- Accumulation
		

- There needs to be an "Add Exercise" button the causes a modal pop-up box to appear. 
	- Use pop-up modal box to input new exercises and all of the associated variables. 
- New exercises should be added to the end of the program and then dragged and dropped into the final position.
	- Exercise Pairing must reorder upon dragging and dropping. 
- Exercise
	- The User should be able to type the name of the Exercise in the input field and the search field auto filters the options in the database. 
	- There should be an option to select and filter the exercises based upon different criteria.
		- Equipment
		- Muscle group
		- Etc.
	- The exercises should be populated from the Exercise database. 
	- The User should also have the ability to input their own exercises that aren't found in the exercise database.
- Sets
	- During planning the User can input a certain number of sets in the "Sets" input field, for example 3 Sets of 10 repetitions. 

- Time-Under-Tension
	- There needs to be a flag that appears if the programmed time-under-tension for a specific exercise deviates from the User's goals by more than 20%. 
		- For example, if the User's goal is hypertrophy, the time-under-tension for each set of each exercise should be at least 45 seconds.

- Scheduling (Future Calendar Integration)
	- The individual training sessions need to be able to be assigned to specific days in the Calendar
		- There should be the option Notifications to remind the User to complete the training session

- Periodization
	- The User should have the ability to select a Progression model for the training program. 
		- Volume
			- There should be options to "Auto-Increment" the variables of the training sessions in the following ways:
				- Linear
					- Increase Repetitions by X(%) amount
					- Increase Load by X(%) amount
					- Increase Volume by X(%) amount
				- Undulating
					- The User should have the ability to vary the weekly Volume (sets/ reps) of the training program with 100%, 50% 75%, 25% as an example. In most cases, Load should stay constant. 
				- Custom
					- The User should be able to customize their incrementing variables, i.e. Volume(Sets, Repetitions, Load) and/ or Load
			- The User should have the ability to confirm this Auto-Increment functionality based upon their subjective/ objective response to the previous workout. 
	

#### Act

- The User should be able to select a Resistance Training Program from a list to be performed. At some point, the User should also be able to assign the Resistance Training Program to a specific day to be completed on. 
- The Resistance Training program should have all of the variables preset from the Planning part.
	- The variables should be able to be changed.
		- If the User performed less than 20% of the planned variable, usually repetitions, the field should turn Red for visual feedback. If they exceeded the Planned by more than 20% the field should turn Green.
	- Any variable that is not actively changed on the Act page should maintain the Planned data. 
	- These changes should be recorded to compare Planned vs Actual
		- These changes can reflect poor or excellent recovery, among other things
	- Sets
		- The Sets from the Planning page should be listed on individual rows so that each set can be recorded independently with the number of repetitions and the amount of load used for each set. 

- End of Session Notes
	- How do you feel?
		- Weak/ Average/ Strong
		- Fatigued/ Normal/ Energetic
	- Muscle Pump
		- For hypertrophy related goals
	- Notes
	- Following Day Prompt
		- Soreness
			- None/ Mild/ Moderate/ Severe
		- How do you feel?
			- Weak/ Average/ Strong
			- Fatigued/ Normal/ Energetic
		- Notes

#### Analysis

- The User needs to be able to analyze their programs, their results, and their progress

- Charts
	- The User should be able to view Charts with the following...
		- Volume over time (Should also integrate into the Periodization planning)
			- Per lift
			- Per session
		- Load Per Lift over time (Should also integrate into the Periodization planning)

- Reports
	- The User should be able to see an analysis showing when their Planned vs. Actual training session deviated by more than 20% for a given lift, either in sets, repetitions, load, or volume calculations.

- Insights
	- Auto-Increment
		- The User should have the ability to auto-increment the training session if they met the following criteria
			- Completed all sets and repetitions with the correct load as programmed
			- They subjectively felt Average/ Normal or Strong/ Energetic during and after the training session
			- The Users level of soreness was Mild/ None
	- Recovery
		- Provide recovery insights for specific training sessions and modalities
	- Show trends for the subjective recovery measures (soreness, how do you feel) alongside objective metrics like volume or load


### Technology Stack

- NextJS
- Tailwind CSS
- DND-Kit
- React Select
- Flowbite React for Modal boxes

### File Structure

- The files should be located in src/app/(protected)/tools/(fitness)/resistance-training
	- /plan
	- /act
	- /analyze

## Back-End Requirements

- All of the data will be stored in a Postgres DB running on an AWS EC2 instance

### Database Schema

- We are still finalizing the schema, but the content below is a starting point. I have also included a db.sql file in the /resources folder which contains the schema for our entire database right now. 	

CREATE TABLE user_exercises (
  id                 SERIAL PRIMARY KEY,
  user_id            INT NOT NULL REFERENCES users(id)
                     ON UPDATE CASCADE ON DELETE CASCADE,
  exercise_name      VARCHAR(100) NOT NULL,
  description        TEXT,              -- optional, for user notes
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ
);

CREATE TABLE resistance_program_templates (
  id                 SERIAL PRIMARY KEY,
  template_name      VARCHAR(100) NOT NULL, 
  periodization_type VARCHAR(50),         -- e.g. 'Linear', 'Block', 'Undulating'
  notes              TEXT,                -- high-level notes or instructions
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ
);

CREATE TABLE resistance_programs (
  id                 SERIAL PRIMARY KEY,
  user_id            INT NOT NULL REFERENCES users(id)
                     ON UPDATE CASCADE ON DELETE CASCADE,
  program_name       VARCHAR(100) NOT NULL,
  periodization_type VARCHAR(50),         -- e.g. 'Linear', 'Block', 'Undulating'
  template_id        INT REFERENCES resistance_program_templates(id),
  start_date         DATE,
  end_date           DATE,
  notes              TEXT,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ
);

CREATE TABLE program_weeks (
  id                 SERIAL PRIMARY KEY,
  resistance_program_id INT NOT NULL REFERENCES resistance_programs(id)
                          ON UPDATE CASCADE ON DELETE CASCADE,
  week_number        INT NOT NULL,       -- e.g. 1, 2, 3, ...
  notes              TEXT,               -- optional week-specific notes
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ
);

CREATE TABLE program_days (
  id                 SERIAL PRIMARY KEY,
  program_week_id    INT NOT NULL REFERENCES program_weeks(id)
                     ON UPDATE CASCADE ON DELETE CASCADE,
  day_number         INT,     -- e.g. 1, 2, 3, ...
  day_name           VARCHAR(100),
  notes              TEXT,    -- optional day-specific notes
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ
);

CREATE TABLE program_day_exercises (
  id                 SERIAL PRIMARY KEY,
  program_day_id     INT NOT NULL REFERENCES program_days(id)
                     ON UPDATE CASCADE ON DELETE CASCADE,
  
  -- Indicate if this exercise is from the library or user-defined
  exercise_source    VARCHAR(20) NOT NULL CHECK (exercise_source IN ('library','user')),
  
  exercise_library_id INT REFERENCES exercise_library(id),
  user_exercise_id   INT REFERENCES user_exercises(id),

  -- If the user wants a custom name even if referencing the library:
  custom_exercise_name VARCHAR(100),
  
  notes              TEXT,        -- e.g. “Focus on slow eccentric”
  order_index        INT,         -- order in which the exercise appears that day
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ
);

CREATE TABLE program_day_exercise_sets (
  id                 SERIAL PRIMARY KEY,
  program_day_exercise_id INT NOT NULL REFERENCES program_day_exercises(id)
                          ON UPDATE CASCADE ON DELETE CASCADE,
  set_number         INT NOT NULL,     -- e.g. 1, 2, 3, ...
  planned_reps       INT NOT NULL,
  planned_load       DECIMAL(6,2),     -- optional, or use INT if always in kg
  load_unit          VARCHAR(5),       -- e.g. 'kg', 'lb'
  planned_rest       INT,              -- in seconds, or use interval
  planned_tempo      VARCHAR(20),      -- e.g. "3-0-1"
  notes              TEXT,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ
);

CREATE TABLE user_actual_sessions (
  id                 SERIAL PRIMARY KEY,
  user_id            INT NOT NULL REFERENCES users(id)
                     ON UPDATE CASCADE ON DELETE CASCADE,
  program_day_id     INT REFERENCES program_days(id)
                     ON UPDATE CASCADE ON DELETE CASCADE,
  session_date       DATE NOT NULL,   -- or DATETZ if you need time
  notes              TEXT,            -- user’s overall session notes
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ
);

CREATE TABLE user_actual_exercise_sets (
  id                 SERIAL PRIMARY KEY,
  user_actual_session_id INT NOT NULL REFERENCES user_actual_sessions(id)
                          ON UPDATE CASCADE ON DELETE CASCADE,
  
  -- Optional reference to the "planned" set
  program_day_exercise_set_id INT REFERENCES program_day_exercise_sets(id)
                              ON UPDATE CASCADE ON DELETE SET NULL,
  
  actual_set_number  INT,
  actual_reps        INT,
  actual_load        DECIMAL(6,2),
  load_unit          VARCHAR(5),
  actual_rest        INT,           -- in seconds
  actual_tempo       VARCHAR(20),
  notes              TEXT,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ
);


### API Routes and Server-Side Logic


### Additional Notes

