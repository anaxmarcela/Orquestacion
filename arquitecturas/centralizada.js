// Arquitectura centralizada: un supervisor único usa a los especialistas como herramientas (asTool).
// Toda la conversación pasa por el supervisor; los especialistas nunca hablan entre sí.
import { pathToFileURL } from "node:url";
import { Agent } from "@openai/agents";
import { MODELO } from "../src/config.js";
import { crearAgenteFaq, crearAgenteClima, crearAgenteCitas, REGLAS_GENERALES } from "../src/agentes.js";
import { hoyEnGuatemala } from "../src/servicios/clima.js";
import { iniciarChat } from "../src/chat.js";

export function crearSupervisor() {
  const faq = crearAgenteFaq();
  const clima = crearAgenteClima();
  const citas = crearAgenteCitas();

  return new Agent({
    name: "supervisor",
    model: MODELO,
    instructions: () => `${REGLAS_GENERALES}
Hoy es ${hoyEnGuatemala()}.

Eres el supervisor central. No respondes con conocimiento propio: delegas en tus especialistas y redactas la respuesta final.
- Preguntas frecuentes: usa agente_faq.
- Clima o seguridad de una fecha: usa agente_clima.
- Agendar una cita: primero usa agente_clima con la fecha. Si el veredicto es PROHIBIDO o la fecha no es válida, no agendes y explica el motivo. Si es IDEAL o MARGINAL, usa agente_citas con todos los datos del cliente (si es MARGINAL, avisa que solo aplica para tándem experimentado).
- Consultar una cita existente: usa agente_citas.`,
    tools: [
      faq.asTool({ toolName: "agente_faq", toolDescription: "Responde preguntas frecuentes de Parachute S.A." }),
      clima.asTool({ toolName: "agente_clima", toolDescription: "Evalúa si una fecha es segura para saltar según el pronóstico de Open-Meteo." }),
      citas.asTool({ toolName: "agente_citas", toolDescription: "Agenda o consulta citas de salto. Envía nombre, fecha, hora y correo." }),
    ],
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await iniciarChat({ titulo: "centralizada", agenteInicial: crearSupervisor() });
}
