"use client";

import { useState, useEffect } from 'react';
import { createClient } from "@/utils/supabase/client"; // Para el lado del cliente
import { actualizarEjercicio } from "@/actions/ejercicios-actions";
import ModalCarga from "@/components/ModalCarga";
import { useRouter } from "next/navigation";


interface Ejercicio {
  id: number;
  nombre: string;
  imagen: string; // URL
  info: string;
  imagen_url?: string;
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
  });

  const [showUploadInput, setShowUploadInput] = useState(false);
  const supabase = createClient();
  const [cargando, setCargando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [archivoImagen, setArchivoImagen] = useState<File | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const router = useRouter();


  useEffect(() => {
    if (ejercicio) {
      setFormData({
        id: ejercicio.id,
        nombre: ejercicio.nombre,
        imagen: ejercicio.imagen_url || ejercicio.imagen, // soporte para ambos
        info: ejercicio.info,
      });
  
      console.log("Ejercicio a editar:", ejercicio);
    }
  }, [ejercicio]);
  
  

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const imageUrl = URL.createObjectURL(selectedFile);
      setFormData({ ...formData, imagen: imageUrl });
      setFile(selectedFile); // guardamos el archivo real
      setShowUploadInput(false);
    }
  };
  

  const handleEliminarImagen = async () => {
    if (!ejercicio || !ejercicio.imagen_url) {
      console.error("No hay datos del ejercicio o imagen para eliminar.");
      return;
    }
  
    const imagenUrl = ejercicio.imagen_url;
  
    // Extraer filePath desde la URL completa
    const filePath = imagenUrl.split("/public/ejercicios/")[1]; // ej: "gifs/archivo.gif"
  
    if (!filePath) {
      console.error("No se pudo extraer el filePath desde la URL de la imagen.");
      return;
    }
  
    console.log("Intentando eliminar:", filePath);
  
    // Eliminar del bucket
    const { error: storageError } = await supabase
      .storage
      .from("ejercicios")
      .remove([filePath]);
  
    if (storageError) {
      console.error("❌ Error al eliminar la imagen del bucket:", storageError.message);
      return;
    }
  
    console.log("✅ Imagen eliminada correctamente del bucket.");
  
    // Eliminar URL de la columna imagen_url
    const { error: dbError } = await supabase
      .from("ejercicios")
      .update({ imagen_url: null })
      .eq("id", ejercicio.id);
  
    if (dbError) {
      console.error("❌ Error al actualizar la base de datos:", dbError.message);
    } else {
      console.log("✅ Campo imagen_url eliminado correctamente de la base de datos.");
    }

    // 🔄 Actualizar el estado del formulario para que React re-renderice
    setFormData((prevData) => ({
      ...prevData,
      imagen: '', // Esto hará que desaparezca la imagen previa y se muestre el input de carga
    }));

    // Mostrar mensaje visual
    setMensajeExito("✅ Imagen eliminada con éxito");

    // Ocultarlo después de 3 segundos
    setTimeout(() => {
      setMensajeExito(null);
    }, 3000);
  };
  
  
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    // Validar campos básicos
    if (!formData.nombre.trim() || !formData.info.trim() || (!file && !formData.imagen)) {
      alert("Por favor completa todos los campos.");
      return;
    }
  
    try {
      setCargando(true);
      const supabase = createClient();
  
      let imagenUrl = formData.imagen; // Por defecto usamos la actual (sea vieja o nueva)
  
      // Subir nueva imagen solo si hay un archivo seleccionado
      if (file) {
        const nombreArchivo = `gifs/${Date.now()}-${file.name}`;
  
        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from("ejercicios")
          .upload(nombreArchivo, file);
  
        if (uploadError) {
          throw new Error(`Error subiendo la imagen: ${uploadError.message}`);
        }
  
        // Obtener URL pública de la imagen subida
        const { data: publicUrlData } = supabase
          .storage
          .from("ejercicios")
          .getPublicUrl(nombreArchivo);
  
        imagenUrl = publicUrlData.publicUrl;
      }
  
      // Log para depuración
      console.log("✏️ Actualizando ejercicio con:", {
        id: formData.id,
        nombre: formData.nombre,
        info: formData.info,
        imagenUrl,
      });
  
      // Llamar al backend para actualizar
      const { success, ejercicio: ejercicioActualizado } = await actualizarEjercicio(
        formData.id,
        formData.nombre,
        formData.info,
        imagenUrl
      );
  
      if (success) {
        // Actualizar lista padre y cerrar modal
        router.refresh();
        onSave({
          id: ejercicioActualizado.id,
          nombre: ejercicioActualizado.nombre,
          imagen: ejercicioActualizado.imagen_url,
          info: ejercicioActualizado.info,
        });
  
        onClose();
        setFormData({ id: 0, nombre: "", imagen: "", info: "" });
        setFile(null);
      }
    } catch (error: any) {
      console.error("❌ Error en handleSubmit:", error);
      alert("Error al actualizar el ejercicio: " + error.message);
    } finally {
      setCargando(false);
    }
  };
  
  
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Editar Ejercicio</h2>
        {mensajeExito && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded mb-4 text-sm text-center">
            {mensajeExito}
          </div>
        )}
        <div className="mb-4 border-b pb-4">
          <label className="block font-semibold mb-1">Nombre</label>
          <input
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            className="w-full p-2 border"
            placeholder="Nombre"
          />
        </div>

        <div className="mb-4 border-b pb-4">
          <label className="block font-semibold mb-1">Imagen</label>
          {formData.imagen ? (
            <div className="mb-2">
              <img src={formData.imagen} alt="Vista previa" className="w-32 h-32 object-cover mb-2" />
              <button
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
              className="w-full p-2 border"
              onChange={(e) => {
                const selectedFile = e.target.files?.[0];
                if (selectedFile) {
                  const imageUrl = URL.createObjectURL(selectedFile); // solo vista previa
                  setFile(selectedFile); // guardar archivo real
                  setFormData((prev) => ({ ...prev, imagen: imageUrl }));
                }
              }}
            />
          )}
        </div>

        <div className="mb-4 border-b pb-4">
          <label className="block font-semibold mb-1">Información</label>
          <textarea
            name="info"
            value={formData.info}
            onChange={handleChange}
            className="w-full p-2 border"
            placeholder="Información"
          />
        </div>

  
        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">
            Cancelar
          </button>
          <button onClick={handleSubmit} className="bg-blue-500 text-white px-4 py-2 rounded">
            Guardar
          </button>
        </div>
      </div>
      {cargando && <ModalCarga mensaje="Guardando cambios..." />}

    </div>
  );
}


