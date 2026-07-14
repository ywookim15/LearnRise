/** Generates a solid navy initials avatar as an inline SVG data URI. */
export function makeInitialsAvatar(initials: string): string {
  const safe = (initials || "?").slice(0, 2).toUpperCase();
  return (
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96'>
        <rect width='96' height='96' rx='48' fill='#0D1140'/>
        <text x='50%' y='54%' font-family='system-ui, sans-serif' font-size='38'
          fill='white' text-anchor='middle' dominant-baseline='middle' font-weight='600'>${safe}</text>
      </svg>`
    )
  );
}
