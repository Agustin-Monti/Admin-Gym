'use client';

import { PencilIcon, TrashIcon } from '@heroicons/react/24/solid';
import { useState, useMemo } from 'react';
import ModalEditarEjercicio from './ModalEditarEjercicio';
import { Ejercicio } from "@/types/ejercicio";



interface EjerciciosTableProps {
  ejercicios: Ejercicio[];
  setEjercicios: (ejercicios: Ejercicio[]) => void;
}

export default function EjerciciosTable({ ejercicios, setEjercicios }: EjerciciosTableProps) {
  const [ejercicioEditar, setEjercicioEditar] = useState<Ejercicio | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [sortAsc, setSortAsc] = useState(true);
  const [imagenSeleccionada, setImagenSeleccionada] = useState<string | null>(null);


  const handleEditar = (ejercicio: Ejercicio) => {
    setEjercicioEditar(ejercicio);
    setIsModalOpen(true);
  };

  const handleEliminar = (id: number) => {
    const filtrados = ejercicios.filter((ej) => ej.id !== id);
    setEjercicios(filtrados);
  };

  const handleGuardar = (ejercicioActualizado: Ejercicio) => {
    const actualizados = ejercicios.map((ej) =>
      ej.id === ejercicioActualizado.id ? ejercicioActualizado : ej
    );
    setEjercicios(actualizados);
  };

  const ejerciciosFiltrados = useMemo(() => {
    const filtrados = ejercicios.filter((ej) =>
      ej.nombre.toLowerCase().includes(search.toLowerCase())
    );
    return filtrados.sort((a, b) =>
      sortAsc ? a.nombre.localeCompare(b.nombre) : b.nombre.localeCompare(a.nombre)
    );
  }, [ejercicios, search, sortAsc]);

  if (ejercicios.length === 0) return <p className="mt-4 text-gray-600">No hay ejercicios aún.</p>;

  return (
    <div className="mt-6">
      {/* Barra de búsqueda y botón de ordenamiento */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 w-full sm:w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={() => setSortAsc(!sortAsc)}
          className="bg-blue-500 text-white px-4 py-2 rounded-md shadow hover:bg-blue-600 transition text-sm"
        >
          Ordenar por nombre ({sortAsc ? 'A-Z' : 'Z-A'})
        </button>
      </div>

      {/* Tabla estilizada */}
      <div className="overflow-x-auto shadow rounded-lg">
        <table className="min-w-full bg-white rounded-lg divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Nombre</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Imagen</th>
              <th className="px-4 py-3 text-sm font-semibold text-gray-700 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {ejerciciosFiltrados.map((ej) => (
              <tr key={ej.id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3 text-sm text-gray-600">{ej.id}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{ej.nombre}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => {
                      console.log('Imagen seleccionada:', ej.imagen);
                      setImagenSeleccionada(ej.imagen);
                    }}
                    className="text-blue-500 hover:underline text-sm"
                  >
                    Ver imagen
                  </button>
                </td>

                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleEditar(ej)}
                    className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full mr-2 transition"
                    title="Editar"
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleEliminar(ej.id)}
                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition"
                    title="Eliminar"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <ModalEditarEjercicio
        ejercicio={ejercicioEditar}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleGuardar}
      />

      {imagenSeleccionada && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center p-4">
          <div className="bg-white p-4 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Vista previa</h2>
              <button onClick={() => setImagenSeleccionada(null)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <img
              src={imagenSeleccionada}
              alt="Imagen del ejercicio"
              className="w-full h-auto max-h-[700px] object-contain rounded"
            />
          </div>
        </div>
      )}

    </div>
  );
}
