"use server";

import { createClient } from "@/utils/supabase/server";

interface Ejercicio {
  id: number;
  nombre: string;
  info: string;
  imagen_url: string;
}


export async function getEjercicios() {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("ejercicios")
      .select("*");
  
    if (error) {
      console.error("Error fetching ejercicios:", error); // 🚨 LOG DE ERROR
      return [];
    }
  
    console.log("Data de ejercicios:", data); // 👀 LOG DE DATA
  
    return data;
}
  


export async function crearEjercicio(nombre: string, info: string, imagenUrl: string, grupoMuscularId: number) {
  try {
    const supabase = await createClient();

    // Insertar en la base de datos
    const { data: dbData, error: dbError } = await supabase
      .from('ejercicios')
      .insert([{ nombre, info, imagen_url: imagenUrl, grupo_muscular_id: grupoMuscularId }])
      .select()
      .single();

    if (dbError) throw new Error(`Error insertando en base de datos: ${dbError.message}`);

    return { success: true, data: dbData };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error creando el ejercicio:", error.message);
      return { success: false, error: error.message };
    }
    console.error("Error desconocido:", error);
    return { success: false, error: "Error desconocido" };
  }
}


export async function actualizarEjercicio(
  id: number,
  nombre: string,
  info: string,
  imagenUrl?: string,
  grupoMuscularId?: number
) {
  const supabase = await createClient();

  const updateData: {
    nombre: string;
    info: string;
    imagen_url?: string;
    grupo_id?: number;
  } = { nombre, info };

  if (imagenUrl) {
    updateData.imagen_url = imagenUrl;
  }

  if (grupoMuscularId) {
    updateData.grupo_id = grupoMuscularId;
  }

  const { data, error } = await supabase
    .from("ejercicios")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Error al actualizar el ejercicio: ${error.message}`);
  }

  return { success: true, ejercicio: data };
}




