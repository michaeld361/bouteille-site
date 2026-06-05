'use client'

/**
 * CSS-only grain overlay — no canvas, no RAF, no performance cost.
 * Uses a tiny base64 noise texture repeated and animated with CSS.
 */
export default function GrainCanvas() {
  return <div id="grain" aria-hidden="true" />
}
