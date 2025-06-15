export type Turno = "M" | "T" | "N";

export type Enfermero = {
  id: number;
  nombre: string;
  titular: boolean;
  preferencias: Turno[];
  rango: "Jefe" | "Titular" | "Suplente";
  vacaciones: number;
  franco: number;
  diasVacaciones?: number[];
  diasFranco?: number[];
  diasTrabajadosObjetivo?: number;
  diasConsecutivosTrabajados?: number;
  ultimoDiaTrabajado?: number;
};

export type Dia = {
  fecha: string;
  diaSemana: string;
  diaNumero: number;
  mañana: Enfermero[];
  tarde: Enfermero[];
  noche: Enfermero[];
};

export interface AusenciaProlongada {
  enfermeroId: number;
  diasAusente: number;
  diasAsignados: number;
  suplentesAsignados: number[];
}

export type DiasTrabajadosMap = Map<number, number>;

export interface ReemplazoHistorico {
  enfermeroAusenteId: number;
  suplenteId: number;
  fecha: string;
  turno: Turno;
  contador: number;
}

// Variable global para el histórico de reemplazos
let historicoReemplazos: ReemplazoHistorico[] = [];

export const cargarHistoricoReemplazos = (): ReemplazoHistorico[] => {
  try {
    const historico = localStorage.getItem('historicoReemplazos');
    return historico ? JSON.parse(historico) : [];
  } catch (error) {
    console.error("Error al cargar histórico de reemplazos:", error);
    return [];
  }
};

export const guardarHistoricoReemplazos = (historico: ReemplazoHistorico[]) => {
  try {
    localStorage.setItem('historicoReemplazos', JSON.stringify(historico));
  } catch (error) {
    console.error("Error al guardar histórico de reemplazos:", error);
  }
};


historicoReemplazos = cargarHistoricoReemplazos();

const registrarReemplazo = (
  enfermeroAusenteId: number,
  suplenteId: number,
  fecha: string,
  turno: Turno
) => {
  const existente = historicoReemplazos.find(r => 
    r.enfermeroAusenteId === enfermeroAusenteId && 
    r.suplenteId === suplenteId
  );
  
  if (existente) {
    existente.contador++;
    existente.fecha = fecha;
  } else {
    historicoReemplazos.push({
      enfermeroAusenteId,
      suplenteId,
      fecha,
      turno,
      contador: 1
    });
  }
  
  guardarHistoricoReemplazos(historicoReemplazos);
};

export const convertirPreferencia = (preferencia: string): Turno | null => {
  switch (preferencia) {
    case "Mañana": return "M";
    case "Tarde": return "T";
    case "Noche": return "N";
    default: return null;
  }
};

const shuffleArray = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

const generarDiasAleatorios = (dias: number, diasDelMes: number): number[] => {
  let diasAleatorios: number[] = [];
  while (diasAleatorios.length < dias) {
    const dia = Math.floor(Math.random() * diasDelMes) + 1;
    if (!diasAleatorios.includes(dia)) {
      diasAleatorios.push(dia);
    }
  }
  return diasAleatorios.sort((a, b) => a - b);
};

export const detectarAusenciasProlongadas = (
  ausencias: { enfermeroId?: number; fechaInicio: string; fechaFin: string }[],
  mes: number,
  año: number
): AusenciaProlongada[] => {
  const diasDelMes = new Date(año, mes, 0).getDate();
  const ausenciasProlongadas: AusenciaProlongada[] = [];

  ausencias.forEach(ausencia => {
    if (!ausencia.enfermeroId) return;
    
    const inicio = new Date(ausencia.fechaInicio);
    const fin = new Date(ausencia.fechaFin);
    const diasAusente = Math.ceil((fin.getTime() - inicio.getTime()) / (1000 * 3600 * 24)) + 1;
    
    // Consideramos "prolongada" una ausencia de más de 7 días
    if (diasAusente > 7) {
      ausenciasProlongadas.push({
        enfermeroId: ausencia.enfermeroId,
        diasAusente,
        diasAsignados: 0,
        suplentesAsignados: []
      });
    }
  });

  return ausenciasProlongadas;
};

