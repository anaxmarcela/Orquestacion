// Arquitectura jerárquica: un gerente general delega en coordinadores de área,
// y cada coordinador delega en sus especialistas. Cada nivel usa al inferior como herramienta (asTool).
import { pathToFileURL } from "node:url";
import { Agent } from "@openai/agents";
import { MODELO } from "../src/config.js";
import { crearAgenteFaq, crearAgenteClima, crearAgenteCitas, REGLAS_GENERALES } from "../src/agentes.js";
import { hoyEnGuatemala } from "../src/servicios/clima.js";
import { iniciarChat } from "../src/chat.js";

const encabezado = () => `${REGLAS_GENERALES}\nHoy es ${hoyEnGuatemala()}.\n\n`;

export function crearGerente() {
  const faq = crearAgenteFaq();
  const clima = crearAgenteClima();
  const citas = crearAgenteCitas();

  const coordinadorAtencion = new Agent({
    name: "coordinador_atencion",
    model: MODELO,
    instructions: () => `${encabezado()}Coordinas la atención al cliente. Para cualquier pregunta frecuente usa agente_faq y devuelve su respuesta.`,
    tools: [faq.asTool({ toolName: "agente_faq", toolDescription: "Responde preguntas frecuentes." })],
  });

  const coordinadorReservas = new Agent({
    name: "coordinador_reservas",
    model: MODELO,
    instructions: () => `${encabezado()}Coordinas las reservas de saltos.
- Para agendar: primero usa agente_clima con la fecha. Si el veredicto es PROHIBIDO o la fecha no es válida, no agendes y devuelve el motivo. Si es IDEAL o MARGINAL, usa agente_citas con nombre, fecha, hora y correo.
- Para consultar el clima de una fecha: usa agente_clima.
- Para consultar una cita existente: usa agente_citas.`,
    tools: [
      clima.asTool({ toolName: "agente_clima", toolDescription: "Evalúa si una fecha es segura para saltar." }),
      citas.asTool({ toolName: "agente_citas", toolDescription: "Agenda o consulta citas de salto." }),
    ],
  });

  return new Agent({
    name: "gerente_general",
    model: MODELO,
    instructions: () => `${encabezado()}Eres el gerente general. No respondes con conocimiento propio: delegas en tus coordinadores y redactas la respuesta final.
- Preguntas frecuentes: coordinador_atencion.
- Clima, citas y reservas: coordinador_reservas (envíale todos los datos que dio el cliente).`,
    tools: [
      coordinadorAtencion.asTool({ toolName: "coordinador_atencion", toolDescription: "Área de atención al cliente: preguntas frecuentes." }),
      coordinadorReservas.asTool({ toolName: "coordinador_reservas", toolDescription: "Área de reservas: clima y citas de salto." }),
    ],
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await iniciarChat({ titulo: "jerárquica", agenteInicial: crearGerente() });
}
