# **Arquitectura Técnica y Operativa de un Sistema de Punto de Venta Distribuido centrado en la Web**

La evolución de los sistemas de Punto de Venta (POS, por sus siglas en inglés) ha transitado de soluciones monolíticas y locales hacia ecosistemas distribuidos que exigen una interoperabilidad perfecta entre plataformas web y móviles. La construcción de un sistema POS moderno, que integre la gestión de inventarios, transacciones de venta y un sistema complejo de créditos para clientes, requiere una selección tecnológica que priorice la seguridad de tipos, la resiliencia ante fallos de conectividad y una experiencia de usuario fluida. La arquitectura propuesta, fundamentada en un núcleo de Node.js con Express y oRPC, una persistencia basada en SQLite mediante Drizzle ORM, y frontends reactivos utilizando React y React Native, establece un estándar de alto rendimiento para el comercio minorista contemporáneo.

## **El Paradigma de la Comunicación con oRPC y la Seguridad de Tipos de Extremo a Extremo**

La base de cualquier sistema distribuido es la capa de comunicación. El uso de oRPC (OpenAPI Remote Procedure Call) representa un avance significativo sobre las arquitecturas REST tradicionales, al combinar la eficiencia de las llamadas a procedimientos remotos con la estandarización de la especificación OpenAPI.1 Esta tecnología permite definir un contrato único y tipado que el servidor Express expone y que tanto la aplicación web en React como la aplicación nativa en React Native consumen de manera directa, eliminando la discrepancia de datos entre el cliente y el servidor.1  
La integración de oRPC con el ecosistema de TanStack Query es fundamental para la gestión del estado asíncrono. Al ser agnóstico al framework, oRPC facilita que las aplicaciones cliente realicen llamadas seguras que se integran nativamente con las capacidades de caché y revalidación de TanStack Query.3 Esto es crucial en un entorno de POS donde la precisión de los niveles de stock y los balances de crédito de los clientes no permite errores de interpretación de datos. El bucle de retroalimentación instantánea que proporciona oRPC asegura que cualquier cambio en la definición de un procedimiento en el backend sea detectado inmediatamente por los compiladores de TypeScript en el frontend, reduciendo drásticamente los errores en tiempo de ejecución.2

| Atributo Técnico | Implementación con oRPC | Impacto en el Proyecto POS |
| :---- | :---- | :---- |
| Contrato de API | Basado en TypeScript y OpenAPI | Sincronización garantizada entre Web y Mobile 1 |
| Integración de Cliente | TanStack Query Nativo | Gestión automática de caché y estados de carga 6 |
| Middleware | Contexto Tipado | Autorización granular por rol (Cajero, Gerente) 2 |
| Compatibilidad | Runtime Agnóstico (Node, Bun, Deno) | Flexibilidad en el despliegue del servidor 3 |
| Observabilidad | Soporte para OpenTelemetry | Monitoreo detallado de transacciones críticas 6 |

## **Persistencia de Datos con Drizzle ORM y SQLite**

La elección de SQLite como motor de base de datos para el servidor Express, gestionado a través de Drizzle ORM, responde a una necesidad de baja latencia y alta eficiencia en operaciones de lectura y escritura locales. SQLite, a diferencia de motores más pesados, ofrece una arquitectura basada en archivos que simplifica el despliegue y garantiza transacciones ACID (Atomicidad, Consistencia, Aislamiento y Durabilidad), vitales para la integridad de las ventas.7  
Drizzle ORM actúa como la "fuente de verdad" de la estructura de datos, permitiendo definir el esquema de productos, ventas y clientes utilizando código TypeScript puro.9 Esta aproximación no solo facilita las migraciones automáticas, sino que permite realizar consultas relacionales complejas con una sintaxis fluida que se traduce directamente a SQL optimizado.8 En el contexto de un sistema de créditos, donde un cliente puede tener múltiples tickets de deuda y cada ticket múltiples abonos, la capacidad de Drizzle para manejar relaciones uno-a-muchos de forma tipada es esencial para evitar la corrupción de los balances financieros.10

### **Modelado de Datos Financieros y Precisión Decimal**