const encontrarSuplenteParaAusenciaProlongada = (
  enfermeroAusente: Enfermero,
  suplentesDisponibles: Enfermero[],
  ausenciaProlongada: AusenciaProlongada,
  diasTrabajadosPorEnfermero: Map<number, number>,
  fecha: string
): Enfermero | undefined => {
  // Filtrar suplentes que no han sido asignados a este enfermero ausente
  const suplentesElegibles = suplentesDisponibles.filter(suplente => 
    !ausenciaProlongada.suplentesAsignados.includes(suplente.id)
  );

  if (suplentesElegibles.length === 0) {
    // Si todos los suplentes ya fueron asignados, elegir el que tenga menos reemplazos
    return suplentesDisponibles.sort((a, b) => {
      const reemplazosA = historicoReemplazos
        .filter(r => r.suplenteId === a.id && r.enfermeroAusenteId === enfermeroAusente.id)
        .reduce((sum, r) => sum + r.contador, 0);
      
      const reemplazosB = historicoReemplazos
        .filter(r => r.suplenteId === b.id && r.enfermeroAusenteId === enfermeroAusente.id)
        .reduce((sum, r) => sum + r.contador, 0);
      
      return reemplazosA - reemplazosB;
    })[0];
  }

  // Distribución equitativa entre suplentes
  return suplentesElegibles.sort((a, b) => {
    // Primero por días trabajados totales
    const diasA = diasTrabajadosPorEnfermero.get(a.id) || 0;
    const diasB = diasTrabajadosPorEnfermero.get(b.id) || 0;
    
    if (diasA !== diasB) return diasA - diasB;
    
    // Luego por reemplazos a este enfermero
    const reemplazosA = historicoReemplazos
      .filter(r => r.suplenteId === a.id && r.enfermeroAusenteId === enfermeroAusente.id)
      .reduce((sum, r) => sum + r.contador, 0);
    
    const reemplazosB = historicoReemplazos
      .filter(r => r.suplenteId === b.id && r.enfermeroAusenteId === enfermeroAusente.id)
      .reduce((sum, r) => sum + r.contador, 0);
    
    return reemplazosA - reemplazosB;
  })[0];
};

const contarAsignacionesRecientes = (
  enfermeroId: number,
  calendario: Dia[],
  fechaActual: string,
  diasAtras: number
): number => {
  const fechaObj = new Date(fechaActual);
  let contador = 0;
  
  for (let i = 1; i <= diasAtras; i++) {
    const fechaAnterior = new Date(fechaObj);
    fechaAnterior.setDate(fechaObj.getDate() - i);
    const fechaStr = fechaAnterior.toISOString().split('T')[0];
    
    const dia = calendario.find(d => d.fecha === fechaStr);
    if (dia) {
      if ([...dia.mañana, ...dia.tarde, ...dia.noche].some(e => e.id === enfermeroId)) {
        contador++;
      }
    }
  }
  
  return contador;
};

export const reemplazarEnfermero = (
  turno: Enfermero[], 
  fecha: string,
  enfermerosNoDisponibles: string[],
  ausencias: { enfermeroId?: number; nombre: string; fechaInicio: string; fechaFin: string }[],
  turnoTipo: "mañana" | "tarde" | "noche",
  diasTrabajadosPorEnfermero: Map<number, number>,
  ausenciasProlongadas: AusenciaProlongada[],
  listaEnfermeros: Enfermero[]
): Enfermero[] => {
  return turno.map((enfermero) => {
    if (enfermerosNoDisponibles.includes(enfermero.nombre)) {
      const ausencia = ausencias.find(a => 
        a.nombre === enfermero.nombre && 
        new Date(fecha) >= new Date(a.fechaInicio) && 
        new Date(fecha) <= new Date(a.fechaFin)
      );
      
      if (ausencia && ausencia.enfermeroId) {
        const enfermeroAusente = listaEnfermeros.find(e => e.id === ausencia.enfermeroId);
        if (!enfermeroAusente) return enfermero;

        const ausenciaProlongada = ausenciasProlongadas.find(ap => ap.enfermeroId === enfermeroAusente.id);
        
        const suplentesDisponibles = listaEnfermeros.filter(
          (e: Enfermero) => 
            e.rango === "Suplente" &&
            !enfermerosNoDisponibles.includes(e.nombre) &&
            !turno.includes(e) &&
            (diasTrabajadosPorEnfermero.get(e.id) || 0) < 12
        );

        if (ausenciaProlongada && suplentesDisponibles.length > 0) {
          // Lógica para ausencias prolongadas
          const suplente = encontrarSuplenteParaAusenciaProlongada(
            enfermeroAusente,
            suplentesDisponibles,
            ausenciaProlongada,
            diasTrabajadosPorEnfermero,
            fecha
          );

          if (suplente) {
            registrarReemplazo(enfermeroAusente.id, suplente.id, fecha, 
              turnoTipo === "mañana" ? "M" : turnoTipo === "tarde" ? "T" : "N");
            
            // Actualizar la ausencia prolongada
            ausenciaProlongada.diasAsignados++;
            if (!ausenciaProlongada.suplentesAsignados.includes(suplente.id)) {
              ausenciaProlongada.suplentesAsignados.push(suplente.id);
            }
            
            return suplente;
          }
        } else {
          // Lógica normal para ausencias cortas
          const suplentes = listaEnfermeros.filter(
            (e: Enfermero) => 
              e.rango === "Suplente" && 
              !enfermerosNoDisponibles.includes(e.nombre) &&
              !turno.includes(e) &&
              (diasTrabajadosPorEnfermero.get(e.id) || 0) < 12
          );

          if (suplentes.length > 0) {
            const suplente = suplentes.sort((a: Enfermero, b: Enfermero) => {
              const diasA = diasTrabajadosPorEnfermero.get(a.id) || 0;
              const diasB = diasTrabajadosPorEnfermero.get(b.id) || 0;
              return diasA - diasB;
            })[0];

            if (suplente) {
              registrarReemplazo(enfermeroAusente.id, suplente.id, fecha, 
                turnoTipo === "mañana" ? "M" : turnoTipo === "tarde" ? "T" : "N");
              return suplente;
            }
          }
        }
      }
    }
    return enfermero;
  });
};

