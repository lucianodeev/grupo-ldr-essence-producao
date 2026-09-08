import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Globe2, Languages, MapPin, UserRound } from "lucide-react";

type ProfileLike = {
  id?: string;
  slug?: string | null;
  country_code?: string | null;
  city?: string | null;
  public_region?: string | null;
  display_name?: string | null;
  professional_title?: string | null;
  photo_url?: string | null;
  languages?: string[] | null;
  area_label?: string | null;
};

export type NetworkMapLabels = {
  oneProfessional: string;
  manyProfessionals: string;
  oneActiveProfile: string;
  manyActiveProfiles: string;
  empty: string;
  filterByCountry: string;
  clearFilter: string;
  allCountries?: string;
  allCities?: string;
  allAreas?: string;
  city?: string;
  area?: string;
  languages?: string;
  viewProfile?: string;
};

type Props = {
  profiles: ProfileLike[];
  title: string;
  text: string;
  labels: NetworkMapLabels;
  dark?: boolean;
  selectedCountry?: string;
  onCountrySelect?: (countryCode: string) => void;
};

const POSITIONS: Record<string, { x: number; y: number }> = {
  BE: { x: 50, y: 32 },
  PT: { x: 43, y: 42 },
  ES: { x: 46, y: 42 },
  FR: { x: 48, y: 36 },
  GB: { x: 46, y: 29 },
  IE: { x: 43, y: 29 },
  DE: { x: 53, y: 34 },
  NL: { x: 50, y: 30 },
  IT: { x: 53, y: 43 },
  CH: { x: 50, y: 39 },
  LU: { x: 50, y: 34 },
  AT: { x: 55, y: 38 },
  BR: { x: 31, y: 69 },
  AR: { x: 29, y: 82 },
  CL: { x: 25, y: 78 },
  UY: { x: 33, y: 80 },
  US: { x: 18, y: 39 },
  CA: { x: 18, y: 24 },
  MX: { x: 16, y: 53 },
  AO: { x: 53, y: 69 },
  MZ: { x: 61, y: 75 },
  CV: { x: 43, y: 56 },
  ZA: { x: 57, y: 83 },
  IN: { x: 72, y: 55 },
  AE: { x: 65, y: 51 },
  AU: { x: 86, y: 78 },
  JP: { x: 88, y: 42 },
  CN: { x: 80, y: 43 },
};

function fallbackPosition(index: number) {
  return { x: 22 + ((index * 17) % 64), y: 26 + ((index * 13) % 54) };
}

