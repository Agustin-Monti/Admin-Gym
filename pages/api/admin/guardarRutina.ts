// pages/api/admin/guardarRutina.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import supabaseAdmin from '@/lib/supabaseAdmin';

type Rutina = {
  id: number;
  usuario_id: string;
  nombre: string;
  dias_por_semana: number;
};

type DiaRutina = {
  id: number;
  rutina_id: number;
  numero_dia: number;
  nombre_dia: string;
};

type Ejercicio = {
  ejercicioId: number;
  series: number;
  repeticiones: number;
  peso: number;
};

type DiaConEjercicios = {
  numeroDia: number;
  nombreDia: string;
  ejercicios: Ejercicio[];
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const { usuarioId, nombre, diasPorSemana, ejercicios }: {
      usuarioId: string;
      nombre: string;
      diasPorSemana: number;
      ejercicios: DiaConEjercicios[];
    } = req.body;

    // Insertar la rutina
    const { data: rutina, error: rutinaError } = await supabaseAdmin
      .from('rutinas')
      .insert([
        {
          usuario_id: usuarioId,
          nombre,
          dias_por_semana: diasPorSemana,
        },
      ])
      .single();

    if (rutinaError || !rutina) {
      return res.status(500).json({ message: 'Error al guardar la rutina', error: rutinaError });
    }

    const rutinaTyped = rutina as Rutina;

    // Insertar los días y ejercicios
    for (const dia of ejercicios) {
      const { data: diaData, error: diaError } = await supabaseAdmin
        .from('dias_rutina')
        .insert([
          {
            rutina_id: rutinaTyped.id,
            numero_dia: dia.numeroDia,
            nombre_dia: dia.nombreDia,
          },
        ])
        .single();

      if (diaError || !diaData) {
        return res.status(500).json({ message: 'Error al guardar el día de la rutina', error: diaError });
      }

      const diaTyped = diaData as DiaRutina;

      for (const ejercicio of dia.ejercicios) {
        const { error: ejercicioError } = await supabaseAdmin
          .from('ejercicios_dia')
          .insert([
            {
              dia_rutina_id: diaTyped.id,
              ejercicio_id: ejercicio.ejercicioId,
              series: ejercicio.series,
              repeticiones: ejercicio.repeticiones,
              peso: ejercicio.peso,
            },
          ]);

        if (ejercicioError) {
          return res.status(500).json({ message: 'Error al guardar el ejercicio', error: ejercicioError });
        }
      }
    }

    return res.status(200).json({ message: 'Rutina guardada con éxito' });
  } catch (error) {
    console.error('Error al guardar la rutina:', error);
    return res.status(500).json({ message: 'Error interno del servidor', error });
  }
}
