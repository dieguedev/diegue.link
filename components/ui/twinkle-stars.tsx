'use client';

import { useEffect, useRef, useState } from 'react';
import StarWithStroke from '@/components/ui/star-with-stroke';

type Row = 'top' | 'bottom';

interface Sparkle {
  id: number;
  row: Row;
  x: number;
  inset: number;
  scale: number;
  rotate: number;
  delay: number;
  duration: number;
}

const INTERVAL_MS: [number, number] = [150, 450];
const DURATION_MS: [number, number] = [1333, 1933];
const FIRST_SPAWN_MS = 600;
const MAX_ALIVE = 6;

const MIN_ROW_GAP = 28;
const BALANCE: [number, number] = [25, 75];
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
      inset: isCorner(x) ? random(0, 8) : 0,
      scale: random(0.7, 1.05) * (isCorner(x) ? 1 : 0.85),
      rotate: random(-30, 30),
      delay: 0,
      duration: random(...DURATION_MS),
    };
  }
  return null;
}

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
  color?: string;
  className?: string;
}

function TwinkleStars({
  size = 45,
  color = 'var(--main)',
  className,
}: TwinkleStarsProps) {
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
      color={color}
      aria-hidden
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