const necesitaFranco = (enfermero: Enfermero, diaActual: number): boolean => {
  if (enfermero.rango === "Jefe") return false;
  if (!enfermero.ultimoDiaTrabajado) return false;
  
  const diasConsecutivos = (enfermero.diasConsecutivosTrabajados || 0);
  
  if (diasConsecutivos >= 2 && diaActual === enfermero.ultimoDiaTrabajado + 1) {
    return true;
  }
  
  if (diasConsecutivos >= 4 && diaActual <= enfermero.ultimoDiaTrabajado + 2) {
    return true;
  }
  
  return false;
};

const manejarFrancosAutomaticos = (enfermero: Enfermero, diaNumero: number) => {
  const diasConsecutivos = enfermero.diasConsecutivosTrabajados || 0;
  
  if (diasConsecutivos >= 2) {
    enfermero.diasFranco = enfermero.diasFranco || [];
    if (!enfermero.diasFranco.includes(diaNumero + 1)) {
      enfermero.diasFranco.push(diaNumero + 1);
    }
  }
  
  if (diasConsecutivos >= 4) {
    for (let i = 1; i <= 2; i++) {
      enfermero.diasFranco = enfermero.diasFranco || [];
      if (!enfermero.diasFranco.includes(diaNumero + i)) {
        enfermero.diasFranco.push(diaNumero + i);
      }
    }
  }
};

const encontrarSuplenteEquitativo = (
  enfermerosDisponibles: Enfermero[],
  enfermeroAusente: Enfermero,
  fecha: string,
  turno: Turno,
  diasTrabajadosPorEnfermero: Map<number, number>
): Enfermero | undefined => {
  const suplentes = enfermerosDisponibles.filter(e => 
    e.rango === "Suplente" && 
    (diasTrabajadosPorEnfermero.get(e.id) || 0) < 12
  );

  if (suplentes.length === 0) return undefined;

  suplentes.sort((a, b) => {
    // Reemplazos a este enfermero específico
    const reemplazosA = historicoReemplazos
      .filter(r => r.suplenteId === a.id && r.enfermeroAusenteId === enfermeroAusente.id)
      .reduce((sum, r) => sum + r.contador, 0);
      
    const reemplazosB = historicoReemplazos
      .filter(r => r.suplenteId === b.id && r.enfermeroAusenteId === enfermeroAusente.id)
      .reduce((sum, r) => sum + r.contador, 0);
    
    if (reemplazosA !== reemplazosB) return reemplazosA - reemplazosB;
    
    // Reemplazos totales
    const totalA = historicoReemplazos
      .filter(r => r.suplenteId === a.id)
      .reduce((sum, r) => sum + r.contador, 0);
      
    const totalB = historicoReemplazos
      .filter(r => r.suplenteId === b.id)
      .reduce((sum, r) => sum + r.contador, 0);
    
    if (totalA !== totalB) return totalA - totalB;
    
    // Días trabajados
    const diasA = diasTrabajadosPorEnfermero.get(a.id) || 0;
    const diasB = diasTrabajadosPorEnfermero.get(b.id) || 0;
    return diasA - diasB;
  });

  const suplenteSeleccionado = suplentes[0];
  
  if (suplenteSeleccionado) {
    registrarReemplazo(enfermeroAusente.id, suplenteSeleccionado.id, fecha, turno);
  }
  
  return suplenteSeleccionado;
};

