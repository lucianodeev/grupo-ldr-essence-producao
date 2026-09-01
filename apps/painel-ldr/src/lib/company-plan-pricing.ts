export type CompanyPlanRegion = "EU" | "BR";
export type CompanyServiceKey =
  | "psychoanalysis"
  | "career_guidance"
  | "career"
  | "mentoring"
  | "workplace_massage"
  | "wellbeing_hour"
  | "talks"
  | "training"
  | "corporate_actions";

export const COMPANY_PLAN_PRICING = {
  EU: {
    currency: "EUR",
    essentials: { maxEmployees: 10, monthlyCents: 14900, credits: 4 },
    pro: { minEmployees: 11, maxEmployees: 50, monthlyCents: 34900, credits: 12 },
    customTiers: [
      { min: 51, max: 100, employeeMonthlyCents: 650 },
      { min: 101, max: 250, employeeMonthlyCents: 590 },
      { min: 251, max: null, employeeMonthlyCents: 520 },
    ],
    creditPacks: { 0: 0, 5: 12500, 10: 23000, 25: 52500 },
    services: {
      psychoanalysis: 8000,
      career_guidance: 6000,
      career: 7000,
      mentoring: 10000,
      workplace_massage: 15000,
      wellbeing_hour: 15000,
      talks: 18000,
      training: 18000,
      corporate_actions: 12000,
    },
  },
  BR: {
    currency: "BRL",
    essentials: { maxEmployees: 10, monthlyCents: 69900, credits: 4 },
    pro: { minEmployees: 11, maxEmployees: 50, monthlyCents: 169000, credits: 12 },
    customTiers: [
      { min: 51, max: 100, employeeMonthlyCents: 2990 },
      { min: 101, max: 250, employeeMonthlyCents: 2690 },
      { min: 251, max: null, employeeMonthlyCents: 2390 },
    ],
    creditPacks: { 0: 0, 5: 62500, 10: 115000, 25: 262500 },
    services: {
      psychoanalysis: 39900,
      career_guidance: 29900,
      career: 34900,
      mentoring: 49900,
      workplace_massage: 74900,
      wellbeing_hour: 74900,
      talks: 89900,
      training: 89900,
      corporate_actions: 59900,
    },
  },
} as const;

export const COMPANY_SERVICE_KEYS: CompanyServiceKey[] = [
  "psychoanalysis",
  "career_guidance",
  "career",
  "mentoring",
  "workplace_massage",
  "wellbeing_hour",
  "talks",
  "training",
  "corporate_actions",
];

export function getCustomEmployeeRate(region: CompanyPlanRegion, employees: number) {
  const tiers = COMPANY_PLAN_PRICING[region].customTiers;
  const tier = tiers.find((item) => employees >= item.min && (item.max === null || employees <= item.max));
  return tier?.employeeMonthlyCents ?? tiers[0].employeeMonthlyCents;
}

export function calculateCustomCompanyPlan(input: {
  region: CompanyPlanRegion;
  employees: number;
  services: CompanyServiceKey[];
  extraCredits: 0 | 5 | 10 | 25;
}) {
  const employees = Math.max(51, Math.floor(input.employees || 51));
  const pricing = COMPANY_PLAN_PRICING[input.region];
  const employeeRateCents = getCustomEmployeeRate(input.region, employees);
  const employeeBaseCents = employeeRateCents * employees;
  const servicesCents = input.services.reduce((total, key) => total + Number(pricing.services[key]), 0);
  const creditsCents = Number(pricing.creditPacks[input.extraCredits]);
  const monthlyCents = employeeBaseCents + servicesCents + creditsCents;

  return {
    employees,
    currency: pricing.currency,
    employeeRateCents,
    employeeBaseCents,
    servicesCents,
    creditsCents,
    monthlyCents,
    perEmployeeCents: Math.round(monthlyCents / employees),
  };
}
