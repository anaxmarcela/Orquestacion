# Hoja de Trabajo 5 - Orquestación de sistemas multiagente

Parachute S.A. necesita un asistente que responda preguntas frecuentes y agende saltos **solo si el clima es seguro**. El repositorio resuelve el mismo problema con tres arquitecturas de orquestación, construidas con el [SDK de agentes de OpenAI](https://openai.github.io/openai-agents-js/) y el modelo Gemini.

| Arquitectura | Programa | Diagrama | Mecanismo |
| --- | --- | --- | --- |
| Centralizada | [`arquitecturas/centralizada.js`](arquitecturas/centralizada.js) | [diagrama](diagramas/centralizada.md) | Supervisor con especialistas como herramientas (`asTool`) |
| Jerárquica | [`arquitecturas/jerarquica.js`](arquitecturas/jerarquica.js) | [diagrama](diagramas/jerarquica.md) | Gerente, coordinadores y especialistas (`asTool` en dos niveles) |
| Descentralizada | [`arquitecturas/descentralizada.js`](arquitecturas/descentralizada.js) | [diagrama](diagramas/descentralizada.md) | Agentes pares con transferencias (`handoffs`) |

Las respuestas a las preguntas de la hoja están en [`SE – Respuestas Orquestacion Multiagente.pdf`](<SE – Respuestas Orquestacion Multiagente.pdf>).

## Verificación del clima

El agente consulta la API de [Open-Meteo](https://open-meteo.com/) (opción `daily`) para el lugar de aterrizaje `14.013722, -90.771611` y obtiene ráfagas (`wind_gusts_10m`), temperatura (`temperature_2m`), precipitación (`precipitation`), nubosidad (`cloud_cover`) y velocidad del viento (`wind_speed_10m`). Open-Meteo solo pronostica 16 días: el agente rechaza fechas pasadas o posteriores a ese límite e indica la fecha máxima.

| Criterio | Ideal | Marginal | Prohibido |
| --- | --- | --- | --- |
| Velocidad del viento | < 20 km/h | 20 a 28 km/h (solo tándem experimentado) | > 28 km/h |
| Ráfagas | hasta 35 km/h | - | > 35 km/h |
| Precipitación | 0 mm | - | > 0 mm |
| Nubosidad | < 30 % | 30 a 75 % | > 75 % |

El veredicto del día es el peor nivel entre los criterios. Un día MARGINAL permite agendar con la restricción "Solo tándem experimentado".

## Diseño

Las integraciones no dependen de la arquitectura. Para un requisito nuevo basta con agregar un servicio, su herramienta y, si hace falta, un especialista; las arquitecturas solo cambian la forma de conectar a los agentes.

```
src/
  servicios/       Lógica pura, sin agentes
    clima.js       Consulta a Open-Meteo y validación de los 16 días
    criterios.js   Umbrales de seguridad (agregar un criterio = agregar un objeto)
    citas.js       Agenda citas y rechaza días PROHIBIDOS aunque un agente lo intente
    faqs.js        Base de preguntas frecuentes
  herramientas.js  Herramientas del SDK sobre los servicios
  agentes.js       Especialistas compartidos: agente_faq, agente_clima, agente_citas
  config.js        Modelo Gemini mediante su endpoint compatible con OpenAI
  chat.js          Conversación en consola
arquitecturas/     Un programa por arquitectura
diagramas/         Diagramas Mermaid de cada arquitectura
tests/             Pruebas de criterios, fechas, citas y preguntas frecuentes
```

## Ejecución

```bash
npm install
cp .env.example .env    # agregar GOOGLE_API_KEY (gratis en https://aistudio.google.com/apikey)
npm run centralizada
npm run jerarquica
npm run descentralizada
npm test                # pruebas sin llamadas al modelo
```

Cada programa abre una conversación en consola. También acepta un mensaje directo:

```bash
node arquitecturas/centralizada.js "Quiero agendar un salto el 2026-10-12 a las 10:00, soy Ana López, ana@example.com"
```
