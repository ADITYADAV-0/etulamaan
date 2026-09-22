/**
 * eTulaMaan Design Tokens
 * Source of Truth: Design.md §1 & §2
 */

export const colors = {
  // Brand Palette
  navy: '#1F3864',       // Primary brand, headers, Applicant-lane accents
  blue: '#0070C0',       // Primary action color, links, Platform/system accents
  gold: '#C69214',       // Certification / seal motif, warnings
  green: '#1E7A46',      // Success, pass states, LMO accents
  red: '#B23A2E',        // Fail states, enforcement, destructive actions
  dark: '#263238',       // Primary text
  gray: '#5B6B73',       // Secondary text, captions
  lightBg: '#F4F7FB',    // Section backgrounds, cards
  white: '#FFFFFF',

  // Status Pill Specific Colors
  statusSubmittedBg: '#E9ECEF',
  statusSubmittedText: '#5B6B73',
  statusScheduledBg: '#E1F0FA',
  statusScheduledText: '#0070C0',
  statusInspectedBg: '#FEF8E7',
  statusInspectedText: '#C69214',
  statusCertifiedBg: '#E6F4EA',
  statusCertifiedText: '#1E7A46',
  statusRejectedBg: '#FCE8E6',
  statusRejectedText: '#B23A2E',

  // Dark Mode Adjustments (WCAG AA compliant)
  darkTheme: {
    bg: '#121A24',
    cardBg: '#1E293B',
    textPrimary: '#F1F5F9',
    textSecondary: '#94A3B8',
    navy: '#3B82F6',
    blue: '#60A5FA',
    gold: '#FBBF24',
    green: '#34D399',
    red: '#F87171',
  }
};

export const typography = {
  fontHeader: 'Times New Roman, serif',
  fontBody: '-apple-system, Segoe UI, Roboto, sans-serif',
  scale: {
    heading1: 22,
    heading2: 18,
    body: 14,
    caption: 11,
    micro: 9.5
  }
};

export const layout = {
  minTouchTarget: 44, // Minimum 44x44pt touch targets per Design.md §3
  borderRadius: 8,
  cardPadding: 16
};
