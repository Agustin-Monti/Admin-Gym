// pages/api/admin/actualizarUsuario.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import supabaseAdmin from '@/lib/supabaseAdmin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { id, updates } = req.body;

  if (!id || typeof updates !== 'object') {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }

  const updatesToSend: any = {};
  if (typeof updates.admin === 'boolean') {
    updatesToSend.admin = updates.admin;
  }
  if (typeof updates.demanda_gratis === 'boolean') {
    updatesToSend.demanda_gratis = updates.demanda_gratis;
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('profile')
      .update(updatesToSend)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error de Supabase:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (err: any) {
    console.error('Error general:', err);
    return res.status(500).json({ error: 'Error al actualizar usuario' });
  }
}
