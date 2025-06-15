"use server";


import { createClient } from "@/utils/supabase/server";

interface Ejercicio {
    ejercicioId: number;
    series: number;
    repeticiones: number;
    peso: number;
}
  
interface Dia {
    numeroDia: number;
    nombreDia: string;
    ejercicios: Ejercicio[];
}

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


export const getEjercicios = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
      const res = await fetch(`${baseUrl}/api/admin/ejercicios`);
      const data = await res.json();
      return data;
    } catch (err) {
      console.error('Error en getEjercicios:', err);
      return [];
    }
};


export const guardarRutina = async (
    nombre: string,
    dias_por_semana: number,
    ejercicios: Dia[],
    usuario_id: string
  ) => {
    const supabase = await createClient();
  
    try {
      // Insertar la rutina
      const { data: rutina, error: rutinaError } = await supabase
        .from('rutinas')
        .insert([
          {
            nombre,
            dias_por_semana,
            usuario_id,
          },
        ])
        .select()
        .single();
  
      if (rutinaError || !rutina) {
        console.error('Error al insertar rutina:', rutinaError);
        return { success: false, message: 'Error al guardar la rutina', error: rutinaError };
      }
  
      // Insertar días y ejercicios
      for (const dia of ejercicios) {
        const { data: diaData, error: diaError } = await supabase
          .from('dias_rutina')
          .insert([
            {
              rutina_id: rutina.id,
              numero_dia: dia.numeroDia,
              nombre_dia: dia.nombreDia,
            },
          ])
          .select()
          .single();
  
        if (diaError || !diaData) {
          console.error('Error al insertar día de rutina:', diaError);
          return { success: false, message: 'Error al guardar el día de la rutina', error: diaError };
        }
  
        for (const ejercicio of dia.ejercicios) {
          const { error: ejercicioError } = await supabase
            .from('ejercicios_dia')
            .insert([
              {
                dia_rutina_id: diaData.id,
                ejercicio_id: ejercicio.ejercicioId,
                series: ejercicio.series,
                repeticiones: ejercicio.repeticiones,
                peso: ejercicio.peso,
              },
            ]);
  
          if (ejercicioError) {
            console.error('Error al insertar ejercicio:', ejercicioError);
            return { success: false, message: 'Error al guardar el ejercicio', error: ejercicioError };
          }
        }
      }
  
      return { success: true, message: 'Rutina guardada correctamente' };
    } catch (err) {
      console.error('Error inesperado al guardar rutina:', err);
      return { success: false, message: 'Error inesperado', error: err };
    }
};


// lib/rutinas-actions.ts
export const getRutinas = async () => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const res = await fetch(`${baseUrl}/api/admin/rutinas`);
    const json = await res.json();

    if (!res.ok) throw new Error(json.message || 'Error al obtener rutinas');

    return json.rutinas;
  } catch (err) {
    console.error('Error en getRutinas:', err);
    return [];
  }
};

export const getRutinaById = async (id: string) => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const res = await fetch(`${baseUrl}/api/admin/rutinaPorId?id=${id}`);
    const json = await res.json();

    if (!res.ok) throw new Error(json.message || 'Error al obtener rutina');

    return json.rutina;
  } catch (err) {
    console.error(`Error en getRutinaById(${id}):`, err);
    return null;
  }
};


export const actualizarRutina = async (
  rutinaId: number,
  nombre: string,
  dias_por_semana: number,
  ejercicios: Dia[],
  usuario_id: string
) => {
  const supabase = await createClient();

  try {
    // 1. Actualizar la rutina
    const { error: rutinaError } = await supabase
      .from('rutinas')
      .update({
        nombre,
        dias_por_semana,
      })
      .eq('id', rutinaId);

    if (rutinaError) {
      console.error('Error al actualizar rutina:', rutinaError);
      return { success: false, message: 'Error al actualizar la rutina', error: rutinaError };
    }

    // 2. Eliminar los días existentes y sus ejercicios
    const { data: diasExistentes, error: diasError } = await supabase
      .from('dias_rutina')
      .select('id')
      .eq('rutina_id', rutinaId);

    if (diasError) {
      console.error('Error al obtener días existentes:', diasError);
      return { success: false, message: 'Error al obtener días anteriores', error: diasError };
    }

    const diaIds = diasExistentes.map((d) => d.id);

    // Eliminar ejercicios_dia relacionados
    if (diaIds.length > 0) {
      const { error: deleteEjerciciosError } = await supabase
        .from('ejercicios_dia')
        .delete()
        .in('dia_rutina_id', diaIds);

      if (deleteEjerciciosError) {
        console.error('Error al eliminar ejercicios:', deleteEjerciciosError);
        return { success: false, message: 'Error al eliminar ejercicios anteriores', error: deleteEjerciciosError };
      }

      // Eliminar días
      const { error: deleteDiasError } = await supabase
        .from('dias_rutina')
        .delete()
        .in('id', diaIds);

      if (deleteDiasError) {
        console.error('Error al eliminar días:', deleteDiasError);
        return { success: false, message: 'Error al eliminar días anteriores', error: deleteDiasError };
      }
    }

    // 3. Insertar días y ejercicios nuevos
    for (const dia of ejercicios) {
      const { data: diaData, error: diaInsertError } = await supabase
        .from('dias_rutina')
        .insert([
          {
            rutina_id: rutinaId,
            numero_dia: dia.numeroDia,
            nombre_dia: dia.nombreDia,
          },
        ])
        .select()
        .single();

      if (diaInsertError || !diaData) {
        console.error('Error al insertar día nuevo:', diaInsertError);
        return { success: false, message: 'Error al insertar nuevo día', error: diaInsertError };
      }

      for (const ejercicio of dia.ejercicios) {
        const { error: ejercicioInsertError } = await supabase
          .from('ejercicios_dia')
          .insert([
            {
              dia_rutina_id: diaData.id,
              ejercicio_id: ejercicio.ejercicioId,
              series: ejercicio.series,
              repeticiones: ejercicio.repeticiones,
              peso: ejercicio.peso,
            },
          ]);

        if (ejercicioInsertError) {
          console.error('Error al insertar ejercicio nuevo:', ejercicioInsertError);
          return { success: false, message: 'Error al insertar nuevo ejercicio', error: ejercicioInsertError };
        }
      }
    }

    return { success: true, message: 'Rutina actualizada correctamente' };
  } catch (err) {
    console.error('Error inesperado al actualizar rutina:', err);
    return { success: false, message: 'Error inesperado', error: err };
  }
};

  

  