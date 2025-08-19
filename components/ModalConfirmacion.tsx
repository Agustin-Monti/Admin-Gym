'use client';

import { XMarkIcon } from '@heroicons/react/24/outline';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';

interface ModalConfirmacionProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  mensaje: string;
}

export default function ModalConfirmacion({
  isOpen,
  onClose,
  onConfirm,
  mensaje,
}: ModalConfirmacionProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md transform transition-all animate-scale-in">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/50">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Confirmar acción
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Cerrar"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-300">{mensaje}</p>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-5 py-2.5 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 focus:ring-4 focus:ring-red-200 dark:focus:ring-red-900 transition-colors"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}