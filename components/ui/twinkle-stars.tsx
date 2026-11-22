'use client';

import { useEffect, useRef, useState } from 'react';
import StarWithStroke from '@/components/ui/star-with-stroke';

/*
 * Estrellas que nacen y mueren alrededor de su contenedor, como en un cielo.
 * Cada poco tiempo (a intervalos aleatorios) nace una nueva; vive un instante,
 * crece girando y se encoge, y desaparece. Nadie va a compás.
 *
 * Nacen sobre el borde de arriba o el de abajo (los laterales chocarían con las
 * palabras vecinas). Cada nueva se coloca mirando solo las que están vivas:
 *   - en la fila con menos estrellas,
 *   - separada de las de su fila,
 *   - sin que el conjunto quede cargado hacia un lado,
 *   - sin que estén todas en las esquinas (queda demasiado perfecto).
 * Si no hay hueco válido, no nace y se vuelve a intentar en el siguiente intervalo.
 */

type Row = 'top' | 'bottom';

interface Sparkle {
  id: number;
  row: Row;
  // Posición horizontal del centro de la estrella, en % del contenedor (0-100).
  x: number;
  // Desplazamiento vertical hacia dentro, en % del contenedor.
  inset: number;
  scale: number;
  rotate: number;
  delay: number;
  duration: number;
}

// Cada cuánto nace una estrella nueva. Junto con DURATION_MS da unas 5 vivas de media.
const INTERVAL_MS: [number, number] = [150, 450];
// Cuánto vive cada estrella.
const DURATION_MS: [number, number] = [1300, 1900];
// Cuándo empieza a nacer la primera tras cargar.
const FIRST_SPAWN_MS = 600;
// Máximo de estrellas vivas a la vez.
const MAX_ALIVE = 6;

// Distancia mínima con las estrellas vivas de la misma fila.
const MIN_ROW_GAP = 28;
// Con dos o más vivas, su media horizontal debe quedar en esta franja.
const BALANCE: [number, number] = [25, 75];
// Por debajo o por encima de esto se considera esquina.
const CORNER = 20;

const random = (min: number, max: number) => min + Math.random() * (max - min);
const isCorner = (x: number) => x < CORNER || x > 100 - CORNER;

function isValidX(x: number, row: Row, alive: Sparkle[]) {
  const xs = [x, ...alive.map(s => s.x)];
  const mean = xs.reduce((sum, v) => sum + v, 0) / xs.length;

  return (
    alive.every(s => s.row !== row || Math.abs(s.x - x) >= MIN_ROW_GAP) &&
    (xs.length < 2 || (mean >= BALANCE[0] && mean <= BALANCE[1])) &&
    (xs.length < 3 || !xs.every(isCorner))
  );
}

function createSparkle(alive: Sparkle[], id: number): Sparkle | null {
  const top = alive.filter(s => s.row === 'top').length;
  const bottom = alive.length - top;
  const row: Row =
    top < bottom
      ? 'top'
      : bottom < top
        ? 'bottom'
        : Math.random() < 0.5
          ? 'top'
          : 'bottom';

  for (let i = 0; i < 30; i++) {
    const x = random(0, 100);
    if (!isValidX(x, row, alive)) continue;
    return {
      id,
      row,
      x,
      // En las esquinas pueden entrar un poco; las del centro, sobre el borde,
      // para no tapar las letras.
      inset: isCorner(x) ? random(0, 8) : 0,
      // Las del centro, algo más pequeñas: tienen menos aire alrededor.
      scale: random(0.7, 1.05) * (isCorner(x) ? 1 : 0.85),
      rotate: random(-30, 30),
      delay: 0,
      duration: random(...DURATION_MS),
    };
  }
  return null;
}

// Las primeras, fijas para que servidor y cliente pinten lo mismo. Con movimiento
// reducido son las únicas y se quedan quietas.
const INITIAL: Sparkle[] = (
  [
    ['top', 82, 100, 1700],
    ['bottom', 18, 300, 1600],
    ['top', 38, 550, 1800],
  ] as const
).map(([row, x, delay, duration], id) => ({
  id,
  row,
  x,
  inset: 0,
  scale: 1,
  rotate: 0,
  delay,
  duration,
}));

interface TwinkleStarsProps {
  size?: number;
  className?: string;
}

function TwinkleStars({ size = 45, className }: TwinkleStarsProps) {
  const [sparkles, setSparkles] = useState<Sparkle[]>(INITIAL);
  const nextId = useRef(INITIAL.length);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let timer: ReturnType<typeof setTimeout>;

    const spawn = () => {
      setSparkles(alive => {
        if (alive.length >= MAX_ALIVE) return alive;
        const sparkle = createSparkle(alive, nextId.current++);
        return sparkle ? [...alive, sparkle] : alive;
      });
      timer = setTimeout(spawn, random(...INTERVAL_MS));
    };

    timer = setTimeout(spawn, FIRST_SPAWN_MS);
    return () => clearTimeout(timer);
  }, []);

  const remove = (id: number) =>
    setSparkles(alive => alive.filter(s => s.id !== id));

  return sparkles.map(sparkle => (
    <StarWithStroke
      key={sparkle.id}
      starNumber={9}
      size={size}
      aria-hidden
      // Las dos animaciones acaban a la vez; quitarla dos veces no hace nada.
      onAnimationEnd={() => remove(sparkle.id)}
      className={`absolute pointer-events-none [translate:-50%_-50%] transition-[scale] duration-300 ease-ui group-hover:scale-125 [will-change:transform,rotate] motion-safe:animate-[star-grow_1600ms_ease-in-out_both,star-turn_1600ms_linear_both] ${className ?? ''}`}
      style={
        {
          left: `${sparkle.x}%`,
          top: `${sparkle.row === 'top' ? sparkle.inset : 100 - sparkle.inset}%`,
          animationDelay: `${sparkle.delay}ms`,
          animationDuration: `${sparkle.duration}ms`,
          '--star-scale': sparkle.scale,
          '--star-rotate': `${sparkle.rotate}deg`,
        } as React.CSSProperties
      }
    />
  ));
}

export { TwinkleStars };
