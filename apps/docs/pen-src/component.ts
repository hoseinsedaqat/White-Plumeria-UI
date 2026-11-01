export const penComponents = ['button', 'badge', 'alert', 'card', 'switch', 'input'] as const;

export type PenComponent = (typeof penComponents)[number];

export function readPenComponent(): PenComponent {
  const asked = new URLSearchParams(location.search).get('component');
  const found = penComponents.find((item) => item === asked);
  return found ?? 'button';
}
