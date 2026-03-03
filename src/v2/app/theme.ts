/**
 * v2.0 Design System — CDO color palette & tokens
 */

export const theme = {
  colors: {
    // Primary
    red: '#C13B3B',       // 朱红 — primary buttons
    gold: '#D4A843',      // 金黄 — currency, quality highlight
    blue: '#2B4C7E',      // 靛蓝 — background, panels
    // Secondary
    green: '#3A7D44',     // 翠绿 — success, HP
    purple: '#6B3FA0',    // 紫色 — rare quality
    orange: '#E67E22',    // 橙色 — warning, limited-time
    // Neutrals
    textDark: '#3E2723',  // 深棕 — text
    bgLight: '#FFF8E7',   // 米白 — panel bg
    cardBg: '#F5E6C8',    // 浅金 — card bg
    border: '#E0D5C0',    // 边框
  },
  fonts: {
    title: '"Noto Serif SC", serif',
    body: '"Noto Sans SC", sans-serif',
    mono: '"Roboto Mono", monospace',
  },
  radii: {
    card: '12px',
    button: '8px',
    panel: '16px',
    input: '6px',
  },
} as const;
