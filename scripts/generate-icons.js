/* eslint-env node */
/**
 * Génère les icônes Android depuis une seule définition du logo, sans dépendance.
 * Usage : npm run icons
 *
 * Le dessin utilise le repère 108 × 108 des icônes adaptatives : seul le cercle central
 * de 66 de diamètre est garanti visible, quel que soit le masque du lanceur.
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const ROOT = path.resolve(__dirname, '..');
const RES = path.join(ROOT, 'android/app/src/main/res');
const BRAND = path.join(ROOT, 'assets/brand');

const GOLD_TOP = '#F0CE8E';
const GOLD_BOTTOM = '#B88A44';
const NIGHT_CENTER = '#3A2F21';
const NIGHT_EDGE = '#14120F';

const GOLD_RANGE = { y0: 24, y1: 84 };
const NIGHT_RANGE = { cx: 54, cy: 44, r: 78 };

const CENTER = 54;
const RING_RADIUS = 28;
const SUN_ANGLE = -45;
const SUN_GAP = 17;

const round = n => Number(n.toFixed(3));

function polar(radius, degrees) {
  const a = (degrees * Math.PI) / 180;
  return [CENTER + radius * Math.cos(a), CENTER + radius * Math.sin(a)];
}

/** Arc découpé en cubiques de 90° au plus, pour ne manipuler que M, H, V et C. */
function arc(radius, from, to) {
  const steps = Math.ceil(Math.abs(to - from) / 90);
  const delta = (to - from) / steps;
  const k = (4 / 3) * Math.tan((delta * Math.PI) / 720) * radius;
  let d = `M${polar(radius, from).map(round).join(' ')}`;
  for (let i = 0; i < steps; i++) {
    const a0 = ((from + i * delta) * Math.PI) / 180;
    const a1 = ((from + (i + 1) * delta) * Math.PI) / 180;
    const [x0, y0] = polar(radius, from + i * delta);
    const [x1, y1] = polar(radius, from + (i + 1) * delta);
    const points = [
      x0 - k * Math.sin(a0),
      y0 + k * Math.cos(a0),
      x1 + k * Math.sin(a1),
      y1 - k * Math.cos(a1),
      x1,
      y1,
    ];
    d += ` C${points.map(round).join(' ')}`;
  }
  return d;
}

const PSI_WIDTH = 4.6;
const PSI = [
  {
    d: 'M41 39 V46 C41 53.5 46.8 59 54 59 C61.2 59 67 53.5 67 46 V39',
    width: PSI_WIDTH,
  },
  { d: 'M54 34.5 V73', width: PSI_WIDTH },
  { d: 'M48.5 73 H59.5', width: PSI_WIDTH },
];

const [sunX, sunY] = polar(RING_RADIUS, SUN_ANGLE);

/** Le Ψ dans l'anneau d'avancement, parcouru par le soleil des rituels matin et soir. */
const LOGO = [
  {
    d: arc(RING_RADIUS, SUN_ANGLE + SUN_GAP, SUN_ANGLE + 360 - SUN_GAP),
    width: 2.6,
  },
  { d: `M${round(sunX)} ${round(sunY)} H${round(sunX + 0.01)}`, width: 7.6 },
  ...PSI,
];

function flatten(d) {
  const tokens = d.match(/[MHVC]|-?\d+(?:\.\d+)?/g);
  const segments = [];
  let x = 0;
  let y = 0;
  let i = 0;
  const num = () => Number(tokens[i++]);
  const lineTo = (nx, ny) => {
    segments.push([x, y, nx, ny]);
    x = nx;
    y = ny;
  };
  while (i < tokens.length) {
    const command = tokens[i++];
    if (command === 'M') {
      x = num();
      y = num();
    } else if (command === 'H') {
      lineTo(num(), y);
    } else if (command === 'V') {
      lineTo(x, num());
    } else {
      const [x0, y0] = [x, y];
      const [x1, y1, x2, y2, x3, y3] = Array.from({ length: 6 }, num);
      for (let step = 1; step <= 24; step++) {
        const t = step / 24;
        const u = 1 - t;
        lineTo(
          u * u * u * x0 +
            3 * u * u * t * x1 +
            3 * u * t * t * x2 +
            t * t * t * x3,
          u * u * u * y0 +
            3 * u * u * t * y1 +
            3 * u * t * t * y2 +
            t * t * t * y3,
        );
      }
    }
  }
  return segments;
}

