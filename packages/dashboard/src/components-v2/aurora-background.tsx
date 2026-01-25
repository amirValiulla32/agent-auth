'use client';

export function AuroraBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* Primary spotlight from top-center - subtle forest green */}
      <div
        className="absolute -top-[30%] left-1/2 -translate-x-1/2 w-[100%] h-[60%]"
        style={{
          background: 'radial-gradient(ellipse 50% 35% at 50% 0%, hsl(149 50% 25% / 0.07), transparent 70%)',
        }}
      />

      {/* Secondary aurora ray - left side */}
      <div
        className="absolute -top-[15%] left-[15%] w-[35%] h-[45%] blur-3xl"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(160 40% 22% / 0.05), transparent 60%)',
        }}
      />

      {/* Secondary aurora ray - right side */}
      <div
        className="absolute -top-[10%] right-[20%] w-[30%] h-[40%] blur-3xl"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(145 45% 20% / 0.04), transparent 60%)',
        }}
      />

      {/* Subtle noise texture overlay for organic feel */}
      <div
        className="absolute inset-0 opacity-[0.012]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          mixBlendMode: 'overlay',
        }}
      />
    </div>
  );
}
