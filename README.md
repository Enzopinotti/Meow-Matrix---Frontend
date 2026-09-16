# Meow Matrix — frontend

Este repositorio preserva dos etapas del mismo producto.

## 2024 — versión histórica

El árbol raíz `src/` + `public/` corresponde al frontend React/CRA entregado en 2024. El baseline exacto de esa etapa es:

```text
452ca67fe3fe494ad7caa731c944d352973276d9
```

Ese SHA sigue siendo la autoridad de rollback y evidencia histórica. No se reescribe para fingir que el proyecto nació con prácticas de 2026.

## 2026 — autoridad mantenida

La reconstrucción mantenida vive en `modern/`.

Objetivos de esta primera foundation:

- Node 24 + npm como runtime/package-manager explícitos;
- React + Vite + TypeScript strict;
- API origin centralizado y validado;
- requests cross-origin con `credentials: include`;
- ninguna credencial de auth legible/escribible desde JavaScript;
- routing y estados honestos mientras los flujos históricos se migran por contratos;
- tests, lint, format, typecheck y build como gate de CI.

No se afirma todavía que catálogo, auth, carrito, checkout, perfil o administración estén migrados. Cada flujo se promoverá cuando su contrato backend esté tipado y probado.

Documentación de baseline: `docs/modernization-2026/b0-baseline.md`.
