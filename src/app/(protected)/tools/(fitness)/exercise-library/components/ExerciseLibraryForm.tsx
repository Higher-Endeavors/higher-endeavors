// 'use client';

// import React from 'react';
// import { useForm } from 'react-hook-form';
// import { Exercise } from '@/types/exercise';
// import axios from 'axios';

// export default function ExerciseLibraryForm() {
//   const { register, handleSubmit, reset } = useForm<Exercise>();

//   const onSubmit = async (data: Exercise) => {
//     try {
//       const response = await axios.post('/api/exercise-library', data);
      
//       if (response.status === 200) {
//         reset();
//         // Optionally, you can trigger a refresh of the exercise list here
//       }
//     } catch (error) {
//       console.error('Error adding exercise:', error);
//       // Handle error appropriately
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//       <div>
//         <label htmlFor="exercise_name" className="block">Exercise Name</label>
//         <input {...register('exercise_name')} className="w-full border p-2" required />
//       </div>
//       <div>
//         <label htmlFor="description" className="block">Description</label>
//         <textarea {...register('description')} className="w-full border p-2" />
//       </div>
//       <div>
//         <label htmlFor="movement" className="block">Movement</label>
//         <input {...register('movement')} className="w-full border p-2" />
//       </div>
//       <div>
//         <label htmlFor="category" className="block">Category</label>
//         <input {...register('category')} className="w-full border p-2" />
//       </div>
//       <div>
//         <label htmlFor="primary_muscles" className="block">Primary Muscles</label>
//         <input {...register('primary_muscles')} className="w-full border p-2" />
//       </div>
//       <div>
//         <label htmlFor="secondary_muscles" className="block">Secondary Muscles</label>
//         <input {...register('secondary_muscles')} className="w-full border p-2" />
//       </div>
//       <div>
//         <label htmlFor="images" className="block">Images</label>
//         <input {...register('images')} className="w-full border p-2" />
//       </div>
//       <div>
//         <label htmlFor="equipment" className="block">Equipment</label>
//         <input {...register('equipment')} className="w-full border p-2" />
//       </div>
//       <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
//         Add Exercise
//       </button>
//     </form>
//   );
// }