Un desafío crítico en el desarrollo de un POS es la gestión de valores monetarios. Dado que SQLite no posee un tipo de dato decimal nativo que prevenga errores de redondeo de punto flotante, se deben emplear estrategias específicas mediante Drizzle ORM.13 La recomendación técnica es el uso del modo bigint para columnas de tipo blob o numeric, almacenando los valores en la unidad mínima de la moneda (por ejemplo, centavos) para garantizar precisión absoluta en los cálculos de deuda y abonos.13

| Estrategia de Columna | Tipo en Drizzle | Aplicación en el POS | Beneficio de Integridad |
| :---- | :---- | :---- | :---- |
| Balances de Crédito | blob({ mode: 'bigint' }) | Deuda total del cliente y montos de tickets | Evita errores de redondeo financiero 13 |
| Precios de Productos | numeric({ mode: 'bigint' }) | Valor unitario de venta | Precisión en cálculos de impuestos y descuentos 13 |
| Estados de Ticket | text() | 'Pendiente', 'Abonado', 'Liquidado' | Claridad semántica en la máquina de estados 14 |
| Indicadores de Pago | integer({ mode: 'boolean' }) | Flag de ticket liquidado | Conversión automática 0/1 para SQLite 13 |

## **Arquitectura del Cliente Web: Dashboard y Gestión Operativa**

La interfaz web, construida con React, TanStack Router y Tailwind CSS, funciona como el centro de mando del POS. Mientras que la aplicación móvil se enfoca en la agilidad de la venta, la web está diseñada para la gestión profunda de inventarios, el análisis de ventas y el control detallado de la cartera de clientes.

### **Enrutamiento Tipo-Seguro con TanStack Router**

La complejidad de un dashboard de POS, que requiere navegar entre listas de productos, perfiles de clientes y reportes de ventas, se gestiona mediante TanStack Router.15 Este enrutador proporciona una validación estricta de parámetros de búsqueda y rutas, lo que permite, por ejemplo, que la URL de un perfil de cliente (/clientes/123/creditos) garantice que el ID sea un número válido antes de intentar cargar los datos.16 Además, las capacidades de pre-carga (prefetching) aseguran que los datos de los tickets de crédito estén disponibles instantáneamente cuando el administrador navega a la sección de cobros, mejorando la eficiencia operativa.18

### **Interfaz de Usuario con Tailwind CSS**

Tailwind CSS permite el desarrollo de una interfaz altamente responsiva y personalizada. En un entorno de POS, la densidad de información es alta; Tailwind facilita la creación de tablas de productos compactas y formularios de abono de deuda que se adaptan a diferentes resoluciones de pantalla, desde monitores de escritorio hasta tablets en el mostrador.19 La consistencia visual se mantiene mediante el uso de utilidades estandarizadas que aceleran el ciclo de diseño y desarrollo.

## **Desarrollo Nativo: React Native y la Ventaja de Uniwind**

Para la movilidad en el piso de venta, la aplicación nativa utiliza React Native junto con Uniwind. Uniwind representa la vanguardia en el estilo de aplicaciones móviles, trayendo el motor de Tailwind CSS 4 directamente al entorno nativo con un rendimiento superior a implementaciones previas como NativeWind v4.21

### **Rendimiento y Estilización Nativa**

Uniwind se distingue por su capacidad para resolver estilos de manera mucho más rápida en dispositivos móviles, lo cual es crítico en aplicaciones de POS donde cada milisegundo cuenta durante el proceso de escaneo y pago.23 Al integrarse con el bundler Metro, Uniwind permite utilizar las mismas clases de utilidad de Tailwind que en la web, pero optimizadas para los componentes nativos de iOS y Android.21 Esto reduce la carga cognitiva para los desarrolladores, quienes pueden aplicar conceptos de diseño consistentes en ambas plataformas.

| Métrica de Rendimiento | Uniwind (v4) | NativeWind (v4) | Interpretación |
| :---- | :---- | :---- | :---- |
| Tiempo de Resolución (iOS) | \~81.36ms | \~197.22ms | Uniwind es más del doble de rápido 23 |
| Tiempo de Resolución (Android) | \~94.14ms | \~226.66ms | Mayor fluidez en dispositivos de gama media 23 |
| Compatibilidad CSS | Tailwind 4 Nativo | Tailwind 3/4 Bridge | Uniwind usa el motor más reciente 21 |

