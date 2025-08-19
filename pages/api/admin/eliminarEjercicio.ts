import type { NextApiRequest, NextApiResponse } from "next";
import supabaseAdmin from "@/lib/supabaseAdmin";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "Método no permitido" });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: "Falta el ID del ejercicio" });
  }

  try {
    // 1. Obtener el ejercicio para conseguir la URL de la imagen
    const { data: ejercicio, error: fetchError } = await supabaseAdmin
      .from("ejercicios")
      .select("imagen_url, id")
      .eq("id", Number(id))
      .single();

    if (fetchError) throw fetchError;
    if (!ejercicio) throw new Error("Ejercicio no encontrado");

    // 2. Si tiene imagen, eliminarla del storage
    if (ejercicio.imagen_url) {
      // Extraer el path usando la misma lógica que en handleEliminarImagen
      const filePath = ejercicio.imagen_url.split("/public/ejercicios/")[1];
      
      if (!filePath) {
        throw new Error("No se pudo extraer el path del archivo de la URL");
      }

      console.log(`Intentando eliminar archivo: ${filePath}`);

      const { error: storageError } = await supabaseAdmin
        .storage
        .from("ejercicios")
        .remove([filePath]);

      if (storageError) {
        console.error("Error de Supabase Storage:", storageError);
        throw storageError;
      }
      console.log(`✅ Imagen del ejercicio id=${id} eliminada del storage`);
    }

    // 3. Eliminar el registro de la base de datos
    const { error: deleteError } = await supabaseAdmin
      .from("ejercicios")
      .delete()
      .eq("id", Number(id));

    if (deleteError) throw deleteError;

    console.log(`✅ Ejercicio con id=${id} eliminado correctamente`);
    return res.status(200).json({ success: true });
  } catch (error) {
    if (error instanceof Error) {
      console.error("❌ Error al eliminar ejercicio:", error.message);
      return res.status(500).json({ 
        message: "Error al eliminar ejercicio", 
        error: error.message 
      });
    }
    console.error("❌ Error desconocido al eliminar ejercicio:", error);
    return res.status(500).json({ 
      message: "Error desconocido al eliminar ejercicio", 
      error: "Error desconocido" 
    });
  }
}