const puedeTrabajarTurno = (
  enfermero: Enfermero,
  turno: Turno,
  diaNumero: number,
  diasTrabajadosPorEnfermero: Map<number, number>,
  noDisponibles: string[],
  calendario: Dia[],
  diaSemana: string
): boolean => {
  if (noDisponibles.includes(enfermero.nombre)) return false;
  if (enfermero.diasVacaciones?.includes(diaNumero)) return false;
  if (enfermero.diasFranco?.includes(diaNumero)) return false;
  
  if (enfermero.rango === "Jefe") {
    if (diaSemana === "Sábado" || diaSemana === "Domingo") return false;
    if (enfermero.nombre === "Viviana" && turno !== "M") return false;
    if (enfermero.nombre === "Alonso" && turno !== "T") return false;
  }
  
  const diasTrabajados = diasTrabajadosPorEnfermero.get(enfermero.id) || 0;
  
  if (enfermero.rango === "Titular") {
    if (diasTrabajados >= 17) return false;
    if (diaNumero > 20 && diasTrabajados < 15) return true;
  }
  
  if (enfermero.rango === "Suplente" && diasTrabajados >= 12) return false;
  
  if (enfermero.rango !== "Jefe" && !enfermero.preferencias.includes(turno)) return false;
  
  if (necesitaFranco(enfermero, diaNumero)) return false;
  
  if ((enfermero.diasConsecutivosTrabajados || 0) >= 4) return false;
  
  return true;
};

const asignarTurno = (
  enfermerosDisponibles: Enfermero[],
  turno: Turno,
  cantidadNecesaria: number,
  enfermerosAsignadosHoy: Set<number>,
  diaNumero: number,
  diasTrabajadosPorEnfermero: Map<number, number>,
  noDisponibles: string[],
  calendario: Dia[],
  diaSemana: string
): Enfermero[] => {
  const seleccionados: Enfermero[] = [];
  const esFinde = diaSemana === "Sábado" || diaSemana === "Domingo";

  if (!esFinde) {
    const jefe = turno === "M" ? 
      enfermerosDisponibles.find(e => e.rango === "Jefe" && e.nombre === "Viviana") :
      enfermerosDisponibles.find(e => e.rango === "Jefe" && e.nombre === "Alonso");
    
    if (jefe && puedeTrabajarTurno(jefe, turno, diaNumero, diasTrabajadosPorEnfermero, noDisponibles, calendario, diaSemana)) {
      seleccionados.push(jefe);
      enfermerosAsignadosHoy.add(jefe.id);
      const diasTrabajados = (diasTrabajadosPorEnfermero.get(jefe.id) || 0) + 1;
      diasTrabajadosPorEnfermero.set(jefe.id, diasTrabajados);
      jefe.ultimoDiaTrabajado = diaNumero;
    }
  }

  const titularesPendientes = enfermerosDisponibles
    .filter(e => 
      e.rango === "Titular" && 
      !enfermerosAsignadosHoy.has(e.id) &&
      (diasTrabajadosPorEnfermero.get(e.id) || 0) < 17 &&
      e.preferencias.includes(turno)
    )
    .sort((a, b) => {
      const diasA = diasTrabajadosPorEnfermero.get(a.id) || 0;
      const diasB = diasTrabajadosPorEnfermero.get(b.id) || 0;
      return diasA - diasB;
    });

  for (const titular of titularesPendientes) {
    if (seleccionados.length >= cantidadNecesaria) break;
    if (puedeTrabajarTurno(titular, turno, diaNumero, diasTrabajadosPorEnfermero, noDisponibles, calendario, diaSemana)) {
      seleccionados.push(titular);
      enfermerosAsignadosHoy.add(titular.id);
      
      const diasTrabajados = (diasTrabajadosPorEnfermero.get(titular.id) || 0) + 1;
      diasTrabajadosPorEnfermero.set(titular.id, diasTrabajados);
      
      if (titular.ultimoDiaTrabajado === diaNumero - 1) {
        titular.diasConsecutivosTrabajados = (titular.diasConsecutivosTrabajados || 0) + 1;
      } else {
        titular.diasConsecutivosTrabajados = 1;
      }
      titular.ultimoDiaTrabajado = diaNumero;
      
      manejarFrancosAutomaticos(titular, diaNumero);
    }
  }

  while (seleccionados.length < cantidadNecesaria) {
    const suplente = encontrarSuplenteEquitativo(
      enfermerosDisponibles.filter(e => 
        !enfermerosAsignadosHoy.has(e.id) &&
        e.rango === "Suplente"
      ),
      enfermerosDisponibles.find(e => e.rango === "Titular") || enfermerosDisponibles[0], // Fallback
      `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${diaNumero}`,
      turno,
      diasTrabajadosPorEnfermero
    );
    
    if (!suplente) break;
    
    seleccionados.push(suplente);
    enfermerosAsignadosHoy.add(suplente.id);
    
    const diasTrabajados = (diasTrabajadosPorEnfermero.get(suplente.id) || 0) + 1;
    diasTrabajadosPorEnfermero.set(suplente.id, diasTrabajados);
  }

  return seleccionados;
};

