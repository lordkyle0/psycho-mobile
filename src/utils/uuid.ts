const HEX = '0123456789abcdef';
const VARIANT = '89ab';

/** Identifiant aléatoire au format UUID v4 (suffisant pour des clés locales). */
export function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c =>
    c === 'x'
      ? HEX[Math.floor(Math.random() * 16)]
      : VARIANT[Math.floor(Math.random() * 4)],
  );
}
