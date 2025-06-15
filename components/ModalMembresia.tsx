"use client";

import { useState } from "react";

interface ModalMembresiaProps {
  isOpen: boolean;
  usuario: { id: string; nombre: string };
  onClose: () => void;
  onGuardar: (userId: string, fecha: string) => void;
}

export default function ModalMembresia({ isOpen, usuario, onClose, onGuardar }: ModalMembresiaProps) {
  const [fecha, setFecha] = useState("");

  const handleGuardar = () => {
    if (!fecha) return alert("Seleccioná una fecha");
    onGuardar(usuario.id, fecha);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Asignar membresía a {usuario.nombre}</h2>
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="border rounded px-3 py-2 w-full mb-4"
        />
        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancelar</button>
          <button onClick={handleGuardar} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">Guardar</button>
        </div>
      </div>
    </div>
  );
}
