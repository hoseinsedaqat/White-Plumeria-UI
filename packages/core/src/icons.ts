export const iconPaths = {
  check: 'M5 12.5 9.2 16.8 19 7.2',
  close: 'M7 7l10 10M17 7 7 17',
  chevronDown: 'M6.5 9.5 12 15l5.5-5.5',
  chevronRight: 'M9 6.5 14.5 12 9 17.5',
  chevronLeft: 'M15 6.5 9.5 12 15 17.5',
  search: 'M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14zM16.5 16.5 20.5 20.5',
  menu: 'M4 7h16M4 12h16M4 17h16',
  sun: 'M12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zM12 2.5v2M12 19.5v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2.5 12h2M19.5 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  moon: 'M16.5 14.2A6.5 6.5 0 0 1 9.8 5.5 6.5 6.5 0 1 0 16.5 14.2z',
  info: 'M12 16.5v-5M12 8h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
  alert: 'M12 9v4M12 17h.01M10.3 4.8 2.8 18a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L13.7 4.8a2 2 0 0 0-3.4 0z',
  success: 'M20 7 10 17l-4-4',
  calendar: 'M7 3v3M17 3v3M4 9h16M6 5h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z',
  upload: 'M12 16V6M8 9.5 12 5.5l4 4M5 19h14',
  copy: 'M9 9h10v10H9zM5 15V5h10',
  github:
    'M9 19c-4 1.5-4-2-6-2m12 4v-3.2a2.7 2.7 0 0 0-.8-2.1c2.8-.3 5.8-1.4 5.8-6.2a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1-.3-3.3 1.2a11.3 11.3 0 0 0-6 0C6.4 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.8 3 5.9 5.8 6.2a2.7 2.7 0 0 0-.8 2.1V21',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  arrowRight: 'M5 12h14M13 6l6 6-6 6',
  external: 'M14 5h5v5M19 5 10 14M9 6H6v12h12v-3',
} as const;

export type IconName = keyof typeof iconPaths;

export const directionalIcons = new Set<IconName>(['chevronRight', 'chevronLeft', 'arrowRight', 'external']);
