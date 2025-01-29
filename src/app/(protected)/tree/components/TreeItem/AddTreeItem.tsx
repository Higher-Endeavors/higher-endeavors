"use client";

import { Button, Label, Modal, TextInput } from "flowbite-react";
import { useState } from "react";
import { useForm } from 'react-hook-form';
import { TreeItems } from '../../utilities/types';
import {
  addItem,
  renumberItems,
} from '../../utilities/utilities';

type FormData = {
  itemName: string;
};

interface AddTreeItemProps {
  items: TreeItems;
  openModal: boolean;
  setItems: React.Dispatch<React.SetStateAction<TreeItems>>;
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function AddTreeItem({
  items,
  openModal,
  setItems,
  setOpenModal
}: AddTreeItemProps) {

  const { register, getValues, handleSubmit, formState: { errors }, reset } = useForm<FormData>();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isErrorVisible, setIsErrorVisible] = useState(false);

  const onCloseModal = () => {
    setOpenModal(false);
  }

  const onSubmit = async (data: FormData) => {
    const newItems = addItem(items, 0, 0, data.itemName);
    setItems(renumberItems(newItems));
    setOpenModal(false);
    reset();
    setSubmitError(null);
    setIsErrorVisible(false);
  };
  return (
    <>
      <Modal show={openModal} size="md" onClose={onCloseModal} popup>
        <Modal.Header />
        <Modal.Body>
          <div className="space-y-6">
            <h3 className="text-xl font-medium text-gray-900 dark:text-white">Add Item to Tree</h3>
            <div />
            <div>
              <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md mx-auto">
                <div className={`mb-4 p-4 bg-red-100 text-red-700 rounded-md ${isErrorVisible ? 'block' : 'hidden'}`}>
                  {submitError}
                </div>

                <div className='mb-2'>
                  <label
                    htmlFor='itemName'
                    className='mt-4 mb-3 block text-xl font-bold text-black dark:text-white'
                  >
                    Item Name
                  </label>
                  <input
                    {...register('itemName', { required: 'Master lift load is required' })}
                    id="itemName"
                    className='w-full rounded-md border border-gray-300 bg-white py-3 px-6 mb-4 text-base font-medium text-gray-700 outline-none focus:border-purple-500 focus:shadow-md'
                  />
                  {errors.itemName && <span className="text-red-500 text-sm mt-1">{errors.itemName.message}</span>}
                </div>
                <button
                  type="submit"
                  className='hover:shadow-form rounded-md bg-purple-500 hover:bg-[#9400D3] py-3 px-8 text-base font-semibold text-white outline-none'
                >
                  Add
                </button>

              </form>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}
