"use client";

import { useState, useEffect } from "react";
import { crearEjercicio } from "@/actions/ejercicios-actions";
import { createClient } from "@/utils/supabase/client";
import { Alert } from "@/components/Alert";



interface Ejercicio {
  id: number;
  nombre: string;
  imagen: string;
  info: string;
  grupo_muscular_id: number;
}

interface GrupoMuscular {
  id: number;
  nombre: string;
}

interface ModalNuevoEjercicioProps {
  mostrar: boolean;
  cerrar: () => void;
  onAgregar: (nuevoEjercicio: Ejercicio) => void;
  onSuccess: () => void;
}

export default function ModalNuevoEjercicio({
  mostrar,
  cerrar,
  onAgregar,
  onSuccess,
}: ModalNuevoEjercicioProps) {
  const [nombre, setNombre] = useState("");
  const [imagen, setImagen] = useState<File | null>(null);
  const [info, setInfo] = useState("");
  const [grupoMuscularId, setGrupoMuscularId] = useState<number | null>(null);
  const [cargando, setCargando] = useState(false);
  const [gruposMusculares, setGruposMusculares] = useState<GrupoMuscular[]>([]);
  const [alerta, setAlerta] = useState<{ type: "error" | "success"; mensaje: string } | null>(
    null
  );

  const supabase = createClient();

  useEffect(() => {
    const fetchGrupos = async () => {
      const { data, error } = await supabase.from("grupos_musculares").select("*");
      if (error) {
        setAlerta({ type: "error", mensaje: "Error al cargar grupos musculares." });
        console.error(error.message);
      } else {
        setGruposMusculares(data);
      }
    };
    fetchGrupos();
  }, [supabase]);

  const handleAgregar = async () => {
    if (!nombre.trim() || !imagen || !info.trim() || !grupoMuscularId) {
      setAlerta({ type: "error", mensaje: "Por favor completa todos los campos." });
      return;
    }

    try {
      setCargando(true);
      setAlerta(null);

      const { data: storageData, error: storageError } = await supabase
        .storage
        .from("ejercicios")
        .upload(`gifs/${Date.now()}-${imagen.name}`, imagen);

      if (storageError) throw new Error(storageError.message);

      const { data: publicUrlData } = supabase
        .storage
        .from("ejercicios")
        .getPublicUrl(storageData.path);

      const imagenUrl = publicUrlData.publicUrl;

      const { success, data, error } = await crearEjercicio(
        nombre,
        info,
        imagenUrl,
        grupoMuscularId
      );

      if (success && data) {
        const nuevoEjercicio: Ejercicio = {
          id: data.id,
          nombre: data.nombre,
          info: data.info,
          imagen: data.imagen_url,
          grupo_muscular_id: grupoMuscularId,
        };
        onAgregar(nuevoEjercicio);
        setAlerta({ type: "success", mensaje: "Ejercicio agregado correctamente." });
        cerrar();
        setNombre("");
        setImagen(null);
        setInfo("");
        setGrupoMuscularId(null);
        onSuccess();
      } else {
        setAlerta({ type: "error", mensaje: `Error al crear ejercicio: ${error}` });
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setAlerta({ type: "error", mensaje: "Error al agregar ejercicio: " + error.message });
        console.error(error);
      } else {
        setAlerta({ type: "error", mensaje: "Error desconocido al agregar el ejercicio." });
        console.error(error);
      }
    } finally {
      setCargando(false);
    }
  };

  if (!mostrar) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-11/12 max-w-2xl">
        <h2 className="text-2xl font-bold mb-6 text-center">Agregar Nuevo Ejercicio</h2>

        {alerta && (
          <div className="mb-4">
            <Alert type={alerta.type}>{alerta.mensaje}</Alert>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Nombre del ejercicio"
            className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />

          <select
            value={grupoMuscularId ?? ""}
            onChange={(e) => setGrupoMuscularId(Number(e.target.value))}
            className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Seleccionar grupo muscular</option>
            {gruposMusculares.map((grupo) => (
              <option key={grupo.id} value={grupo.id}>
                {grupo.nombre}
              </option>
            ))}
          </select>

          <input
            type="file"
            accept="image/gif"
            onChange={(e) => e.target.files && setImagen(e.target.files[0])}
            className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <textarea
            placeholder="Información adicional"
            value={info}
            onChange={(e) => setInfo(e.target.value)}
            className="w-full md:col-span-2 border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={cerrar}
            disabled={cargando}
            className="px-6 py-2 rounded-lg bg-gray-400 text-white hover:bg-gray-500 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleAgregar}
            disabled={cargando}
            className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            {cargando ? "Guardando..." : "Agregar"}
          </button>
        </div>
      </div>
    </div>
  );
}
