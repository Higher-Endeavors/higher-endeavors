'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useSession } from "next-auth/react"
import Select from 'react-select';
import BalancedLiftsList from './BalancedLiftsList';
import { getFetchBaseUrl } from '@/app/lib/utils/clientUtils';

type FormData = {
  id: number
  exercise_name: string
  struct_bal_lift_load: number
};

type RefLift = {
  id: number
  exercise_name: string
  struct_bal_ref_lift_load: number
  struct_bal_ref_lift_note: string
};
type RefLifts = RefLift[];

type BalLift = {
  id: number
  exercise_name: string
  bal_lift_load: number
  bal_lift_note: string
};
type BalLifts = BalLift[];

type SelectOption = {
  value: number;
  label: string;
};

function doCalculate(refLifts: RefLifts, formValues: FormData) {
  const masterLiftIdx = refLifts.map(e => e.id).indexOf(Number(formValues.exercise_name))
  const masterLiftRefLoad = refLifts[masterLiftIdx].struct_bal_ref_lift_load;
  const masterLiftNewLoad = Number(formValues.struct_bal_lift_load);
  let balLifts: BalLifts = [];

  refLifts.forEach((refLift) => {
    const loadFactor = refLift.struct_bal_ref_lift_load / masterLiftRefLoad;
    const newLoad = Math.round(masterLiftNewLoad * loadFactor);
    let balLift: BalLift = {
      id: refLift.id,
      exercise_name: refLift.exercise_name,
      bal_lift_load: newLoad,
      bal_lift_note: refLift.struct_bal_ref_lift_note
    };
    balLifts.push(balLift);
  }
  )
  return balLifts
};

export default function BalancedLiftsForm({ refLifts }: { refLifts: RefLifts }) {
  const { register, getValues, setValue, handleSubmit, formState: { errors }, reset } = useForm<FormData>();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isErrorVisible, setIsErrorVisible] = useState(false);
  const [isListVisible, setIsListVisible] = useState(false);
  const [liftNote, setLiftNote] = useState("");
  const [isNoteVisible, setIsNoteVisible] = useState(false);
  const [balLifts, setBalLifts] = useState<BalLifts>([]);
  const { data: session } = useSession();
  const [selectedLift, setSelectedLift] = useState<string>("");
  const selectOptions: SelectOption[] = refLifts.map((lift) => ({
    value: lift.id,
    label: lift.exercise_name,
  }));

  const handleMasterLiftChange = (option: SelectOption | null) => {
    if (option) {
      const refLiftIdx = refLifts.map(e => e.id).indexOf(Number(option.value));
      if (refLifts[refLiftIdx].struct_bal_ref_lift_note) {
        setLiftNote(refLifts[refLiftIdx].struct_bal_ref_lift_note);
        setIsNoteVisible(true);
      } else {
        setLiftNote("");
        setIsNoteVisible(false);
      }
    }
  };

  const onSubmit = async (data: FormData) => {
    const userId = session?.user.id;
    try {
      const baseURL = await getFetchBaseUrl();
      const fetchURL = `${baseURL}/api/balanced-lifts`;
      const response = await fetch(fetchURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...data, userId }),
      });

      if (!response.ok) {
        const status = response.status;
        if (status === 400) {
          setSubmitError('Captcha failed. Please try again.');
        } else if (status === 406) {
          setSubmitError('You must use a valid email address.');
        } else {
          setSubmitError('A system error occurred. Please try again later.');
        }
        setIsErrorVisible(true);
        return;
      }

      reset();
      setSubmitError(null);
      setIsErrorVisible(false);
      setIsListVisible(false);
    } catch (error) {
      setSubmitError('A system error occurred. Please try again later.');
      setIsErrorVisible(true);
    }
  };

  return (
    <>
      <div>
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md mx-auto">
          <div className={`mb-4 p-4 bg-red-100 text-red-700 rounded-md ${isErrorVisible ? 'block' : 'hidden'}`}>
            {submitError}
          </div>

          <div className='mb-2'>
            <label
              htmlFor='exercise_name'
              className='mb-3 block text-xl font-bold text-black dark:text-white'
            >
              Master Lift
            </label>
            <Select
              options={selectOptions}
              onChange={(option) => {
                handleMasterLiftChange(option);
                if (option) {
                  setValue('exercise_name', option.value.toString());
                }
              }}
              className='text-base font-medium text-gray-700'
              placeholder="Select Master Lift"
              isClearable
            />
            <input
              type="hidden"
              {...register('exercise_name', { required: 'Master lift is required' })}
              value={selectedLift}
            />
            {errors.exercise_name && <span className="text-red-500 text-sm mt-1">{errors.exercise_name.message}</span>}
          </div>
          <div className={`mb-4 p-4 ${isNoteVisible ? 'block' : 'hidden'}`}>
          <span className="text-red-500 text-sm mt-1">{liftNote}</span>
          </div>

          <div className='mb-2'>
            <label
              htmlFor='struct_bal_lift_load'
              className='mt-4 mb-3 block text-xl font-bold text-black dark:text-white'
            >
              Master Lift Load
            </label>
            <input
              {...register('struct_bal_lift_load', { required: 'Master lift load is required' })}
              id="lastname"
              className='w-full rounded-md border border-gray-300 bg-white py-3 px-6 mb-4 text-base font-medium text-gray-700 outline-none focus:border-purple-500 focus:shadow-md'
            />
            {errors.struct_bal_lift_load && <span className="text-red-500 text-sm mt-1">{errors.struct_bal_lift_load.message}</span>}
          </div>

          <div className="flex justify-center">
            <button
              onClick={(e) => {
                setIsListVisible(false);
                e.preventDefault();
                const formValues = getValues();
                setBalLifts(doCalculate(refLifts, formValues));
                setIsListVisible(true);
              }}
              className='hover:shadow-form rounded-md bg-purple-500 hover:bg-[#9400D3] py-3 px-8 text-base font-semibold text-white outline-none'
            >
              Calculate
            </button>
          </div>
        </form>
      </div>
      <div className={`mb-4 p-4 ${isListVisible ? 'block' : 'hidden'}`}>
        <BalancedLiftsList balLifts={balLifts} />
      </div>
    </>
  );
}
