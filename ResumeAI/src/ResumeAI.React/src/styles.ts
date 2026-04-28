import type { CSSProperties } from 'react'

// ─── Colour tokens ────────────────────────────────────────────────────────────
export const C = {
  indigo:  '#36565F', // Deep Slate
  indigoD: '#141414', // Jet Black
  green:   '#22c55e',
  red:     '#ef4444',
  amber:   '#f59e0b',
  blue:    '#5F8190', // Ocean Steel
  purple:  '#5F8190', // Ocean Steel
  sky:     '#E2F0F0', // Cloud Mist
  gray:    '#5F8190', // Ocean Steel
  grayL:   '#E2F0F0', // Cloud Mist
  white:   '#fff',
  text:    '#141414', // Jet Black
  textSub: '#5F8190', // Ocean Steel
  border:  '#E2F0F0', // Cloud Mist
}

// ─── Re-usable style objects ──────────────────────────────────────────────────
export const card: CSSProperties = {
  background: '#fff', borderRadius: 16, padding: '1.75rem',
  boxShadow: '0 4px 15px rgba(0,0,0,.05)', marginBottom: 20,
  border: '1px solid #e0e8e6',
}

export const input: CSSProperties = {
  width: '100%', padding: '0.55rem 0.8rem', borderRadius: 8,
  border: `1px solid ${C.border}`, fontSize: 13, marginBottom: 8,
  boxSizing: 'border-box', outline: 'none',
}

export const textarea: CSSProperties = {
  ...input, minHeight: 80, resize: 'vertical', fontFamily: 'inherit',
}

export const row: CSSProperties = {
  display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12, alignItems: 'center',
}

export const select: CSSProperties = { ...input }

// ─── Factory helpers ──────────────────────────────────────────────────────────
export function btn(bg = C.indigo, fg = '#fff'): CSSProperties {
  return {
    padding: '0.6rem 1.25rem', borderRadius: 10, border: 'none',
    background: bg, color: fg, fontWeight: 600, cursor: 'pointer',
    fontSize: 13, whiteSpace: 'nowrap',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    transition: 'all 0.2s ease',
  }
}

export function pill(bg = C.indigo, fg = '#fff'): CSSProperties {
  return {
    display: 'inline-block', background: bg, color: fg,
    borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 600,
  }
}

export function scoreColor(s: number) {
  return s >= 80 ? C.green : s >= 60 ? C.amber : C.red
}

export const errBox: CSSProperties = {
  background: 'rgba(254, 242, 242, 0.9)',
  border: '1.5px solid #fca5a5',
  borderRadius: '12px',
  padding: '1rem 1.25rem',
  color: '#991b1b',
  fontSize: '0.85rem',
  fontWeight: 600,
  marginBottom: '1.5rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.08)',
  animation: 'shake 0.4s ease-in-out'
}

export const successBox: CSSProperties = {
  background: 'rgba(236, 253, 245, 0.9)',
  border: '1.5px solid #6ee7b7',
  borderRadius: '12px',
  padding: '1rem 1.25rem',
  color: '#065f46',
  fontSize: '0.85rem',
  fontWeight: 600,
  marginBottom: '1.5rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.08)',
  animation: 'fadeIn 0.4s ease-out'
}

export const pre: CSSProperties = {
  background: '#1e1e2e', color: '#cdd6f4', borderRadius: 8,
  padding: '1rem', fontSize: 12, overflow: 'auto', maxHeight: 220, marginTop: 8,
  whiteSpace: 'pre-wrap', wordBreak: 'break-word',
}

export const tabBtn = (active: boolean): CSSProperties => ({
  padding: '0.4rem 1rem', borderRadius: 20, border: 'none', cursor: 'pointer',
  background: active ? C.indigo : C.grayL,
  color: active ? '#fff' : C.text, fontWeight: 600, fontSize: 13,
})
