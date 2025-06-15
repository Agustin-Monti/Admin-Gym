"use client";

import { useState } from "react";
import { crearEjercicio } from "@/actions/ejercicios-actions";
import { createClient } from "@/utils/supabase/client"; // NO server


interface Ejercicio {
  id: number;
  nombre: string;
  imagen: string;
  info: string;
}

interface ModalNuevoEjercicioProps {
  mostrar: boolean;
  cerrar: () => void;
  onAgregar: (nuevoEjercicio: Ejercicio) => void;
  onSuccess: () => void;
}

export default function ModalNuevoEjercicio({ mostrar, cerrar, onAgregar, onSuccess  }: ModalNuevoEjercicioProps) {
  const [nombre, setNombre] = useState('');
  const [imagen, setImagen] = useState<File | null>(null);
  const [info, setInfo] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleAgregar = async () => {
    if (!nombre.trim() || !imagen || !info.trim()) {
      alert("Por favor completa todos los campos.");
      return;
    }

    try {
      setCargando(true);

      const supabase = createClient(); // crear cliente aquí también

      // 1. Subir imagen a Supabase Storage
      const { data: storageData, error: storageError } = await supabase
        .storage
        .from('ejercicios')
        .upload(`gifs/${Date.now()}-${imagen.name}`, imagen);

      if (storageError) {
        throw new Error(`Error subiendo la imagen: ${storageError.message}`);
      }

      // 2. Obtener la URL pública de la imagen subida
      const { data: publicUrlData } = supabase
        .storage
        .from('ejercicios')
        .getPublicUrl(storageData.path);

      const imagenUrl = publicUrlData.publicUrl;

      // 3. Ahora sí, pasar nombre, info y la URL de la imagen a crearEjercicio
      const { success, data, error } = await crearEjercicio(nombre, info, imagenUrl);

      if (success && data) {
        const nuevoEjercicio: Ejercicio = {
          id: data.id,
          nombre: data.nombre,
          imagen: data.imagen_url,
          info: data.info,
        };

        onAgregar(nuevoEjercicio);
        cerrar();
        setNombre('');
        setImagen(null);
        setInfo('');
        onSuccess();
      } else {
        alert(`Error al crear ejercicio: ${error}`);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error al agregar ejercicio:", error);
        alert("Error al agregar el ejercicio: " + error.message);
      } else {
        console.error("Error desconocido:", error);
        alert("Error desconocido al agregar el ejercicio.");
      }
    } finally {
      setCargando(false);
    }
  };

  if (!mostrar) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">Nuevo Ejercicio</h2>
        
        <input
          type="text"
          placeholder="Nombre"
          className="w-full mb-2 border p-2 rounded"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />

        <input
          type="file"
          accept="image/gif"
          className="w-full mb-2 border p-2 rounded"
          onChange={(e) => e.target.files && setImagen(e.target.files[0])}
        />

        <textarea
          placeholder="Información adicional"
          className="w-full mb-4 border p-2 rounded"
          value={info}
          onChange={(e) => setInfo(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={cerrar}
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            disabled={cargando}
          >
            Cancelar
          </button>
          <button
            onClick={handleAgregar}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            disabled={cargando}
          >
            {cargando ? "Guardando..." : "Agregar"}
          </button>
        </div>
      </div>
    </div>
  );
}
