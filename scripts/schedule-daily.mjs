#!/usr/bin/env node
/**
 * Scheduler diario: publica 1 artigo por dia em horario aleatorio.
 *
 * Regra:
 *  - Gera um horario aleatorio entre 07h e 22h, com minuto e segundo aleatorios
 *  - Apos cada execucao, reagenda pro proximo dia
 *  - Roda continuamente — deixe em um PM2/systemd/VPS
 *
 * Uso:
 *   node scripts/schedule-daily.mjs
 *
 * Variaveis opcionais:
 *   WINDOW_START=7   WINDOW_END=22
 */
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const GENERATE_SCRIPT = path.resolve(__dirname, 'generate-blog-post.mjs');

const START_H = +(process.env.WINDOW_START || 7);
const END_H = +(process.env.WINDOW_END || 22);

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function nextRunAt() {
  const now = new Date();
  const target = new Date(now);
  target.setHours(randomBetween(START_H, END_H - 1));
  target.setMinutes(randomBetween(0, 59));
  target.setSeconds(randomBetween(0, 59));
  target.setMilliseconds(0);

  // se ja passou o horario de hoje, marca pro dia seguinte
  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1);
  }
  return target;
}

function scheduleNext() {
  const when = nextRunAt();
  const delay = when.getTime() - Date.now();
  const fmt = when.toLocaleString('pt-BR');
  console.log(`⏰ Proximo artigo agendado para: ${fmt}`);

  setTimeout(() => {
    console.log(`\n📝 [${new Date().toLocaleString('pt-BR')}] Gerando artigo...`);
    const child = spawn('node', [GENERATE_SCRIPT], { stdio: 'inherit' });
    child.on('exit', (code) => {
      console.log(`   Artigo finalizado (exit ${code})\n`);
      scheduleNext();
    });
  }, delay);
}

console.log('🚀 Scheduler iniciado — 1 artigo por dia');
console.log(`   Janela: ${START_H}h-${END_H}h (minutos/segundos aleatorios)`);
scheduleNext();

process.on('SIGINT', () => {
  console.log('\n👋 Scheduler encerrado');
  process.exit(0);
});
