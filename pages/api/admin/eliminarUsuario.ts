// pages/api/admin/eliminarUsuario.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import supabaseAdmin from '@/lib/supabaseAdmin'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  const { userId } = req.body

  if (!userId) {
    return res.status(400).json({ error: 'Falta el ID del usuario' })
  }

  try {
    // 1. Eliminar de tabla personalizada (por ejemplo, 'profiles')
    const { error: deleteProfileError } = await supabaseAdmin
      .from('profile')
      .delete()
      .eq('id', userId)

    if (deleteProfileError) {
      return res.status(500).json({ error: 'Error al eliminar del perfil', detail: deleteProfileError.message })
    }

    // 2. Eliminar del sistema de auth
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (deleteUserError) {
      return res.status(500).json({ error: 'Error al eliminar de auth', detail: deleteUserError.message })
    }

    return res.status(200).json({ message: 'Usuario eliminado correctamente' })
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}
