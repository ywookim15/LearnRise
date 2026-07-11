// MOCK DATA — placeholder user profile. Replace with real auth/user in Phase 2.

export interface MockUser {
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string;
  plan: "free" | "pro";
}

export const mockUser: MockUser = {
  firstName: "Jane",
  lastName: "Doe",
  email: "jane.doe@example.com",
  // Inline SVG data-URI avatar so the prototype needs no network/asset pipeline.
  avatarUrl:
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96'>
        <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0' stop-color='#6366F1'/><stop offset='1' stop-color='#A855F7'/>
        </linearGradient></defs>
        <rect width='96' height='96' rx='48' fill='url(#g)'/>
        <text x='50%' y='54%' font-family='Geist, sans-serif' font-size='38'
          fill='white' text-anchor='middle' dominant-baseline='middle' font-weight='600'>JD</text>
      </svg>`
    ),
  plan: "pro",
};
