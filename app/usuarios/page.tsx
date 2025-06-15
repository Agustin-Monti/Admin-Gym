"use client";

import { useEffect, useState } from "react";
import { getUsuarios } from "@/actions/usuarios-actions";
import UsuariosTable from "@/components/UsuariosTable"; // Import como default
import Sidebar from "@/components/Sidebar";


export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<any[]>([]);

  const fetchUsuarios = async () => {
    const data = await getUsuarios();
    console.log('Usuarios obtenidos:', data);
    if (Array.isArray(data)) {
      setUsuarios(data.map(u => ({ ...u }))); // ✅ Crea nuevos objetos y fuerza re-render
    } else {
      console.error('Error: los datos recibidos no son un array', data);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);
  

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-64">
        <div className="p-6">
          <h1 className="text-2xl font-semibold mb-4">Gestión de Usuarios</h1>
          <div className="bg-white shadow rounded-lg p-4">
            <UsuariosTable
              usuarios={usuarios}
              setUsuarios={setUsuarios}
              refetchUsuarios={fetchUsuarios} // ✅ le pasás esta función al hijo
            />
          </div>
        </div>
      </div>
    </div>
  );
}