"use server";


import { createClient } from "@/utils/supabase/server";


export const getUsuarios = async () => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const res = await fetch(`${baseUrl}/api/admin/usuarios`);
    const data = await res.json();
    console.log('Usuarios obtenidos:', data); 
    return data;
  } catch (err) {
    console.error('Error en getUsuarios:', err);
    return [];
  }
};


export async function actualizarUsuario(
  id: string,
  updates: { admin?: boolean; demanda_gratis?: boolean }
) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const res = await fetch(`${baseUrl}/api/admin/actualizarUsuario`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, updates }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(`Error al actualizar usuario: ${data.error}`);
  }

  return data;
}

  
export async function eliminarUsuario(id: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const res = await fetch(`${baseUrl}/api/admin/eliminarUsuario`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: id }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(`Error al eliminar usuario: ${data.error}`);
  }

  return data;
}
  
export async function obtenerNombrePais(paisId: string) {
    if (!paisId) return "No especificado";
  
    const supabase = await createClient();
    
    try {
      const { data, error } = await supabase
        .from("pais")
        .select("nombre")
        .eq("id", paisId)
        .single();
  
      if (error) throw error;
      return data?.nombre || "No encontrado";
    } catch (error) {
      console.error("Error al obtener país:", error);
      return "Error al cargar";
    }
}