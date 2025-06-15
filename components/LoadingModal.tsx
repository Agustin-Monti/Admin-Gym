"use client";

import { useEffect } from "react";

interface LoadingModalProps {
  isOpen: boolean;
  success?: boolean;
  message?: string;
  onClose?: () => void;
}

export default function LoadingModal({
  isOpen,
  success = false,
  message = "Procesando...",
  onClose,
}: LoadingModalProps) {
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        onClose?.(); // Llama a onClose después de 2s si se pasa
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [success, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex flex-col items-center">
          {success ? (
            <>
              <div className="text-green-500 text-4xl mb-2">✔️</div>
              <p className="text-lg font-medium text-gray-800">
                ¡Rutina creada correctamente!
              </p>
            </>
          ) : (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-lg font-medium text-gray-800">{message}</p>
              <p className="text-sm text-gray-500 mt-2">
                Por favor, espera un momento...
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