function distanceToSegment(px, py, [x0, y0, x1, y1]) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const lengthSq = dx * dx + dy * dy;
  const t = lengthSq
    ? Math.min(1, Math.max(0, ((px - x0) * dx + (py - y0) * dy) / lengthSq))
    : 0;
  return Math.hypot(px - x0 - t * dx, py - y0 - t * dy);
}

const clamp01 = n => Math.min(1, Math.max(0, n));

const hexToRgb = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));

const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);

function goldAt(y) {
  const t = clamp01((y - GOLD_RANGE.y0) / (GOLD_RANGE.y1 - GOLD_RANGE.y0));
  return mix(hexToRgb(GOLD_TOP), hexToRgb(GOLD_BOTTOM), t);
}

function nightAt(x, y) {
  const distance = Math.hypot(x - NIGHT_RANGE.cx, y - NIGHT_RANGE.cy);
  const t = clamp01(distance / NIGHT_RANGE.r);
  return mix(hexToRgb(NIGHT_CENTER), hexToRgb(NIGHT_EDGE), t);
}

const STROKES = LOGO.map(({ d, width }) => ({
  width,
  segments: flatten(d),
}));

function coverage(x, y, pixel) {
  let best = 0;
  for (const { segments, width } of STROKES) {
    let distance = Infinity;
    for (const segment of segments) {
      distance = Math.min(distance, distanceToSegment(x, y, segment));
    }
    best = Math.max(best, clamp01((width / 2 - distance) / pixel + 0.5));
  }
  return best;
}

const MASK_HALF = 23 / 48;
const MASK_RADIUS = 5 / 48;

const circleMask = (x, y, pixel) =>
  clamp01((MASK_HALF - Math.hypot(x, y)) / pixel + 0.5);

function roundedSquareMask(x, y, pixel) {
  const qx = Math.abs(x) - MASK_HALF + MASK_RADIUS;
  const qy = Math.abs(y) - MASK_HALF + MASK_RADIUS;
  const outside = Math.hypot(Math.max(qx, 0), Math.max(qy, 0));
  const signed = outside + Math.min(Math.max(qx, qy), 0) - MASK_RADIUS;
  return clamp01(-signed / pixel + 0.5);
}

const opaqueMask = () => 1;

/** Rendu de la fenêtre 72 × 72 centrée, celle que montre un lanceur. */
function render(size, mask) {
  const rgba = Buffer.alloc(size * size * 4);
  const pixel = 72 / size;
  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      const alpha = mask(
        (px + 0.5) / size - 0.5,
        (py + 0.5) / size - 0.5,
        1 / size,
      );
      if (alpha === 0) continue;
      const x = 18 + (px + 0.5) * pixel;
      const y = 18 + (py + 0.5) * pixel;
      const color = mix(nightAt(x, y), goldAt(y), coverage(x, y, pixel));
      rgba.set(
        [...color.map(Math.round), Math.round(alpha * 255)],
        (py * size + px) * 4,
      );
    }
  }
  return rgba;
}

