import { tool } from "@openai/agents";
import { z } from "zod";
import { buscarFaq } from "./servicios/faqs.js";
import { evaluarClimaParaFecha } from "./servicios/clima.js";
import { crearServicioCitas } from "./servicios/citas.js";

const citas = crearServicioCitas();

export const buscarFaqTool = tool({
  name: "buscar_faq",
  description:
    "Busca la respuesta oficial a una pregunta frecuente (horario, costo, consultas virtuales, cancelación, ubicación, formas de pago).",
  parameters: z.object({ pregunta: z.string().describe("Pregunta del cliente") }),
  execute: async ({ pregunta }) => buscarFaq(pregunta),
});

export const consultarClimaTool = tool({
  name: "consultar_clima",
  description:
    "Consulta el pronóstico de Open-Meteo para el lugar de aterrizaje y evalúa si el día es IDEAL, MARGINAL o PROHIBIDO para saltar. Solo hay pronóstico para los próximos 16 días.",
  parameters: z.object({ fecha: z.string().describe("Fecha en formato YYYY-MM-DD") }),
  execute: async ({ fecha }) => evaluarClimaParaFecha(fecha),
});

export const agendarCitaTool = tool({
  name: "agendar_cita",
  description:
    "Agenda un salto. Verifica el clima internamente y rechaza la cita si el día es PROHIBIDO. Requiere nombre, fecha, hora y correo.",
  parameters: z.object({
    nombre: z.string().describe("Nombre completo del cliente"),
    fecha: z.string().describe("Fecha en formato YYYY-MM-DD"),
    hora: z.string().describe("Hora en formato HH:MM de 24 horas"),
    correo: z.string().describe("Correo electrónico del cliente"),
  }),
  execute: async (datos) => citas.agendarCita(datos),
});

export const consultarCitaTool = tool({
  name: "consultar_cita",
  description: "Consulta una cita existente por su identificador, por ejemplo APT_0001.",
  parameters: z.object({ id_cita: z.string().describe("Identificador de la cita") }),
  execute: async ({ id_cita }) => citas.consultarCita(id_cita),
});
