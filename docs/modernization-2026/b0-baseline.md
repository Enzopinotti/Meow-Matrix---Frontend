# B0 — frozen baseline qualification

Fecha de cierre técnico: 2026-09-16.

## Autoridad histórica

Frontend: `452ca67fe3fe494ad7caa731c944d352973276d9`.

Backend emparejado: `Enzopinotti/MeowMatrix---Backend-2v`.

Backend security baseline: `73ba6f1a9b470140630d5143f258bd50742c8b0f`.

`Proyecto_Backend` comparte genealogía Git con Meow Backend y queda como ancestor/sibling histórico, no como segundo backend a modernizar.

## Matriz reproducible

Run one-shot: `35053239194`.

Se ejecutó `npm ci` sobre el SHA histórico de frontend y sobre los baselines backend con Node 20, 22 y 24.

### Frontend

- `npm ci` completó en Node 20/22/24.
- `react-scripts build` compiló en Node 20/22/24.
- el único test histórico falla en las tres versiones porque conserva la aserción default `Learn React`, texto que ya no pertenece al producto;
- el build histórico emitió aproximadamente 86.42 kB gzip de JS principal y 5.54 kB gzip de CSS principal;
- CRA arrastra deprecations de Babel proposal plugins, SVGO 1 y Workbox, entre otras;
- Node 24/npm 11 además expone warnings nuevos de APIs/install scripts del árbol legado.

Conclusión: CRA no se reemplaza porque haya dejado de construir; se reemplaza porque dejó de ser una autoridad de tooling/test/supply-chain adecuada para el producto mantenido.

### Backend

- `npm ci` y syntax checks completan en los runtimes probados;
- existen cinco archivos de test históricos;
- `npm test` no es hermético: intenta conectar Mongo durante import/setup y falla sin `MONGO_URL`;
- parte de la suite histórica también apunta al hostname Railway anterior, por lo que no puede actuar como gate de integración local confiable;
- el security baseline sí pasa su gate estático independiente.

## Deployment histórico

Los hostnames Railway embebidos en la aplicación histórica no resolvieron DNS durante la verificación 2026. Se conservan como evidencia de deployment anterior, no como autoridad pública vigente.

GitHub reporta integración de Vercel en el backend, pero un status de deployment por sí solo no demuestra que el runtime/API sea funcional. No se declarará origen de producción hasta smoke real.

## Decisión B1

- runtime 2026 inicial: **Node 24**;
- package manager inicial: **npm**, porque los dos lockfiles históricos son npm v3 y `npm ci` quedó probado; cambiar de package manager ahora no agrega valor al producto;
- frontend mantenido: `modern/`;
- backend mantenido: `modern/` en el repositorio backend;
- React se mantiene; CRA se reemplaza por Vite;
- TypeScript strict se adopta para contratos compartidos y límites de API;
- no se agregan microservicios, Kubernetes, Redis, brokers ni otras capas sin necesidad demostrada.