## **Lógica de Negocio: Gestión de Productos, Ventas y Créditos**

El núcleo funcional del proyecto se divide en tres dominios interconectados que deben mantener una sincronización perfecta para garantizar la viabilidad del negocio.

### **Dominio de Productos y Ventas**

Cada transacción de venta es el disparador de múltiples acciones en el sistema. Al registrarse una venta, el servidor Express, a través de oRPC, debe validar el stock disponible en la base de datos SQLite antes de confirmar la operación. La integración de Drizzle ORM permite realizar estas validaciones dentro de transacciones SQL, asegurando que si la actualización del stock falla, la venta no se registre, evitando así inconsistencias en el inventario.8

### **El Sistema de Créditos: Creación y Asignación de Tickets**

La característica distintiva de este proyecto es la gestión de créditos. Cuando un cliente adquiere productos bajo esta modalidad, el sistema no genera un recibo de pago inmediato, sino un "ticket de deuda" vinculado a su perfil.14 Este ticket representa una obligación financiera que debe ser rastreada a través de una máquina de estados clara.

1. **Estado Inicial (Pendiente/Nuevo):** El ticket se crea con el monto total de la venta y se asigna al cliente. El balance de deuda del cliente aumenta automáticamente.14  
2. **Estado de Abono (Parcial):** El cliente realiza un pago que no cubre la totalidad de la deuda. El sistema registra un nuevo registro en la tabla de pagos, calcula el saldo restante y cambia el estado del ticket a "Abonado" o "Parcial".25  
3. **Estado Final (Liquidado/Pagado):** Una vez que la suma de los abonos iguala el monto original del ticket, el estado cambia a "Liquidado" y el ticket deja de sumar al balance de deuda activa del cliente.14

## **Máquina de Estados para la Gestión de Tickets de Deuda**

La fiabilidad del sistema de créditos depende de una transición controlada entre los estados de los tickets. Utilizar una máquina de estados evita que un ticket pase de "Pagado" a "Pendiente" sin una justificación contable (como una devolución), y proporciona una auditoría clara de la vida financiera de cada transacción.27

| Acción del Usuario | Estado Origen | Estado Destino | Lógica de Transición |
| :---- | :---- | :---- | :---- |
| Creación de Venta a Crédito | N/A | Pendiente | Se genera el ticket con saldo total 14 |
| Registro de Pago Parcial (Abono) | Pendiente | Parcial | Saldo \> 0; se registra el abono 26 |
| Pago de Saldo Restante | Parcial | Liquidado | Saldo \== 0; el ticket se cierra 14 |
| Pago Total Único | Pendiente | Liquidado | Saldo \== 0; transición directa 29 |
| Devolución de Mercancía | Parcial/Pendiente | Cancelado | Se revierte la deuda y el stock 30 |

Esta lógica debe implementarse en el servidor para que cualquier cliente (Web o Nativo) que invoque la acción de "abonar" a través de oRPC desencadene las mismas reglas de validación y cambios de estado. La coherencia de la máquina de estados en el backend garantiza que los reportes de cobranza sean idénticos sin importar desde qué dispositivo se consulten.14

## **Resiliencia y Sincronización: Estrategias Offline-First**

Un sistema POS no puede permitirse dejar de funcionar si se pierde la conexión a internet. La arquitectura propuesta utiliza las capacidades de persistencia de TanStack Query para ofrecer una experiencia "Offline-First" en la aplicación nativa.32

### **Persistencia del Caché con AsyncStorage**

En la aplicación de React Native, TanStack Query se configura con un "persister" que utiliza AsyncStorage para guardar el estado de las consultas y mutaciones en el almacenamiento local del dispositivo.34 Esto permite que, si el vendedor está en una zona sin cobertura, pueda seguir consultando el catálogo de productos y los saldos de los clientes, ya que los datos se sirven desde el caché local.36

### **Gestión de Mutaciones en Cola**

