/** Generates a brand-gradient initials avatar as an inline SVG data URI. */
export function makeInitialsAvatar(initials: string): string {
  const safe = (initials || "?").slice(0, 2).toUpperCase();
  return (
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96'>
        <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0' stop-color='#6366F1'/><stop offset='1' stop-color='#A855F7'/>
        </linearGradient></defs>
        <rect width='96' height='96' rx='48' fill='url(#g)'/>
        <text x='50%' y='54%' font-family='Geist, sans-serif' font-size='38'
          fill='white' text-anchor='middle' dominant-baseline='middle' font-weight='600'>${safe}</text>
      </svg>`
    )
  );
}
