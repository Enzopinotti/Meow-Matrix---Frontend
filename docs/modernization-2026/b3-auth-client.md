# B3 — Auth client 2026

Estado: implementado en la autoridad `modern/`, pendiente de promoción a `main` hasta que frontend y backend pasen sus gates permanentes.

## Frontera de seguridad

La aplicación web no es autoridad de sesión. El backend crea un identificador opaco y lo entrega únicamente como cookie `HttpOnly`; el JavaScript del navegador nunca recibe, lee ni persiste ese identificador.

Reglas permanentes:

- todas las llamadas usan `credentials: include`;
- no se usa `document.cookie`, `localStorage` ni `sessionStorage` para autenticación;
- `/api/v1/auth/me` es la única fuente para reconstruir una sesión al cargar la aplicación;
- `401` significa sesión anónima/expirada;
- `503` se presenta como indisponibilidad real y no como login ficticio;
- el frontend no decide roles ni autorización server-side;
- los errores de recuperación nunca confirman si un email existe.

## Flujos incorporados

- `/login`: email/password, sesión existente, logout y manejo 401/429/503;
- `/register`: nombre, apellido, email y contraseña nueva de 12–128 caracteres;
- `/recovery`: solicitud con confirmación deliberadamente genérica;
- `/reset-password?token=...`: nueva contraseña y confirmación; el token sólo vive en la URL durante el flujo y no se persiste;
- bootstrap global mediante `AuthProvider` y `/auth/me`.

El registro no crea implícitamente una sesión porque el contrato backend B3 mantiene ambas operaciones separadas. Después del alta el usuario ingresa mediante `/login`.

## Estados explícitos

`AuthProvider` modela cuatro estados: `loading`, `anonymous`, `authenticated` y `error`. Esto evita tratar una caída de API como si el visitante simplemente no estuviera autenticado.

## Pruebas

La suite cubre:

- transporte con cookies backend-owned;
- login y navegación sin bearer token en el DTO;
- recuperación con mensaje genérico;
- rechazo local de confirmaciones de contraseña distintas;
- presentación explícita de indisponibilidad `503`;
- routing histórico todavía no migrado sin inventar datos.

El workflow permanente mantiene además un boundary check que falla si la autoridad moderna introduce almacenamiento browser-side de credenciales.

## Próximo límite

B4 puede asumir una identidad autenticada estable, pero carrito, stock, precio, totales y orden seguirán siendo autoridad server-side. Ninguna decisión de checkout debe depender de estado confiado desde React.
