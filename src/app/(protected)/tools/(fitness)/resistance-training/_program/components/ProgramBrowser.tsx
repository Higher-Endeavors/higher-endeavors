import { useState } from 'react';
import { Modal } from 'flowbite-react';
import { HiOutlineTrash } from 'react-icons/hi';

export default function ProgramBrowser({ programs, onProgramSelect, onProgramsChange }: ProgramBrowserProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [programToDelete, setProgramToDelete] = useState<ResistanceProgram | null>(null);

  const handleDeleteClick = (program: ResistanceProgram) => {
    setProgramToDelete(program);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!programToDelete) return;

    try {
      const response = await fetch(`/api/resistance-training/program/${programToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete program');
      }

      // Update the local state by removing the deleted program
      onProgramsChange(programs.filter(p => p.id !== programToDelete.id));
      setShowDeleteConfirm(false);
      setProgramToDelete(null);

    } catch (error) {
      console.error('Error deleting program:', error);
      // You might want to show an error toast here
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {programs.map((program) => (
          <div
            key={program.id}
            className="relative p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-gray-800 dark:border-gray-700"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {program.name}
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleDeleteClick(program)}
                  className="p-1 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="Delete program"
                >
                  <HiOutlineTrash className="w-5 h-5" />
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              {program.description || 'No description'}
            </p>
            <button
              onClick={() => onProgramSelect(program)}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Select Program
            </button>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setProgramToDelete(null);
        }}
        size="md"
      >
        <Modal.Header className="dark:text-white">
          Delete Program
        </Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              Are you sure you want to delete "{programToDelete?.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setProgramToDelete(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete Program
              </button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
} 