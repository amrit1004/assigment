import React from 'react';
import { Modal } from './Modal';

export function DeleteConfirmation({ isOpen, onClose, onConfirm, rowIndex }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="mb-4 text-xl font-semibold">Confirm Deletion</h2>
      <p className="mb-6">Are you sure you want to delete row {rowIndex + 1}?</p>
      <div className="flex justify-end gap-4">
        <button
          onClick={onClose}
          className="rounded-md bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
        >
          Delete
        </button>
      </div>
    </Modal>
  );
}