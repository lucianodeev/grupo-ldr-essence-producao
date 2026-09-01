import { Globe2, MapPin } from "lucide-react";

type ProfileLike = {
  id?: string;
  country_code?: string | null;
  city?: string | null;
  display_name?: string | null;
};

type Props = {
  profiles: ProfileLike[];
  title: string;
  text: string;
  dark?: boolean;
};

const POSITIONS: Record<string, { x: number; y: number }> = {
  BE: { x: 50, y: 32 }, PT: { x: 43, y: 42 }, ES: { x: 46, y: 42 }, FR: { x: 48, y: 36 },
  GB: { x: 46, y: 29 }, IE: { x: 43, y: 29 }, DE: { x: 53, y: 34 }, NL: { x: 50, y: 30 },
  IT: { x: 53, y: 43 }, CH: { x: 50, y: 39 }, LU: { x: 50, y: 34 }, AT: { x: 55, y: 38 },
  BR: { x: 31, y: 69 }, AR: { x: 29, y: 82 }, CL: { x: 25, y: 78 }, UY: { x: 33, y: 80 },
  US: { x: 18, y: 39 }, CA: { x: 18, y: 24 }, MX: { x: 16, y: 53 },
  AO: { x: 53, y: 69 }, MZ: { x: 61, y: 75 }, CV: { x: 43, y: 56 },
  ZA: { x: 57, y: 83 }, IN: { x: 72, y: 55 }, AE: { x: 65, y: 51 },
  AU: { x: 86, y: 78 }, JP: { x: 88, y: 42 }, CN: { x: 80, y: 43 },
};

function fallbackPosition(index: number) {
  return { x: 22 + ((index * 17) % 64), y: 26 + ((index * 13) % 54) };
}

export function ProfessionalNetworkMap({ profiles, title, text, dark = false }: Props) {
  const counts = new Map<string, number>();
  for (const profile of profiles) {
    const code = String(profile.country_code || "").toUpperCase();
    if (!code) continue;
    counts.set(code, (counts.get(code) || 0) + 1);
  }
  const countries = [...counts.entries()];

  return (
    <div className={`relative overflow-hidden rounded-[2rem] border p-6 shadow-xl ${dark ? "border-white/20 bg-white/10 text-white backdrop-blur" : "bg-white"}`} style={dark ? undefined : { borderColor: "rgba(201,166,58,.45)" }}>
      <div className="absolute inset-x-0 top-0 h-1 bg-secondary" />
      <div className="flex items-start gap-3">
        <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-full ${dark ? "bg-white/10 text-secondary" : "bg-primary text-secondary"}`}><Globe2 className="h-5 w-5" /></div>
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl">{title}</h2>
          <p className={`mt-2 text-sm leading-6 ${dark ? "text-white/75" : "text-muted-foreground"}`}>{text}</p>
        </div>
      </div>

      <div className={`relative mt-5 aspect-[16/9] overflow-hidden rounded-2xl border ${dark ? "border-white/15 bg-white/5" : "border-primary/10 bg-[#f4f1e8]"}`} aria-label={title}>
        <svg viewBox="0 0 100 60" className="absolute inset-0 h-full w-full" aria-hidden="true">
          <g fill={dark ? "rgba(255,255,255,.10)" : "rgba(11,31,58,.10)"} stroke={dark ? "rgba(255,255,255,.14)" : "rgba(11,31,58,.12)"} strokeWidth=".35">
            <path d="M7 16 15 8l13 2 7 8-6 7-9 1-5 8-7-4-3-8z" />
            <path d="m25 33 8 3 5 8-2 12-7 4-5-10-3-9z" />
            <path d="m42 12 11-5 13 4 7 8-8 7-7 1-3 9-7-3-4-8-6-5z" />
            <path d="m53 31 11 2 8 9-3 13-9 3-7-8-5-10z" />
            <path d="m68 10 17 3 10 10-7 8-14-2-8-8z" />
            <path d="m79 39 11 2 7 9-5 7-12-2-5-8z" />
          </g>
          <g stroke={dark ? "rgba(255,255,255,.08)" : "rgba(11,31,58,.06)"} strokeWidth=".25">
            {[20,40,60,80].map((x) => <line key={`x${x}`} x1={x} y1="0" x2={x} y2="60" />)}
            {[15,30,45].map((y) => <line key={`y${y}`} x1="0" y1={y} x2="100" y2={y} />)}
          </g>
        </svg>

        {countries.map(([code, count], index) => {
          const pos = POSITIONS[code] || fallbackPosition(index);
          return (
            <div key={code} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${pos.x}%`, top: `${pos.y}%` }} title={`${code}: ${count}`}>
              <div className="relative grid h-8 w-8 place-items-center rounded-full bg-secondary text-[10px] font-black text-primary shadow-lg ring-4 ring-secondary/20">
                {count}
                <span className="absolute -bottom-5 whitespace-nowrap rounded-full bg-primary px-2 py-0.5 text-[9px] font-black text-primary-foreground shadow">{code}</span>
              </div>
            </div>
          );
        })}

        {countries.length === 0 ? <div className="absolute inset-0 grid place-items-center p-6 text-center"><div><MapPin className={`mx-auto h-7 w-7 ${dark ? "text-secondary" : "text-primary"}`} /><p className={`mt-2 text-xs ${dark ? "text-white/70" : "text-muted-foreground"}`}>Os países aparecem aqui conforme os perfis públicos forem ativados.</p></div></div> : null}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {countries.map(([code, count]) => <span key={code} className={`rounded-full border px-3 py-1.5 text-xs font-black ${dark ? "border-white/20 bg-white/5" : "border-primary/15 bg-primary/5"}`}>{code} · {count}</span>)}
        <span className={`rounded-full border px-3 py-1.5 text-xs font-black ${dark ? "border-white/20 bg-white/5" : "border-primary/15 bg-primary/5"}`}>{profiles.length} {profiles.length === 1 ? "perfil ativo" : "perfis ativos"}</span>
      </div>
    </div>
  );
}