Cuando se realiza una venta o un abono de crédito sin conexión, TanStack Query encola la mutación. Una vez que se detecta que la conexión ha regresado, el sistema intenta sincronizar estas acciones con el servidor Express.33 Esta sincronización asíncrona es vital para que las operaciones comerciales no se detengan, aunque requiere una lógica de resolución de conflictos en el servidor para manejar casos donde los datos podrían haber cambiado en el interín (por ejemplo, si el stock de un producto se agotó por una venta realizada desde otro terminal web).33

## **Consideraciones de Seguridad y Auditoría Contable**

La naturaleza financiera de un POS exige niveles de seguridad rigurosos. oRPC permite implementar middlewares de autenticación que validan cada petición, asegurando que solo los usuarios autorizados puedan realizar acciones sensibles como liquidar deudas o modificar precios de productos.2  
Además, el uso de Drizzle ORM facilita la implementación de "soft deletes" y registros de auditoría (audit logs). En lugar de eliminar físicamente un ticket o un abono, el sistema los marca como inactivos, manteniendo una traza histórica de quién realizó cada operación y en qué momento.10 Esto es esencial para las conciliaciones bancarias y para la resolución de disputas con clientes sobre sus estados de cuenta de crédito.

## **Conclusión sobre la Viabilidad de la Arquitectura Propuesta**

La combinación de React, React Native, oRPC y Drizzle ORM sobre SQLite conforma una infraestructura tecnológica robusta y moderna para un sistema POS de nueva generación. La centralización de la lógica en un servidor Express con seguridad de tipos garantiza que la gestión de productos, ventas y, fundamentalmente, el complejo ciclo de créditos y abonos de clientes, se realice con la máxima precisión y eficiencia.  
La adopción de herramientas como TanStack Router para la web y Uniwind para el entorno nativo asegura no solo una velocidad de desarrollo acelerada, sino también un rendimiento excepcional en la interfaz de usuario. En última instancia, la capacidad de este sistema para operar de manera offline y sincronizar deudas de manera confiable lo posiciona como una solución competitiva capaz de adaptarse a las demandas dinámicas del mercado minorista actual. La máquina de estados definida para los tickets de crédito proporciona la claridad operativa necesaria para que tanto los dueños de negocios como sus clientes mantengan una relación financiera transparente y eficiente.

#### **Obras citadas**

