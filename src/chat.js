import readline from "node:readline/promises";
import { run } from "@openai/agents";

function resumirPasos(resultado) {
  const pasos = [];
  for (const item of resultado.newItems) {
    if (item.type === "tool_call_item") pasos.push(`${item.agent.name} → ${item.rawItem.name}`);
    if (item.type === "handoff_output_item") pasos.push(`handoff: ${item.sourceAgent.name} → ${item.targetAgent.name}`);
  }
  return pasos;
}

// conservarAgente: en la arquitectura descentralizada el siguiente turno continúa con el último agente activo.
export async function iniciarChat({ titulo, agenteInicial, conservarAgente = false }) {
  let historial = [];
  let agente = agenteInicial;

  async function turno(mensaje) {
    const resultado = await run(agente, [...historial, { role: "user", content: mensaje }]);
    historial = resultado.history;
    if (conservarAgente && resultado.lastAgent) agente = resultado.lastAgent;
    const pasos = resumirPasos(resultado);
    if (pasos.length) console.log(`  [${pasos.join(" | ")}]`);
    console.log(`\n${resultado.lastAgent?.name ?? agente.name}: ${resultado.finalOutput}\n`);
  }

  const mensajeInicial = process.argv.slice(2).join(" ");
  if (mensajeInicial) {
    await turno(mensajeInicial);
    return;
  }

  console.log(`Parachute S.A. - Arquitectura ${titulo}. Escribe "salir" para terminar.\n`);
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  for (;;) {
    const mensaje = (await rl.question("Tú: ")).trim();
    if (!mensaje || mensaje.toLowerCase() === "salir") break;
    try {
      await turno(mensaje);
    } catch (error) {
      console.error(`Error: ${error.message}\n`);
    }
  }
  rl.close();
}
