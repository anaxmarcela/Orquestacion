import { Agent } from "@openai/agents";
import { MODELO } from "./config.js";
import { hoyEnGuatemala } from "./servicios/clima.js";
import {
  buscarFaqTool,
  consultarClimaTool,
  agendarCitaTool,
  consultarCitaTool,
} from "./herramientas.js";

export const REGLAS_GENERALES = `Trabajas para Parachute S.A., empresa de paracaidismo en Guatemala. Respondes siempre en español, de forma breve y amable.`;

const conFecha = (texto, extra) => () =>
  `${REGLAS_GENERALES}\nHoy es ${hoyEnGuatemala()} (zona horaria de Guatemala).\n\n${texto}${extra ? `\n\n${extra}` : ""}`;

export function crearAgenteFaq({ instruccionesExtra, handoffs = [] } = {}) {
  return new Agent({
    name: "agente_faq",
    handoffDescription: "Responde preguntas frecuentes: horario, costo, consultas virtuales, cancelación, ubicación y formas de pago.",
    model: MODELO,
    instructions: conFecha(
      `Respondes preguntas frecuentes. Usa siempre la herramienta buscar_faq y responde solo con la información que devuelve.
Si la herramienta no encuentra la respuesta, di exactamente: "No cuento con esa información."`,
      instruccionesExtra
    ),
    tools: [buscarFaqTool],
    handoffs,
  });
}

export function crearAgenteClima({ instruccionesExtra, handoffs = [] } = {}) {
  return new Agent({
    name: "agente_clima",
    handoffDescription: "Consulta el pronóstico del lugar de aterrizaje y decide si una fecha es segura para saltar.",
    model: MODELO,
    instructions: conFecha(
      `Evalúas si una fecha es segura para saltar. Convierte la fecha a YYYY-MM-DD y usa la herramienta consultar_clima.
Reporta el veredicto (IDEAL, MARGINAL o PROHIBIDO), los valores de viento, ráfagas, precipitación, nubosidad y temperatura, y el motivo de cada criterio que no sea ideal.
Si la herramienta devuelve un error (por ejemplo, la fecha supera los 16 días de pronóstico), explícalo tal cual.`,
      instruccionesExtra
    ),
    tools: [consultarClimaTool],
    handoffs,
  });
}

export function crearAgenteCitas({ instruccionesExtra, handoffs = [] } = {}) {
  return new Agent({
    name: "agente_citas",
    handoffDescription: "Agenda y consulta citas de salto.",
    model: MODELO,
    instructions: conFecha(
      `Agendas y consultas citas de salto.
Para agendar necesitas nombre, fecha, hora y correo; si falta alguno, pídelo y no llames agendar_cita.
Convierte fechas a YYYY-MM-DD y horas a HH:MM (24 horas).
La herramienta agendar_cita verifica el clima y rechaza días PROHIBIDOS: si rechaza, explica los motivos.
Al confirmar, incluye el identificador (por ejemplo APT_0001), la fecha, la hora y la restricción si existe.`,
      instruccionesExtra
    ),
    tools: [agendarCitaTool, consultarCitaTool],
    handoffs,
  });
}