export function ProfessionalNetworkMap({
  profiles,
  title,
  text,
  labels,
  dark = false,
  selectedCountry,
  onCountrySelect,
}: Props) {
  const [localCountry, setLocalCountry] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const country = selectedCountry === undefined ? localCountry : selectedCountry;
  const countries = useMemo(
    () =>
      [
        ...new Set(
          profiles
            .map((profile) => String(profile.country_code || "").toUpperCase())
            .filter(Boolean),
        ),
      ].sort(),
    [profiles],
  );
  const cities = useMemo(
    () =>
      [
        ...new Set(
          profiles
            .filter((profile) => !country || String(profile.country_code).toUpperCase() === country)
            .map((profile) => profile.city?.trim())
            .filter(Boolean) as string[],
        ),
      ].sort(),
    [country, profiles],
  );
  const areas = useMemo(
    () =>
      [
        ...new Set(
          profiles.map((profile) => profile.area_label?.trim()).filter(Boolean) as string[],
        ),
      ].sort(),
    [profiles],
  );
  const visibleProfiles = profiles.filter(
    (profile) =>
      (!country || String(profile.country_code).toUpperCase() === country) &&
      (!city || profile.city === city) &&
      (!area || profile.area_label === area),
  );
  const counts = new Map<string, number>();
  for (const profile of profiles.filter(
    (item) => (!city || item.city === city) && (!area || item.area_label === area),
  )) {
    const code = String(profile.country_code || "").toUpperCase();
    if (code) counts.set(code, (counts.get(code) || 0) + 1);
  }
  const countryCounts = [...counts.entries()].sort(([a], [b]) => a.localeCompare(b));
  const professionalLabel = (count: number) =>
    count === 1 ? labels.oneProfessional : labels.manyProfessionals;
  const chooseCountry = (code: string) => {
    const next = country === code ? "" : code;
    if (selectedCountry === undefined) setLocalCountry(next);
    onCountrySelect?.(next);
    setCity("");
  };
  const inputClass = `min-h-11 w-full rounded-xl border px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-secondary ${dark ? "border-white/20 bg-primary text-white" : "border-primary/15 bg-white text-primary"}`;

  return (
    <div
      className={`relative overflow-hidden rounded-[2rem] border p-5 shadow-xl sm:p-6 ${dark ? "border-white/20 bg-white/10 text-white backdrop-blur" : "bg-white"}`}
      style={dark ? undefined : { borderColor: "rgba(201,166,58,.45)" }}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-secondary" />
      <div className="flex items-start gap-3">
        <div
          className={`grid h-12 w-12 shrink-0 place-items-center rounded-full ${dark ? "bg-white/10 text-secondary" : "bg-primary text-secondary"}`}
        >
          <Globe2 className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl">{title}</h2>
          <p
            className={`mt-2 text-sm leading-6 ${dark ? "text-white/75" : "text-muted-foreground"}`}
          >
            {text}
          </p>
        </div>
      </div>
      <div className="mt-5 grid gap-2 sm:grid-cols-3" aria-label={title}>
        <select
          className={inputClass}
          value={country}
          onChange={(event) => chooseCountry(event.target.value)}
          aria-label={labels.filterByCountry}
        >
          <option value="">{labels.allCountries || "Todos os países"}</option>
          {countries.map((code) => (
            <option key={code} value={code}>
              {code}
            </option>
          ))}
        </select>
        <select
          className={inputClass}
          value={city}
          onChange={(event) => setCity(event.target.value)}
          aria-label={labels.city || "Cidade"}
        >
          <option value="">{labels.allCities || "Todas as cidades"}</option>
          {cities.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <select
          className={inputClass}
          value={area}
          onChange={(event) => setArea(event.target.value)}
          aria-label={labels.area || "Área"}
        >
          <option value="">{labels.allAreas || "Todas as áreas"}</option>
          {areas.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>
      <div
        className={`relative mt-4 aspect-[16/9] min-h-56 overflow-hidden rounded-2xl border ${dark ? "border-white/15 bg-white/5" : "border-primary/10 bg-[#f4f1e8]"}`}
        role="group"
        aria-label={title}
      >
        <svg viewBox="0 0 100 60" className="absolute inset-0 h-full w-full" aria-hidden="true">
          <g
            fill={dark ? "rgba(255,255,255,.10)" : "rgba(11,31,58,.10)"}
            stroke={dark ? "rgba(255,255,255,.14)" : "rgba(11,31,58,.12)"}
            strokeWidth=".35"
          >
            <path d="M7 16 15 8l13 2 7 8-6 7-9 1-5 8-7-4-3-8z" />
            <path d="m25 33 8 3 5 8-2 12-7 4-5-10-3-9z" />
            <path d="m42 12 11-5 13 4 7 8-8 7-7 1-3 9-7-3-4-8-6-5z" />
            <path d="m53 31 11 2 8 9-3 13-9 3-7-8-5-10z" />
            <path d="m68 10 17 3 10 10-7 8-14-2-8-8z" />
            <path d="m79 39 11 2 7 9-5 7-12-2-5-8z" />
          </g>
        </svg>
        {countryCounts.map(([code, count], index) => {
          const pos = POSITIONS[code] || fallbackPosition(index);
          const active = country === code;
          return (
            <button
              key={code}
              type="button"
              className="absolute min-h-11 min-w-11 -translate-x-1/2 -translate-y-1/2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2"
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              onClick={() => chooseCountry(code)}
              aria-label={`${active ? labels.clearFilter : labels.filterByCountry}: ${code}, ${count} ${professionalLabel(count)}`}
              aria-pressed={active}
            >
              <span
                className={`relative grid h-9 w-9 place-items-center rounded-full bg-secondary text-xs font-black text-primary shadow-lg ring-4 ${active ? "ring-primary/50" : "ring-secondary/20"}`}
              >
                {count}
              </span>
              <span className="absolute left-1/2 top-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-primary px-2 py-0.5 text-[9px] font-black text-primary-foreground shadow">
                {code} · {count} {professionalLabel(count)}
              </span>
            </button>
          );
        })}
        {countryCounts.length === 0 ? (
          <div className="absolute inset-0 grid place-items-center p-6 text-center">
            <div>
              <MapPin className={`mx-auto h-7 w-7 ${dark ? "text-secondary" : "text-primary"}`} />
              <p className={`mt-2 text-xs ${dark ? "text-white/70" : "text-muted-foreground"}`}>
                {labels.empty}
              </p>
            </div>
          </div>
        ) : null}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {countryCounts.map(([code, count]) => (
          <button
            key={code}
            type="button"
            className={`min-h-11 rounded-full border px-3 py-2 text-xs font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary ${dark ? "border-white/20 bg-white/5" : "border-primary/15 bg-primary/5"} ${country === code ? "ring-2 ring-secondary" : ""}`}
            onClick={() => chooseCountry(code)}
            aria-pressed={country === code}
          >
            {code} · {count} {professionalLabel(count)}
          </button>
        ))}
        <span
          className={`inline-flex min-h-11 items-center rounded-full border px-3 py-2 text-xs font-black ${dark ? "border-white/20 bg-white/5" : "border-primary/15 bg-primary/5"}`}
        >
          {visibleProfiles.length}{" "}
          {visibleProfiles.length === 1 ? labels.oneActiveProfile : labels.manyActiveProfiles}
        </span>
      </div>
      {visibleProfiles.length ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {visibleProfiles.slice(0, 6).map((profile) => (
            <article
              key={profile.id || profile.slug}
              className={`rounded-2xl border p-4 ${dark ? "border-white/15 bg-primary/55" : "border-primary/10 bg-[#fbf8f1]"}`}
            >
              <div className="flex gap-3">
                <div
                  className={`grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-2xl ${dark ? "bg-white/10" : "bg-white"}`}
                >
                  {profile.photo_url ? (
                    <img
                      src={profile.photo_url}
                      alt={profile.display_name || "Profissional LDR"}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <UserRound className="h-6 w-6" />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="break-words font-serif text-lg leading-tight">
                    {profile.display_name}
                  </h3>
                  <p
                    className={`mt-1 line-clamp-2 text-xs font-bold ${dark ? "text-secondary" : "text-primary"}`}
                  >
                    {profile.area_label || profile.professional_title}
                  </p>
                </div>
              </div>
              <div
                className={`mt-3 space-y-1 text-xs ${dark ? "text-white/75" : "text-muted-foreground"}`}
              >
                <p>
                  <MapPin className="mr-1 inline h-3.5 w-3.5" />
                  {profile.city ? `${profile.city} · ` : ""}
                  {profile.country_code}
                </p>
                {profile.languages?.length ? (
                  <p>
                    <Languages className="mr-1 inline h-3.5 w-3.5" />
                    {profile.languages.map((value) => value.toUpperCase()).join(" · ")}
                  </p>
                ) : null}
              </div>
              {profile.slug ? (
                <Link
                  to="/profissional/$slug"
                  params={{ slug: profile.slug }}
                  className={`mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-xl px-4 py-2 text-xs font-black ${dark ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground"}`}
                >
                  {labels.viewProfile || "VER PERFIL"}
                </Link>
              ) : null}
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
}
