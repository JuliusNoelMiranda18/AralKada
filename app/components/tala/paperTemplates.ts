import type { PaperType, PaperColor } from './types';

interface PaperTheme {
  bg: string;
  lineColor: string;
  accentColor: string;
}

const THEMES: Record<PaperColor, PaperTheme> = {
  white:  { bg: '#FAFAF5', lineColor: 'rgba(180,180,200,0.45)', accentColor: 'rgba(150,150,200,0.6)' },
  yellow: { bg: '#FFFDE7', lineColor: 'rgba(180,155,60,0.3)',  accentColor: 'rgba(180,130,50,0.5)' },
  dark:   { bg: '#1A2028', lineColor: 'rgba(255,255,255,0.08)', accentColor: 'rgba(255,255,255,0.14)' },
};

function encodeSVG(svg: string): string {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

// ── PATTERN GENERATORS ──────────────────────────────────────────────────────

function dotted(theme: PaperTheme): string {
  const { bg, lineColor } = theme;
  return encodeSVG(`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20">
    <rect width="20" height="20" fill="${bg}"/>
    <circle cx="0" cy="0" r="1.2" fill="${lineColor}"/>
    <circle cx="20" cy="0" r="1.2" fill="${lineColor}"/>
    <circle cx="0" cy="20" r="1.2" fill="${lineColor}"/>
    <circle cx="20" cy="20" r="1.2" fill="${lineColor}"/>
    <circle cx="10" cy="10" r="1.2" fill="${lineColor}"/>
  </svg>`);
}

function ruledNarrow(theme: PaperTheme): string {
  const { bg, lineColor } = theme;
  return encodeSVG(`<svg xmlns="http://www.w3.org/2000/svg" width="1" height="28">
    <rect width="1" height="28" fill="${bg}"/>
    <line x1="0" y1="27.5" x2="1" y2="27.5" stroke="${lineColor}" stroke-width="0.8"/>
  </svg>`);
}

function ruledWide(theme: PaperTheme): string {
  const { bg, lineColor } = theme;
  return encodeSVG(`<svg xmlns="http://www.w3.org/2000/svg" width="1" height="40">
    <rect width="1" height="40" fill="${bg}"/>
    <line x1="0" y1="39.5" x2="1" y2="39.5" stroke="${lineColor}" stroke-width="0.8"/>
  </svg>`);
}

function squared(theme: PaperTheme): string {
  const { bg, lineColor } = theme;
  return encodeSVG(`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20">
    <rect width="20" height="20" fill="${bg}"/>
    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="${lineColor}" stroke-width="0.5"/>
  </svg>`);
}

// Non-repeating templates — return CSS object with bg color + CSS class
export interface PaperStyle {
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  backgroundColor: string;
  backgroundRepeat?: string;
}

export function getPaperStyle(
  paperType: PaperType,
  paperColor: PaperColor = 'white',
): PaperStyle {
  const theme = THEMES[paperColor];

  switch (paperType) {
    case 'blank':
      return { backgroundColor: theme.bg };

    case 'dotted':
      return {
        backgroundColor: theme.bg,
        backgroundImage: `url("${dotted(theme)}")`,
        backgroundSize: '20px 20px',
        backgroundRepeat: 'repeat',
      };

    case 'ruled-narrow':
      return {
        backgroundColor: theme.bg,
        backgroundImage: `url("${ruledNarrow(theme)}")`,
        backgroundSize: '1px 28px',
        backgroundRepeat: 'repeat',
        backgroundPosition: '0 0',
      };

    case 'ruled-wide':
      return {
        backgroundColor: theme.bg,
        backgroundImage: `url("${ruledWide(theme)}")`,
        backgroundSize: '1px 40px',
        backgroundRepeat: 'repeat',
      };

    case 'squared':
      return {
        backgroundColor: theme.bg,
        backgroundImage: `url("${squared(theme)}")`,
        backgroundSize: '20px 20px',
        backgroundRepeat: 'repeat',
      };

    case 'cornell': {
      // Left cue column (25% width) + bottom summary line (80% height)
      const lc = theme.accentColor;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1100">
        <rect width="800" height="1100" fill="${theme.bg}"/>
        <!-- Ruled lines -->
        ${Array.from({ length: 35 }, (_, i) =>
          `<line x1="0" y1="${i * 28 + 60}" x2="800" y2="${i * 28 + 60}" stroke="${theme.lineColor}" stroke-width="0.7"/>`
        ).join('')}
        <!-- Cue column vertical line at 25% -->
        <line x1="200" y1="0" x2="200" y2="880" stroke="${lc}" stroke-width="1.5"/>
        <!-- Summary horizontal line at 80% height -->
        <line x1="0" y1="880" x2="800" y2="880" stroke="${lc}" stroke-width="1.5"/>
        <!-- Labels -->
        <text x="8" y="14" font-family="sans-serif" font-size="9" fill="${lc}" opacity="0.7">CUE</text>
        <text x="205" y="14" font-family="sans-serif" font-size="9" fill="${lc}" opacity="0.7">NOTES</text>
        <text x="8" y="895" font-family="sans-serif" font-size="9" fill="${lc}" opacity="0.7">SUMMARY</text>
      </svg>`;
      return {
        backgroundColor: theme.bg,
        backgroundImage: `url("${encodeSVG(svg)}")`,
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat',
      };
    }

    case 'legal': {
      const lc = theme.accentColor;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1100">
        <rect width="800" height="1100" fill="${theme.bg}"/>
        ${Array.from({ length: 38 }, (_, i) =>
          `<line x1="0" y1="${i * 28 + 48}" x2="800" y2="${i * 28 + 48}" stroke="${theme.lineColor}" stroke-width="0.7"/>`
        ).join('')}
        <!-- Left margin at ~15% -->
        <line x1="120" y1="0" x2="120" y2="1100" stroke="${lc}" stroke-width="1.5"/>
        <!-- Top title line -->
        <line x1="0" y1="48" x2="800" y2="48" stroke="${lc}" stroke-width="1"/>
        <text x="8" y="36" font-family="sans-serif" font-size="11" fill="${lc}" opacity="0.7">LEGAL</text>
      </svg>`;
      return {
        backgroundColor: theme.bg,
        backgroundImage: `url("${encodeSVG(svg)}")`,
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat',
      };
    }

    case 'single-column': {
      const lc = theme.accentColor;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1100">
        <rect width="800" height="1100" fill="${theme.bg}"/>
        ${Array.from({ length: 38 }, (_, i) =>
          `<line x1="100" y1="${i * 28 + 48}" x2="700" y2="${i * 28 + 48}" stroke="${theme.lineColor}" stroke-width="0.7"/>`
        ).join('')}
        <!-- Column guides -->
        <line x1="100" y1="0" x2="100" y2="1100" stroke="${lc}" stroke-width="0.8"/>
        <line x1="700" y1="0" x2="700" y2="1100" stroke="${lc}" stroke-width="0.8"/>
      </svg>`;
      return {
        backgroundColor: theme.bg,
        backgroundImage: `url("${encodeSVG(svg)}")`,
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat',
      };
    }

    case 'three-column': {
      const lc = theme.accentColor;
      const w = 800;
      const colW = w / 3;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="1100">
        <rect width="${w}" height="1100" fill="${theme.bg}"/>
        ${Array.from({ length: 38 }, (_, i) =>
          `<line x1="0" y1="${i * 28 + 48}" x2="${w}" y2="${i * 28 + 48}" stroke="${theme.lineColor}" stroke-width="0.7"/>`
        ).join('')}
        <line x1="${colW}" y1="0" x2="${colW}" y2="1100" stroke="${lc}" stroke-width="0.8"/>
        <line x1="${colW * 2}" y1="0" x2="${colW * 2}" y2="1100" stroke="${lc}" stroke-width="0.8"/>
      </svg>`;
      return {
        backgroundColor: theme.bg,
        backgroundImage: `url("${encodeSVG(svg)}")`,
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat',
      };
    }

    case 'monthly': {
      const lc = theme.accentColor;
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const cellW = 800 / 7;
      const rowH = 140;
      const rows = 5;
      const headerH = 48;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="${headerH + rows * rowH + 40}">
        <rect width="800" height="${headerH + rows * rowH + 40}" fill="${theme.bg}"/>
        <!-- Day headers -->
        ${days.map((d, i) => `
          <rect x="${i * cellW}" y="0" width="${cellW}" height="${headerH}" fill="${lc}" opacity="0.12"/>
          <text x="${i * cellW + cellW / 2}" y="28" text-anchor="middle" font-family="sans-serif" font-size="11" fill="${lc}">${d}</text>
          <line x1="${i * cellW}" y1="0" x2="${i * cellW}" y2="${headerH + rows * rowH}" stroke="${lc}" stroke-width="0.5"/>
        `).join('')}
        <!-- Row separators -->
        ${Array.from({ length: rows + 1 }, (_, i) =>
          `<line x1="0" y1="${headerH + i * rowH}" x2="800" y2="${headerH + i * rowH}" stroke="${lc}" stroke-width="0.8"/>`
        ).join('')}
        <line x1="799" y1="0" x2="799" y2="${headerH + rows * rowH}" stroke="${lc}" stroke-width="0.5"/>
      </svg>`;
      return {
        backgroundColor: theme.bg,
        backgroundImage: `url("${encodeSVG(svg)}")`,
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat',
      };
    }

    case 'weekly': {
      const lc = theme.accentColor;
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const rowH = 140;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="${days.length * rowH + 40}">
        <rect width="800" height="${days.length * rowH + 40}" fill="${theme.bg}"/>
        ${days.map((d, i) => `
          <rect x="0" y="${i * rowH}" width="120" height="${rowH}" fill="${lc}" opacity="0.08"/>
          <text x="10" y="${i * rowH + 20}" font-family="sans-serif" font-size="10" fill="${lc}" font-weight="600">${d}</text>
          ${Array.from({ length: 4 }, (_, j) =>
            `<line x1="120" y1="${i * rowH + (j + 1) * 28}" x2="800" y2="${i * rowH + (j + 1) * 28}" stroke="${theme.lineColor}" stroke-width="0.6"/>`
          ).join('')}
          <line x1="0" y1="${(i + 1) * rowH}" x2="800" y2="${(i + 1) * rowH}" stroke="${lc}" stroke-width="0.8"/>
          <line x1="120" y1="${i * rowH}" x2="120" y2="${(i + 1) * rowH}" stroke="${lc}" stroke-width="0.5"/>
        `).join('')}
      </svg>`;
      return {
        backgroundColor: theme.bg,
        backgroundImage: `url("${encodeSVG(svg)}")`,
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat',
      };
    }

    case 'todos': {
      const lc = theme.accentColor;
      const numLines = 30;
      const lineH = 36;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="${numLines * lineH + 40}">
        <rect width="800" height="${numLines * lineH + 40}" fill="${theme.bg}"/>
        ${Array.from({ length: numLines }, (_, i) => {
          const y = i * lineH + 24;
          return `
            <rect x="12" y="${y - 11}" width="16" height="16" rx="4" fill="none" stroke="${lc}" stroke-width="1.2"/>
            <line x1="40" y1="${y}" x2="788" y2="${y}" stroke="${theme.lineColor}" stroke-width="0.7"/>
          `;
        }).join('')}
      </svg>`;
      return {
        backgroundColor: theme.bg,
        backgroundImage: `url("${encodeSVG(svg)}")`,
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat',
      };
    }

    default:
      return { backgroundColor: theme.bg };
  }
}

/** Returns a small thumbnail-sized version of the paper style (for the dialog previews) */
export function getPaperThumbnailStyle(
  paperType: PaperType,
  paperColor: PaperColor = 'white',
): React.CSSProperties {
  const style = getPaperStyle(paperType, paperColor);
  return {
    ...style,
    backgroundSize: style.backgroundSize === '100% 100%' ? '100% 100%' : style.backgroundSize,
  };
}