export const generarTurnos = (
  enfermeros: Enfermero[], 
  mes: number, 
  año: number,
  ausencias: Record<string, string[]> = {}
): {calendario: Dia[], diasTrabajados: DiasTrabajadosMap} => {
  const diasDelMes = new Date(año, mes, 0).getDate();
  const calendario: Dia[] = [];
  const diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const diasTrabajadosPorEnfermero = new Map<number, number>();

  enfermeros.forEach(enfermero => {
    enfermero.preferencias = enfermero.preferencias
      .map(p => convertirPreferencia(p))
      .filter(Boolean) as Turno[];
    
    enfermero.diasTrabajadosObjetivo = enfermero.rango === "Titular" ? 17 : 12;
    enfermero.diasFranco = [];
    enfermero.diasVacaciones = generarDiasAleatorios(enfermero.vacaciones, diasDelMes);
    enfermero.diasConsecutivosTrabajados = 0;
    enfermero.ultimoDiaTrabajado = undefined;
    diasTrabajadosPorEnfermero.set(enfermero.id, 0);
  });

  for (let diaNumero = 1; diaNumero <= diasDelMes; diaNumero++) {
    const fecha = `${año}-${mes.toString().padStart(2, "0")}-${diaNumero.toString().padStart(2, "0")}`;
    const diaSemana = diasSemana[new Date(año, mes - 1, diaNumero).getDay()];
    const noDisponibles = ausencias[fecha] || [];

    const dia: Dia = {
      fecha,
      diaSemana,
      diaNumero,
      mañana: [],
      tarde: [],
      noche: []
    };

    const enfermerosDisponibles = enfermeros.filter(e => 
      !noDisponibles.includes(e.nombre) && 
      !e.diasVacaciones?.includes(diaNumero) &&
      !e.diasFranco?.includes(diaNumero)
    );

    const enfermerosAsignadosHoy = new Set<number>();
    const esFinde = diaSemana === "Sábado" || diaSemana === "Domingo";

    // Convertir ausencias a formato para detectar prolongadas
    const ausenciasArray = Object.entries(ausencias).flatMap(([fecha, nombres]) => 
      nombres.map(nombre => {
        const enfermero = enfermeros.find(e => e.nombre === nombre);
        return {
          enfermeroId: enfermero?.id,
          nombre,
          fechaInicio: fecha,
          fechaFin: fecha
        };
      })
    );

    const ausenciasProlongadas = detectarAusenciasProlongadas(ausenciasArray, mes, año);

    dia.mañana = reemplazarEnfermero(
      asignarTurno(
        enfermerosDisponibles,
        "M",
        esFinde ? 3 : 4,
        enfermerosAsignadosHoy,
        diaNumero,
        diasTrabajadosPorEnfermero,
        noDisponibles,
        calendario,
        diaSemana
      ),
      fecha,
      noDisponibles,
      ausenciasArray,
      "mañana",
      diasTrabajadosPorEnfermero,
      ausenciasProlongadas,
      enfermeros // Añadimos este octavo parámetro
    );

    dia.tarde = reemplazarEnfermero(
      asignarTurno(
        enfermerosDisponibles,
        "T",
        esFinde ? 3 : 4,
        enfermerosAsignadosHoy,
        diaNumero,
        diasTrabajadosPorEnfermero,
        noDisponibles,
        calendario,
        diaSemana
      ),
      fecha,
      noDisponibles,
      ausenciasArray,
      "tarde",
      diasTrabajadosPorEnfermero,
      ausenciasProlongadas,
      enfermeros // Añadimos este octavo parámetro
    );

    dia.noche = reemplazarEnfermero(
      asignarTurno(
        enfermerosDisponibles,
        "N",
        2,
        enfermerosAsignadosHoy,
        diaNumero,
        diasTrabajadosPorEnfermero,
        noDisponibles,
        calendario,
        diaSemana
      ),
      fecha,
      noDisponibles,
      ausenciasArray,
      "noche",
      diasTrabajadosPorEnfermero,
      ausenciasProlongadas,
      enfermeros // Añadimos este octavo parámetro
    );

    calendario.push(dia);
  }

  return { calendario, diasTrabajados: diasTrabajadosPorEnfermero };
};