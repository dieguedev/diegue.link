const SHAKE_KEYFRAMES: Keyframe[] = [
  { transform: 'translateX(0)', easing: 'ease-in-out' },
  { transform: 'translateX(-4px)', easing: 'ease-in-out' },
  { transform: 'translateX(4px)', easing: 'ease-in-out' },
  { transform: 'translateX(-3px)', easing: 'ease-in-out' },
  { transform: 'translateX(3px)', easing: 'ease-in-out' },
  { transform: 'translateX(0)' },
];

const SHAKE_DURATION_MS = 280;

export function shake(element: Element) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  element.animate(SHAKE_KEYFRAMES, { duration: SHAKE_DURATION_MS });
}

export function shakeFields(form: HTMLFormElement | null, names: string[]) {
  if (!form) return;

  for (const name of names) {
    const field = form.elements.namedItem(name);
    if (field instanceof Element) shake(field);
  }
}
