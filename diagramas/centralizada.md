# Arquitectura centralizada

Un supervisor único recibe todos los mensajes y usa a cada especialista como herramienta (`asTool`). Los especialistas no se comunican entre sí; el supervisor decide el orden (clima antes de cita) y redacta la respuesta final.

```mermaid
flowchart TD
    U([Cliente]) <--> S[supervisor]
    S -- asTool --> F[agente_faq]
    S -- asTool --> C[agente_clima]
    S -- asTool --> A[agente_citas]
    F --> T1[[buscar_faq]]
    C --> T2[[consultar_clima]]
    A --> T3[[agendar_cita]]
    A --> T4[[consultar_cita]]
    T2 --> OM[(Open-Meteo)]
    T3 -. verifica clima .-> OM
```

Programa: [`arquitecturas/centralizada.js`](../arquitecturas/centralizada.js)
