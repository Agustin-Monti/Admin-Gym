import type { NextApiRequest, NextApiResponse } from 'next';
import supabaseAdmin from '@/lib/supabaseAdmin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { data, error, count } = await supabaseAdmin
    .from('ejercicios')
    .select('*', { count: 'exact' })
    .order('id', { ascending: true }); // asegura orden

  console.log('💡 Total ejercicios en DB:', count);

  if (error) {
    return res.status(500).json({ message: 'Error al traer ejercicios', error });
  }

  return res.status(200).json(data);
}
