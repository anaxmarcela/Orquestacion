# Arquitectura jerárquica

Tres niveles: el gerente general delega en coordinadores de área y cada coordinador delega en sus especialistas. Cada nivel usa al inferior como herramienta (`asTool`). El coordinador de reservas aplica la regla de negocio: consultar el clima antes de agendar.

```mermaid
flowchart TD
    U([Cliente]) <--> G[gerente_general]
    G -- asTool --> CA[coordinador_atencion]
    G -- asTool --> CR[coordinador_reservas]
    CA -- asTool --> F[agente_faq]
    CR -- asTool --> C[agente_clima]
    CR -- asTool --> A[agente_citas]
    F --> T1[[buscar_faq]]
    C --> T2[[consultar_clima]]
    A --> T3[[agendar_cita]]
    A --> T4[[consultar_cita]]
    T2 --> OM[(Open-Meteo)]
    T3 -. verifica clima .-> OM
```

Programa: [`arquitecturas/jerarquica.js`](../arquitecturas/jerarquica.js)