1. Getting Started \- oRPC, fecha de acceso: febrero 3, 2026, [https://orpc.dev/docs/getting-started](https://orpc.dev/docs/getting-started)  
2. tRPC vs oRPC: Which is better for your next TypeScript project, and ..., fecha de acceso: febrero 3, 2026, [https://blog.logrocket.com/trpc-vs-orpc-type-safe-rpc/](https://blog.logrocket.com/trpc-vs-orpc-type-safe-rpc/)  
3. Announcing oRPC v1 \- Typesafe APIs Made Simple (Alternative to ..., fecha de acceso: febrero 3, 2026, [https://www.reddit.com/r/nextjs/comments/1k2vd9p/announcing\_orpc\_v1\_typesafe\_apis\_made\_simple/](https://www.reddit.com/r/nextjs/comments/1k2vd9p/announcing_orpc_v1_typesafe_apis_made_simple/)  
4. Tanstack Query Integration For React \- oRPC, fecha de acceso: febrero 3, 2026, [https://orpc.dev/docs/integrations/tanstack-query-old/react](https://orpc.dev/docs/integrations/tanstack-query-old/react)  
5. Typesafe APIs Made Simple with oRPC | Zuplo Blog, fecha de acceso: febrero 3, 2026, [https://zuplo.com/blog/typesafe-apis-made-simple-with-orpc](https://zuplo.com/blog/typesafe-apis-made-simple-with-orpc)  
6. oRPC \- Best of JS, fecha de acceso: febrero 3, 2026, [https://bestofjs.org/projects/orpc](https://bestofjs.org/projects/orpc)  
7. Use Drizzle ORM with Bun, fecha de acceso: febrero 3, 2026, [https://bun.com/docs/guides/ecosystem/drizzle](https://bun.com/docs/guides/ecosystem/drizzle)  
8. SQLite Operations with Drizzle ORM Integration \- w3resource, fecha de acceso: febrero 3, 2026, [https://www.w3resource.com/sqlite/snippets/simplify-sqlite-with-drizzle-orm.php](https://www.w3resource.com/sqlite/snippets/simplify-sqlite-with-drizzle-orm.php)  
9. drizzle-orm-sqlite CDN by jsDelivr \- A CDN for npm and GitHub, fecha de acceso: febrero 3, 2026, [https://www.jsdelivr.com/package/npm/drizzle-orm-sqlite](https://www.jsdelivr.com/package/npm/drizzle-orm-sqlite)  
10. SQLite \- Drizzle ORM, fecha de acceso: febrero 3, 2026, [https://orm.drizzle.team/docs/get-started-sqlite](https://orm.drizzle.team/docs/get-started-sqlite)  
11. Getting Started with Drizzle ORM | Better Stack Community, fecha de acceso: febrero 3, 2026, [https://betterstack.com/community/guides/scaling-nodejs/drizzle-orm/](https://betterstack.com/community/guides/scaling-nodejs/drizzle-orm/)  
12. Drizzle ORM: Infer type of schema including the relations, fecha de acceso: febrero 3, 2026, [https://stackoverflow.com/questions/76840558/drizzle-orm-infer-type-of-schema-including-the-relations](https://stackoverflow.com/questions/76840558/drizzle-orm-infer-type-of-schema-including-the-relations)  
13. SQLite column types \- Drizzle ORM, fecha de acceso: febrero 3, 2026, [https://orm.drizzle.team/docs/column-types/sqlite](https://orm.drizzle.team/docs/column-types/sqlite)  
14. Ticket States — Znuny documentation, fecha de acceso: febrero 3, 2026, [https://doc.znuny.org/znuny/concepts/states/index.html](https://doc.znuny.org/znuny/concepts/states/index.html)  
15. Meet TanStack Router: A Modern, Fully Type-Safe Router for React, fecha de acceso: febrero 3, 2026, [https://medium.com/@an.chmelev/meet-tanstack-router-a-modern-fully-type-safe-router-for-react-b0687c152bdb](https://medium.com/@an.chmelev/meet-tanstack-router-a-modern-fully-type-safe-router-for-react-b0687c152bdb)  
16. TanStack Router Full Course (With Common Patterns & Best ..., fecha de acceso: febrero 3, 2026, [https://www.youtube.com/watch?v=fpXOT8SNTpY](https://www.youtube.com/watch?v=fpXOT8SNTpY)  
17. Overview | TanStack Router React Docs, fecha de acceso: febrero 3, 2026, [https://tanstack.com/router/latest/docs](https://tanstack.com/router/latest/docs)  
18. Tips from 8 months of TanStack/Router in production | Swizec Teller, fecha de acceso: febrero 3, 2026, [https://swizec.com/blog/tips-from-8-months-of-tan-stack-router-in-production/](https://swizec.com/blog/tips-from-8-months-of-tan-stack-router-in-production/)  
19. The Case of NativeWind \- Shadi F, fecha de acceso: febrero 3, 2026, [https://iamshadi.medium.com/the-case-of-nativewind-369032891608](https://iamshadi.medium.com/the-case-of-nativewind-369032891608)  
20. Nativewind, fecha de acceso: febrero 3, 2026, [https://www.nativewind.dev/](https://www.nativewind.dev/)  
21. Quickstart \- Uniwind, fecha de acceso: febrero 3, 2026, [https://docs.uniwind.dev/quickstart](https://docs.uniwind.dev/quickstart)  
22. GitHub \- uni-stack/uniwind: From the creators of Unistyles, fecha de acceso: febrero 3, 2026, [https://github.com/uni-stack/uniwind](https://github.com/uni-stack/uniwind)  
23. uni-stack/uniwind-benchmarks \- GitHub, fecha de acceso: febrero 3, 2026, [https://github.com/uni-stack/uniwind-benchmarks](https://github.com/uni-stack/uniwind-benchmarks)  
24. Setting Up Tailwind CSS in React Native Expo with NativeWind | by ..., fecha de acceso: febrero 3, 2026, [https://medium.com/@CodeCraftMobile/complete-guide-setting-up-tailwind-css-in-react-native-expo-with-nativewind-4d0fcd3f57c7](https://medium.com/@CodeCraftMobile/complete-guide-setting-up-tailwind-css-in-react-native-expo-with-nativewind-4d0fcd3f57c7)  
25. Completing sales in the Partial Payments report, fecha de acceso: febrero 3, 2026, [https://retail-support.lightspeedhq.com/hc/en-us/articles/360010901473-Completing-sales-in-the-Partial-Payments-report](https://retail-support.lightspeedhq.com/hc/en-us/articles/360010901473-Completing-sales-in-the-Partial-Payments-report)  
26. How to Split Payment with Loyverse POS, fecha de acceso: febrero 3, 2026, [https://help.loyverse.com/help/payment-loyvers](https://help.loyverse.com/help/payment-loyvers)  
27. State machines | Model your business structure, fecha de acceso: febrero 3, 2026, [https://docs.commercetools.com/learning-model-your-business-structure/state-machines/state-machines-page](https://docs.commercetools.com/learning-model-your-business-structure/state-machines/state-machines-page)  
28. Saga Pattern for Resilient Flight Booking Workflows \- DZone, fecha de acceso: febrero 3, 2026, [https://dzone.com/articles/saga-state-machine-flight-booking](https://dzone.com/articles/saga-state-machine-flight-booking)  
29. Understanding Statemachines, Part 3: Conditional Logic \- 8th Light, fecha de acceso: febrero 3, 2026, [https://8thlight.com/insights/understanding-statemachines-part-3-conditional-logic](https://8thlight.com/insights/understanding-statemachines-part-3-conditional-logic)  
30. Payment Transaction Response Codes \- Worldpay Support, fecha de acceso: febrero 3, 2026, [http://support.worldpay.com/support/CNP-API/content/paytransrespcodes.htm](http://support.worldpay.com/support/CNP-API/content/paytransrespcodes.htm)  
31. Credit state machine \- HCL Product Documentation, fecha de acceso: febrero 3, 2026, [https://help.hcl-software.com/commerce/8.0.0/payments.events/refs/rppppccredstate.html](https://help.hcl-software.com/commerce/8.0.0/payments.events/refs/rppppccredstate.html)  
32. Building an Offline-First Production-Ready Expo App with Drizzle ..., fecha de acceso: febrero 3, 2026, [https://medium.com/@detl/building-an-offline-first-production-ready-expo-app-with-drizzle-orm-and-sqlite-f156968547a2](https://medium.com/@detl/building-an-offline-first-production-ready-expo-app-with-drizzle-orm-and-sqlite-f156968547a2)  
33. Building Offline-First Apps using React Native, React Query, and ..., fecha de acceso: febrero 3, 2026, [https://dev.to/msaadullah/building-offline-first-apps-using-react-native-react-query-and-asyncstorage-1h4i](https://dev.to/msaadullah/building-offline-first-apps-using-react-native-react-query-and-asyncstorage-1h4i)  
34. Building Offline-First React Native Apps with React Query and ..., fecha de acceso: febrero 3, 2026, [https://www.whitespectre.com/ideas/how-to-build-offline-first-react-native-apps-with-react-query-and-typescript/](https://www.whitespectre.com/ideas/how-to-build-offline-first-react-native-apps-with-react-query-and-typescript/)  
35. createAsyncStoragePersister | TanStack Query React Docs, fecha de acceso: febrero 3, 2026, [https://tanstack.com/query/v5/docs/react/plugins/createAsyncStoragePersister](https://tanstack.com/query/v5/docs/react/plugins/createAsyncStoragePersister)  
36. Persistent state management using Async Storage \+ React Query for ..., fecha de acceso: febrero 3, 2026, [https://mateoguzmana.medium.com/persistent-state-management-using-async-storage-react-query-for-simple-react-native-apps-9206db073f4a](https://mateoguzmana.medium.com/persistent-state-management-using-async-storage-react-query-for-simple-react-native-apps-9206db073f4a)  
37. React Native Offline First with TanStack Query \- DEV Community, fecha de acceso: febrero 3, 2026, [https://dev.to/fedorish/react-native-offline-first-with-tanstack-query-1pe5](https://dev.to/fedorish/react-native-offline-first-with-tanstack-query-1pe5)