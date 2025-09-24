Preuniversitario Astral — Plan (Solo Features Reales)
====================================================

Alcance
- Dashboard de estudiantes pagados (y trial como pagados). Interactivo, directo, listo para construir.

Estudiante (MVP)
- Clases en Vivo (Zoom): embed existente + RSVP, recordatorios e ICS; join desde agenda.
- Plan de Estudio por Track: plan base (Medicina/Ingeniería/Humanista), drag‑and‑drop semanal, módulos con cápsula + PDF + mini test.
- Cápsulas: video 10–15m con transcripción, descarga de guía, quiz inline (3–5 preguntas).
- Simulacros PAES: secciones cronometradas, scoring inmediato, revisión con respuestas correctas y explicación breve.
- Progreso: % completado por asignatura y actividad últimos 7 días.

Docente/Admin (MVP)
- Planificador de Clases: crear/editar/publicar sesiones de Zoom, adjuntar materiales, ver RSVPs.
- Contenidos: crear cápsulas, subir PDFs, autor quizzes; tag por asignatura/tema.
- Cohortes (básico): asistencia %, promedio simulacros, temas débiles principales.

Monetización y Acceso
- Gating: acceso si (plan de usuario ∈ `NEXT_PUBLIC_CLERK_PAID_PLANS`) OR (alguna org del usuario ∈ paidPlans) OR (plan `trial_user` activo por fecha).
- Webhooks: actualizar `users.plan` en eventos de suscripción de Clerk; mantener `paymentAttempts` (ya implementado).

Datos (Convex — mínimo)
- users { externalId, plan, role, trialEndsAt? }
- meetings { title, startTime, meetingNumber, passcode, published, createdBy }
- rsvps { meetingId, userId, status }
- courses, modules, lessons
- quizzes, questions, attempts
- attachments (en lessons y meetings)

Páginas
- `/dashboard/payment-gated/zoom` (existente) — agregar RSVP/materiales.
- `/dashboard/plan` — plan de estudio (drag‑and‑drop).
- `/dashboard/paes` — simulacros y práctica.
- `/dashboard/biblioteca` — cápsulas/guías por filtro.
- `/dashboard/progreso` — resumen de avance.

Tareas (orden de ejecución)
1) Unificar gating (UI + API) e incluir `trial_user` con expiración.
2) RSVP + ICS + adjuntos en `meetings` y UI de agenda.
3) Esquema `courses/modules/lessons` + página `/dashboard/plan` (reusar `data-table.tsx`).
4) Reproductor de cápsulas con quiz inline.
5) Simulacros PAES (attempts + scoring + revisión).
6) Dashboard de progreso básico.

Touchpoints de código
- `app/api/zoom/signature/route.ts` — lógica de acceso (paid/org/trial).
- `app/dashboard/payment-gated/page.tsx` — `Protect` (planes + trial).
- `app/dashboard/payment-gated/zoom/page.tsx` — `Protect` + agenda con RSVP/materiales.
- `app/dashboard/app-sidebar.tsx` — agregar Plan/PAES/Biblioteca/Progreso.
- `convex/schema.ts` — tablas nuevas mínimas.
- `convex/users.ts` — `trialEndsAt` + sync de plan.
- `convex/http.ts` — webhooks `subscription.*` de Clerk.
- `components/` — `StudyPlanTable`, `CapsulePlayer`, `Simulator`, `ProgressOverview`.

Entregables (esta semana)
- PR1: Gating unificado + trial + precedencia org; añadir `trialEndsAt`.
- PR2: RSVP/ICS + adjuntos + UI de agenda.
- PR3: Esqueleto de estudio (`courses/modules/lessons`) + `/dashboard/plan`.
