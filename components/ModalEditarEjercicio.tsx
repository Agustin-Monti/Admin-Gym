"use client";

import { useState, useEffect } from 'react';
import { createClient } from "@/utils/supabase/client";
import { actualizarEjercicio } from "@/actions/ejercicios-actions";
import ModalCarga from "@/components/ModalCarga";
import { Alert } from "@/components/Alert";
import { useRouter } from "next/navigation";

interface Ejercicio {
  id: number;
  nombre: string;
  imagen: string;
  info: string;
  grupo_id?: number;
  imagen_url?: string;
}

interface GrupoMuscular {
  id: number;
  nombre: string;
}

interface ModalEditarEjercicioProps {
  ejercicio: Ejercicio | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (ejercicioActualizado: Ejercicio) => void;
}

export default function ModalEditarEjercicio({
  ejercicio,
  isOpen,
  onClose,
  onSave,
}: ModalEditarEjercicioProps) {
  const [formData, setFormData] = useState<Ejercicio>({
    id: 0,
    nombre: '',
    imagen: '',
    info: '',
    grupo_id: undefined,
  });
  const [archivoImagen, setArchivoImagen] = useState<File | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [cargando, setCargando] = useState(false);
  const [alerta, setAlerta] = useState<{ type: "error" | "success"; mensaje: string } | null>(null);
  const [gruposMusculares, setGruposMusculares] = useState<GrupoMuscular[]>([]);

  const supabase = createClient();
  const router = useRouter();

  // Cargar grupos musculares
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

  // Setear datos del ejercicio a editar
  useEffect(() => {
    if (ejercicio && gruposMusculares.length > 0) {
      setFormData({
        id: ejercicio.id,
        nombre: ejercicio.nombre,
        imagen: ejercicio.imagen_url || ejercicio.imagen,
        info: ejercicio.info,
        grupo_id: ejercicio.grupo_id ?? undefined, // <-- usar grupo_id
      });
      setFile(null);
    }
  }, [ejercicio, gruposMusculares]);



  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const imageUrl = URL.createObjectURL(selectedFile);
      setFormData({ ...formData, imagen: imageUrl });
      setFile(selectedFile);
    }
  };

  const handleEliminarImagen = async () => {
    if (!ejercicio || !ejercicio.imagen_url) return;

    const filePath = ejercicio.imagen_url.split("/public/ejercicios/")[1];
    if (!filePath) return;

    const { error: storageError } = await supabase.storage.from("ejercicios").remove([filePath]);
    if (storageError) {
      setAlerta({ type: "error", mensaje: "Error al eliminar la imagen del bucket." });
      return;
    }

    const { error: dbError } = await supabase
      .from("ejercicios")
      .update({ imagen_url: null })
      .eq("id", ejercicio.id);

    if (dbError) {
      setAlerta({ type: "error", mensaje: "Error al actualizar la base de datos." });
      return;
    }

    setFormData((prev) => ({ ...prev, imagen: "" }));
    setAlerta({ type: "success", mensaje: "Imagen eliminada correctamente." });

    setTimeout(() => setAlerta(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nombre.trim() || !formData.info.trim() || !formData.grupo_id) {
      setAlerta({ type: "error", mensaje: "Por favor completa todos los campos." });
      return;
    }

    try {
      setCargando(true);
      setAlerta(null);

      let imagenUrl = formData.imagen;

      if (file) {
        const nombreArchivo = `gifs/${Date.now()}-${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("ejercicios")
          .upload(nombreArchivo, file);

        if (uploadError) throw new Error(uploadError.message);

        const { data: publicUrlData } = supabase.storage
          .from("ejercicios")
          .getPublicUrl(nombreArchivo);

        imagenUrl = publicUrlData.publicUrl;
      }

      const { success, ejercicio: ejercicioActualizado } = await actualizarEjercicio(
        formData.id,
        formData.nombre,
        formData.info,
        imagenUrl,
        formData.grupo_id
      );

      if (success && ejercicioActualizado) {
        onSave({
          id: ejercicioActualizado.id,
          nombre: ejercicioActualizado.nombre,
          imagen: ejercicioActualizado.imagen_url,
          info: ejercicioActualizado.info,
          grupo_id: ejercicioActualizado.grupo_muscular_id,
        });
        setAlerta({ type: "success", mensaje: "Ejercicio actualizado correctamente." });
        onClose();
        setFormData({ id: 0, nombre: "", imagen: "", info: "", grupo_id: undefined });
        setFile(null);
      }
    } catch (error: any) {
      console.error(error);
      setAlerta({ type: "error", mensaje: "Error al actualizar el ejercicio: " + error.message });
    } finally {
      setCargando(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-11/12 max-w-2xl">
        <h2 className="text-2xl font-bold mb-6 text-center">Editar Ejercicio</h2>

        {alerta && <div className="mb-4"><Alert type={alerta.type}>{alerta.mensaje}</Alert></div>}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            placeholder="Nombre del ejercicio"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <select
            name="grupo_muscular_id"
            value={formData.grupo_id?.toString() ?? ""}
            onChange={(e) =>
              setFormData({ ...formData, grupo_id: e.target.value ? Number(e.target.value) : undefined })
            }
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Seleccionar grupo muscular</option>
            {gruposMusculares.map((grupo) => (
              <option key={grupo.id} value={grupo.id.toString()}>
                {grupo.nombre}
              </option>
            ))}
          </select>


          <div className="md:col-span-1">
            <label className="block font-semibold mb-1">Imagen</label>
            {formData.imagen ? (
              <div className="mb-2">
                <img src={formData.imagen} alt="Vista previa" className="w-32 h-32 object-cover mb-2 rounded" />
                <button
                  type="button"
                  onClick={handleEliminarImagen}
                  className="text-red-500 text-sm underline"
                >
                  Eliminar imagen
                </button>
              </div>
            ) : (
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            )}
          </div>

          <textarea
            name="info"
            value={formData.info}
            onChange={handleChange}
            placeholder="Información adicional"
            className="w-full md:col-span-2 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <div className="md:col-span-2 flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg bg-gray-400 text-white hover:bg-gray-500 transition"
              disabled={cargando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
              disabled={cargando}
            >
              {cargando ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>

      </div>
      {cargando && <ModalCarga mensaje="Guardando cambios..." />}
    </div>
  );
}
