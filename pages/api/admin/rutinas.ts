// pages/api/admin/rutinas.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import supabaseAdmin from '@/lib/supabaseAdmin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const { data, error } = await supabaseAdmin
    .from('rutinas')
    .select(`
        id,
        nombre,
        dias_por_semana,
        fecha_creacion,
        usuario_id,
        profiles (
        nombre,
        apellido
        ),
        dias_rutina (
        id,
        numero_dia,
        nombre_dia,
        ejercicios_dia (
          id,
          ejercicio_id,
          series,
          repeticiones,
          peso,
          ejercicio (
            nombre
          )
        )
      )
    `);
    


    if (error) {
      console.error('Error al obtener rutinas:', error);
      return res.status(500).json({ message: 'Error al obtener rutinas', error });
    }

    return res.status(200).json({ rutinas: data });
  } catch (error) {
    console.error('Error interno:', error);
    return res.status(500).json({ message: 'Error interno del servidor', error });
  }
}
