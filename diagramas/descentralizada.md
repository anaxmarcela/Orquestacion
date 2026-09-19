# Arquitectura descentralizada

No existe un supervisor. Los agentes son pares y se transfieren la conversación con `handoffs`; el agente que recibe el control responde directamente al cliente y conserva la conversación en el siguiente turno. La recepción solo clasifica la solicitud inicial.

```mermaid
flowchart LR
    U([Cliente]) <--> R[recepcion]
    R -- handoff --> F[agente_faq]
    R -- handoff --> C[agente_clima]
    R -- handoff --> A[agente_citas]
    C -- handoff si es apto --> A
    A -- handoff --> C
    F <-- handoff --> C
    F <-- handoff --> A
    F & C & A -- handoff --> R
    U <-.responde directo.-> F
    U <-.responde directo.-> C
    U <-.responde directo.-> A
    F --> T1[[buscar_faq]]
    C --> T2[[consultar_clima]]
    A --> T3[[agendar_cita / consultar_cita]]
    T2 --> OM[(Open-Meteo)]
```

Programa: [`arquitecturas/descentralizada.js`](../arquitecturas/descentralizada.js)
