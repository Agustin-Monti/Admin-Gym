"use client";

import { useEffect, useState } from "react";
import { getEjercicios } from "@/actions/ejercicios-actions";
import ModalNuevoEjercicio from "@/components/ModalNuevoEjercicio";
import EjerciciosTable from "@/components/EjerciciosTable";
import Sidebar from "@/components/Sidebar";
import { Ejercicio } from "@/types/ejercicio";




export default function EjerciciosPage() {
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  useEffect(() => {
    const fetchEjercicios = async () => {
      const data = await getEjercicios();
      const adaptados = data.map((ej: any) => ({
        ...ej,
        imagen: ej.imagen_url, // <- adaptamos el campo
      }));
      setEjercicios(adaptados);
    };
    fetchEjercicios();
  }, []);


  const handleAgregarEjercicio = (nuevoEjercicio: Ejercicio) => {
    setEjercicios([...ejercicios, nuevoEjercicio]);
  };

  const handleSuccess = () => {
    setMensajeExito("Ejercicio guardado exitosamente!");
    setTimeout(() => setMensajeExito(null), 3000); // El mensaje se borra después de 3 segundos
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <div className="flex-1 ml-64">

        <div className="p-6">
          <h1 className="text-2xl font-semibold mb-4">Ejercicios</h1>

          <button
            onClick={() => setMostrarModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-4"
          >
            + Agregar Ejercicio
          </button>

          {mensajeExito && (
            <div className="bg-green-500 text-white p-2 rounded mb-4">
              {mensajeExito}
            </div>
          )}

          <ModalNuevoEjercicio
            mostrar={mostrarModal}
            cerrar={() => setMostrarModal(false)}
            onAgregar={handleAgregarEjercicio}
            onSuccess={handleSuccess}
          />

          <EjerciciosTable ejercicios={ejercicios} setEjercicios={setEjercicios} />
        </div>
      </div>
    </div>
  );
}