function encodePng(size, rgba) {
  const stride = size * 4;
  const raw = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y++) {
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  const chunk = (type, data) => {
    const body = Buffer.concat([Buffer.from(type, 'latin1'), data]);
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(zlib.crc32(body));
    return Buffer.concat([length, body, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr.set([8, 6, 0, 0, 0], 8);
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function write(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

// Lanceurs Android 7 : les versions 8+ utilisent l'icône adaptative vectorielle.
const DENSITIES = { mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 };

for (const [density, size] of Object.entries(DENSITIES)) {
  const folder = path.join(RES, `mipmap-${density}`);
  write(
    path.join(folder, 'ic_launcher.png'),
    encodePng(size, render(size, roundedSquareMask)),
  );
  write(
    path.join(folder, 'ic_launcher_round.png'),
    encodePng(size, render(size, circleMask)),
  );
}

const vectorOpen = (size, { gradient = false } = {}) => `<vector
    xmlns:android="http://schemas.android.com/apk/res/android"${
      gradient ? '\n    xmlns:aapt="http://schemas.android.com/aapt"' : ''
    }
    android:width="${size}dp"
    android:height="${size}dp"
    android:viewportWidth="${size}"
    android:viewportHeight="${size}">`;

const goldPath = ({ d, width }) => `    <path
        android:pathData="${d}"
        android:strokeWidth="${width}"
        android:strokeLineCap="round"
        android:strokeLineJoin="round"
        android:fillColor="#00000000">
        <aapt:attr name="android:strokeColor">
            <gradient
                android:type="linear"
                android:startX="${CENTER}"
                android:startY="${GOLD_RANGE.y0}"
                android:endX="${CENTER}"
                android:endY="${GOLD_RANGE.y1}">
                <item android:offset="0" android:color="${GOLD_TOP}" />
                <item android:offset="1" android:color="${GOLD_BOTTOM}" />
            </gradient>
        </aapt:attr>
    </path>`;

const whitePath = ({ d, width }) => `    <path
        android:pathData="${d}"
        android:strokeWidth="${width}"
        android:strokeColor="#FFFFFFFF"
        android:strokeLineCap="round"
        android:strokeLineJoin="round"
        android:fillColor="#00000000" />`;

const DRAWABLE = path.join(RES, 'drawable');

write(
  path.join(DRAWABLE, 'ic_launcher_foreground.xml'),
  `${vectorOpen(108, { gradient: true })}
${LOGO.map(goldPath).join('\n')}
</vector>
`,
);

write(
  path.join(DRAWABLE, 'ic_launcher_background.xml'),
  `${vectorOpen(108, { gradient: true })}
    <path android:pathData="M0 0 H108 V108 H0 Z">
        <aapt:attr name="android:fillColor">
            <gradient
                android:type="radial"
                android:centerX="${NIGHT_RANGE.cx}"
                android:centerY="${NIGHT_RANGE.cy}"
                android:gradientRadius="${NIGHT_RANGE.r}">
                <item android:offset="0" android:color="${NIGHT_CENTER}" />
                <item android:offset="1" android:color="${NIGHT_EDGE}" />
            </gradient>
        </aapt:attr>
    </path>
</vector>
`,
);

write(
  path.join(DRAWABLE, 'ic_launcher_monochrome.xml'),
  `${vectorOpen(108)}
${LOGO.map(whitePath).join('\n')}
</vector>
`,
);

// Barre d'état : le Ψ seul, l'anneau et le soleil seraient illisibles à 24 dp.
const STAT_SCALE = 0.5;
const PSI_CENTER_Y = 53.75;
write(
  path.join(DRAWABLE, 'ic_stat_psycho.xml'),
  `${vectorOpen(24)}
    <group
        android:translateX="${round(12 - CENTER * STAT_SCALE)}"
        android:translateY="${round(12 - PSI_CENTER_Y * STAT_SCALE)}"
        android:scaleX="${STAT_SCALE}"
        android:scaleY="${STAT_SCALE}">
${PSI.map(whitePath).join('\n').replace(/^/gm, '    ')}
    </group>
</vector>
`,
);

const adaptiveIcon = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@drawable/ic_launcher_background" />
    <foreground android:drawable="@drawable/ic_launcher_foreground" />
    <monochrome android:drawable="@drawable/ic_launcher_monochrome" />
</adaptive-icon>
`;
write(path.join(RES, 'mipmap-anydpi-v26/ic_launcher.xml'), adaptiveIcon);
write(path.join(RES, 'mipmap-anydpi-v26/ic_launcher_round.xml'), adaptiveIcon);

// Fiche Play Store : carré plein, Google applique lui-même l'arrondi.
write(
  path.join(BRAND, 'play-store-icon-512.png'),
  encodePng(512, render(512, opaqueMask)),
);

write(
  path.join(BRAND, 'psycho-logo.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="18 18 72 72" role="img" aria-label="Psycho">
  <defs>
    <linearGradient id="gold" gradientUnits="userSpaceOnUse" x1="${CENTER}" y1="${
    GOLD_RANGE.y0
  }" x2="${CENTER}" y2="${GOLD_RANGE.y1}">
      <stop offset="0" stop-color="${GOLD_TOP}" />
      <stop offset="1" stop-color="${GOLD_BOTTOM}" />
    </linearGradient>
    <radialGradient id="night" gradientUnits="userSpaceOnUse" cx="${
      NIGHT_RANGE.cx
    }" cy="${NIGHT_RANGE.cy}" r="${NIGHT_RANGE.r}">
      <stop offset="0" stop-color="${NIGHT_CENTER}" />
      <stop offset="1" stop-color="${NIGHT_EDGE}" />
    </radialGradient>
  </defs>
  <rect x="18" y="18" width="72" height="72" fill="url(#night)" />
  <g fill="none" stroke="url(#gold)" stroke-linecap="round" stroke-linejoin="round">
${LOGO.map(
  ({ d, width }) => `    <path d="${d}" stroke-width="${width}" />`,
).join('\n')}
  </g>
</svg>
`,
);
