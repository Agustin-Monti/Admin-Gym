'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import CrearRutinaForm from '@/components/CrearRutinaForm';
import RutinasTable from '@/components/RutinasTable';

export default function RutinasPage() {
  const [tab, setTab] = useState<'crear' | 'ver'>('crear');

  return (
    <div className="flex min-h-screen">
      {/* Sidebar con ancho fijo */}
      <div className="w-64">
        <Sidebar />
      </div>

      {/* Contenido principal con espacio restante */}
      <div className="flex-1 p-6 bg-gray-50">
        <h1 className="text-3xl font-bold mb-6 text-center">Gestión de Rutinas</h1>

        <div className="flex justify-center mb-4 space-x-4">
          <button
            className={`px-4 py-2 rounded ${tab === 'crear' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setTab('crear')}
          >
            Crear Rutina
          </button>
          <button
            className={`px-4 py-2 rounded ${tab === 'ver' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setTab('ver')}
          >
            Ver Rutinas
          </button>
        </div>

        <div className="mt-6">
          {tab === 'crear' && <CrearRutinaForm />}
          {tab === 'ver' && <RutinasTable />}
        </div>
      </div>
    </div>
  );
}
