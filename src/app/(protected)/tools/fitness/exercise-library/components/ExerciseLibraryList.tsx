// 'use client';

// import React, { useState, useEffect } from 'react';
// import { Exercise } from '@/types/exercise';
// import axios from 'axios';

// export default function ExerciseLibraryList() {
//   const [exercises, setExercises] = useState<Exercise[]>([]);

//   useEffect(() => {
//     fetchExercises();
//   }, []);

//   const fetchExercises = async () => {
//     const { data } = await axios.get('/api/exercise-library');
//     setExercises(data);
//   };

//   const handleDelete = async (id: number) => {
//     await axios.delete(`/api/exercise-library`, {
//       params: { id }
//     });
//     fetchExercises();
//   };

//   return (
//     <div className="mt-8">
//       <h2 className="text-xl font-semibold mb-4">Exercise List</h2>
//       <table className="w-full border-collapse">
//         <thead>
//           <tr>
//             <th className="border p-2">Name</th>
//             <th className="border p-2">Category</th>
//             <th className="border p-2">Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {exercises.map((exercise) => (
//             <tr key={exercise.id}>
//               <td className="border p-2">{exercise.exercise_name}</td>
//               <td className="border p-2">{exercise.category}</td>
//               <td className="border p-2">
//                 <button
//                   className="bg-red-500 text-white px-2 py-1 rounded"
//                   onClick={() => handleDelete(exercise.id)}
//                 >
//                   Delete
//                 </button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }
