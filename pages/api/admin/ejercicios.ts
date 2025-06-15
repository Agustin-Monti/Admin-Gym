import type { NextApiRequest, NextApiResponse } from 'next';
import supabaseAdmin from '@/lib/supabaseAdmin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { data, error } = await supabaseAdmin
    .from('ejercicios')
    .select('*'); // trae todos los perfiles

  if (error) {
    return res.status(500).json({ message: 'Error al traer ejercicios', error });
  }

  return res.status(200).json(data);
}
