// pages/api/admin/ejercicios.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import supabaseAdmin from '@/lib/supabaseAdmin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Cambia el select para incluir explícitamente grupo_id
  const { data, error, count } = await supabaseAdmin
    .from('ejercicios')
    .select('id, nombre, info, imagen_url, created_at, grupo_id') // ← ¡Agrega grupo_id aquí!
    .order('id', { ascending: true });

  
  if (error) {
    return res.status(500).json({ message: 'Error al traer ejercicios', error });
  }

  return res.status(200).json(data);
}