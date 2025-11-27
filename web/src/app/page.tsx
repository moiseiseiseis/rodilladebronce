// src/app/page.tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-96px)] pb-10">
      {/* Fondo degradado */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[-1] h-[420px] bg-gradient-to-br from-brand-500/20 via-accent-500/10 to-danger-500/15 blur-3xl" />

      <motion.main
        className="mx-auto flex max-w-6xl flex-col gap-10 px-3 sm:px-6"
        initial="hidden"
        animate="show"
        variants={stagger}
      >
        {/* HERO */}
        <section className="grid gap-8 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)]/90 p-6 shadow-soft backdrop-blur-md md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] md:p-10">
          {/* Texto */}
          <motion.div
            className="space-y-6"
            variants={fadeInUp}
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-500/10 px-3 py-1 text-[11px] font-medium text-brand-700">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
              Ortesis inteligente para rehabilitación de rodilla
            </span>

            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              Rehabilitación de rodilla
              <span className="block text-brand-600">
                con datos, no con intuición.
              </span>
            </h1>

            <p className="max-w-xl text-sm text-[var(--text-muted)] sm:text-base">
              SmartKnee registra cada sesión de flexo-extensión, calcula ROM,
              duración y fase de rehabilitación, y lo entrega en un panel
              clínico listo para tomar decisiones.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-2xl bg-brand-500 px-5 py-2.5 text-xs font-semibold text-white shadow-soft transition hover:bg-brand-600"
              >
                Entrar al portal clínico
                <span className="text-[13px]">↗</span>
              </Link>

              <Link
                href="#features"
                className="inline-flex items-center gap-2 rounded-2xl border border-[var(--border-subtle)] bg-white/70 px-4 py-2.5 text-xs font-medium text-slate-800 shadow-sm transition hover:border-brand-300 hover:bg-brand-50/60"
              >
                Ver cómo funciona
              </Link>

              <div className="flex items-center gap-3 text-[11px] text-[var(--text-muted)]">
                <div className="flex -space-x-2">
                  <div className="h-6 w-6 rounded-full bg-brand-500/90" />
                  <div className="h-6 w-6 rounded-full bg-accent-500/80" />
                  <div className="h-6 w-6 rounded-full bg-danger-500/80" />
                </div>
                <span>
                  Diseñado para fisioterapeutas, validado en sesiones reales.
                </span>
              </div>
            </div>
          </motion.div>

          {/* Video card */}
          <motion.div
            className="relative flex items-center justify-center"
            variants={fadeInUp}
          >
            <motion.div
              className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-brand-500/20 via-accent-500/15 to-danger-500/20 blur-xl"
              animate={{
                opacity: [0.6, 1, 0.6],
                scale: [1, 1.03, 1],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />

            <motion.div
              className="w-full max-w-sm rounded-3xl border border-brand-500/10 bg-black/95 p-3 shadow-2xl"
              animate={{
                y: [0, -6, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            >
              <div className="rounded-2xl overflow-hidden border border-white/10">
                <video
                  src="/demo_smartknee.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="h-full w-full object-cover"
                />
              </div>
              <p className="mt-3 text-[11px] text-slate-300">
                Prototipo de SmartKnee midiendo flexo-extensión de rodilla en
                tiempo real.
              </p>
            </motion.div>
          </motion.div>
        </section>

        {/* FEATURES */}
        <motion.section
          id="features"
          className="grid gap-4 md:grid-cols-3"
          variants={stagger}
        >
          <motion.article
            className="flex flex-col gap-2 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 shadow-soft"
            variants={fadeInUp}
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-700 text-sm">
              1
            </span>
            <h3 className="text-sm font-semibold text-slate-900">
              Paciente → Sesión → Fase
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Cada sesión se asocia a un paciente, ejercicio y fase de
              rehabilitación. Nada de registros sueltos: contexto clínico
              desde el primer dato.
            </p>
          </motion.article>

          <motion.article
            className="flex flex-col gap-2 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 shadow-soft"
            variants={fadeInUp}
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-accent-500/10 text-warning-500 text-sm">
              2
            </span>
            <h3 className="text-sm font-semibold text-slate-900">
              Métricas listas para decidir
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              ROM máximo, duración, tipo de sesión y notas clínicas en un
              dashboard limpio. Sigue la progresión por fases sin perderte en
              gráficas innecesarias.
            </p>
          </motion.article>

          <motion.article
            className="flex flex-col gap-2 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 shadow-soft"
            variants={fadeInUp}
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-danger-500/10 text-danger-500 text-sm">
              3
            </span>
            <h3 className="text-sm font-semibold text-slate-900">
              Pensado para tu consulta
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Funciona con tu flujo actual: busca pacientes, revisa sus
              sesiones y ajusta la rehabilitación sin tener que aprender otro
              sistema clínico gigantesco.
            </p>
          </motion.article>
        </motion.section>

        {/* Mini sección técnica */}
        <motion.section
          className="grid gap-4 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 shadow-soft md:grid-cols-3"
          variants={fadeInUp}
        >
          <div className="md:col-span-2 space-y-2">
            <h2 className="text-sm font-semibold text-slate-900">
              Integrado con tu app móvil y backend NestJS
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              El portal web se conecta directamente al backend oficial de
              SmartKnee (NestJS + Prisma + PostgreSQL). Comparte el mismo
              lenguaje que la app móvil: <code>exerciseId</code>,{" "}
              <code>phaseLabel</code>, <code>romMaxDeg</code>,{" "}
              <code>durationSecs</code> y más.
            </p>
          </div>
          <div className="flex flex-col gap-1 text-[11px] text-[var(--text-muted)]">
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-white px-3 py-2">
              <div className="font-semibold text-slate-800">
                Stack
              </div>
              <ul className="mt-1 space-y-0.5">
                <li>• Next.js 15 + TypeScript</li>
                <li>• Tailwind CSS</li>
                <li>• NestJS + Prisma + PostgreSQL</li>
                <li>• BLE + órtesis inteligente</li>
              </ul>
            </div>
          </div>
        </motion.section>
      </motion.main>
    </div>
  );
}
