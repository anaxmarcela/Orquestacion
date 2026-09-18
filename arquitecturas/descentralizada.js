// Arquitectura descentralizada: no hay supervisor. Los agentes son pares y se transfieren
// la conversación entre sí con handoffs; el agente que recibe el control responde directamente al cliente.
import { pathToFileURL } from "node:url";
import { Agent } from "@openai/agents";
import { MODELO } from "../src/config.js";
import { crearAgenteFaq, crearAgenteClima, crearAgenteCitas, REGLAS_GENERALES } from "../src/agentes.js";
import { hoyEnGuatemala } from "../src/servicios/clima.js";
import { iniciarChat } from "../src/chat.js";

const TRANSFERENCIAS =
  "Si el cliente pide algo fuera de tu especialidad, transfiere la conversación al agente adecuado en lugar de responder tú.";

export function crearRecepcion() {
  const faq = crearAgenteFaq({ instruccionesExtra: TRANSFERENCIAS });
  const clima = crearAgenteClima({
    instruccionesExtra: `${TRANSFERENCIAS}
Si el cliente quiere agendar y el veredicto es IDEAL o MARGINAL, transfiere a agente_citas. Si es PROHIBIDO, explica el motivo y no transfieras.`,
  });
  const citas = crearAgenteCitas({
    instruccionesExtra: `${TRANSFERENCIAS}
Si el cliente solo pregunta por el clima de una fecha, transfiere a agente_clima.`,
  });
  const recepcion = new Agent({
    name: "recepcion",
    handoffDescription: "Recibe al cliente y lo dirige al agente adecuado.",
    model: MODELO,
    instructions: () => `${REGLAS_GENERALES}
Hoy es ${hoyEnGuatemala()}.

Eres la recepción. Identifica qué necesita el cliente y transfiérelo de inmediato:
- Preguntas frecuentes: agente_faq.
- Clima de una fecha o agendar un salto: agente_clima (verifica el clima antes de cualquier cita).
- Consultar una cita existente: agente_citas.`,
  });

  recepcion.handoffs = [faq, clima, citas];
  faq.handoffs = [clima, citas, recepcion];
  clima.handoffs = [citas, faq, recepcion];
  citas.handoffs = [clima, faq, recepcion];
  return recepcion;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await iniciarChat({ titulo: "descentralizada", agenteInicial: crearRecepcion(), conservarAgente: true });
}
