import type { SupabaseClient } from "@supabase/supabase-js";

import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Database } from "@/integrations/supabase/types";
import { resolveAccess } from "@/lib/access.server";

type Client = SupabaseClient<Database>;
type AccessType = "gratuito" | "avulso" | "assinatura";
type EnrollmentStatus = "ativo" | "concluido" | "inativo";
type Metadata = {
  product_key?: unknown;
  training_slug?: unknown;
  source?: unknown;
  subscription_access?: unknown;
  [key: string]: unknown;
};
type EnrollmentRow = {
  id: string;
  training_id: string;
  customer_id: string;
  active: boolean;
  enrolled_at: string;
  progress_percent: number | null;
  completed_at: string | null;
  product_key: string | null;
  customers: { full_name: string | null; email: string | null } | null;
  training_programs: { id: string; slug: string; title: string } | null;
};
type OrderRow = { customer_id: string; catalog_key: string | null; metadata: Metadata | null };
type SubscriptionRow = { customer_id: string; current_period_end: string | null };
type ProgressRow = { customer_id: string; product_key: string; progress_percent: number | null; updated_at: string | null };

const db = supabaseAdmin as unknown as { from: (table: string) => any };

function fail(message = "Não foi possível carregar os alunos matriculados."): never {
  throw new Error(message);
}

async function requireSuperadmin(supabase: Client, userId: string) {
  const access = await resolveAccess(supabase, userId);
  if (!access.authorized || access.role !== "superadmin") fail("Acesso negado.");
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function keysFor(enrollment: EnrollmentRow) {
  const values = [enrollment.product_key, enrollment.training_programs?.slug]
    .map(text)
    .filter(Boolean);
  return new Set(values.flatMap((value) => [value, value.replaceAll("-", "_"), value.replaceAll("_", "-")]));
}

function orderMatches(order: OrderRow, keys: Set<string>) {
  const metadata = (order.metadata ?? {}) as Metadata;
  return [order.catalog_key, metadata.product_key, metadata.training_slug]
    .map(text)
    .some((value) => value && (keys.has(value) || keys.has(value.replaceAll("-", "_")) || keys.has(value.replaceAll("_", "-"))));
}

function accessTypeFor(enrollment: EnrollmentRow, paidOrders: OrderRow[], activeSubscriptionCustomers: Set<string>): AccessType {
  const keys = keysFor(enrollment);
  const matching = paidOrders.filter((order) => order.customer_id === enrollment.customer_id && orderMatches(order, keys));
  const bySubscription = matching.some((order) => {
    const metadata = (order.metadata ?? {}) as Metadata;
    return metadata.source === "library_subscription" && metadata.subscription_access !== false;
  });
  if (bySubscription && activeSubscriptionCustomers.has(enrollment.customer_id)) return "assinatura";
  if (matching.some((order) => order.metadata?.source !== "library_subscription")) return "avulso";
  return "gratuito";
}

export type AcademyEnrollmentCourse = {
  id: string;
  title: string;
  slug: string;
  accessType: AccessType;
  status: EnrollmentStatus;
  progressPercent: number;
  enrolledAt: string;
  completedAt: string | null;
};

export type AcademyStudent = {
  id: string;
  name: string;
  email: string;
  courses: AcademyEnrollmentCourse[];
};

export async function getAdminAcademyEnrollments(supabase: Client, userId: string) {
  await requireSuperadmin(supabase, userId);
  const now = new Date().toISOString();
  const [enrollmentsResult, ordersResult, subscriptionsResult, progressResult] = await Promise.all([
    db.from("training_enrollments")
      .select("id,training_id,customer_id,active,enrolled_at,progress_percent,completed_at,product_key,customers(full_name,email),training_programs(id,slug,title)")
      .order("enrolled_at", { ascending: false }),
    db.from("orders")
      .select("id,customer_id,catalog_key,payment_status,created_at,metadata")
      .eq("payment_status", "pago")
      .order("created_at", { ascending: false }),
    db.from("library_subscriptions")
      .select("id,customer_id,status,current_period_end")
      .in("status", ["active", "trialing"]),
    db.from("library_progress")
      .select("customer_id,product_key,progress_percent,updated_at"),
  ]);

  if (enrollmentsResult.error) fail();
  const enrollments = (enrollmentsResult.data ?? []) as EnrollmentRow[];
  const paidOrders = (ordersResult.data ?? []) as OrderRow[];
  const subscriptions = (subscriptionsResult.data ?? []) as SubscriptionRow[];
  const progressRows = (progressResult.data ?? []) as ProgressRow[];
  const activeSubscriptionCustomers = new Set(
    subscriptions
      .filter((row) => !row.current_period_end || row.current_period_end > now)
      .map((row) => String(row.customer_id)),
  );

  const students = new Map<string, AcademyStudent>();
  for (const enrollment of enrollments) {
    const customer = enrollment.customers;
    const training = enrollment.training_programs;
    const courseKeys = keysFor(enrollment);
    const savedProgress = progressRows
      .filter((row) => row.customer_id === enrollment.customer_id && courseKeys.has(text(row.product_key)))
      .sort((a, b) => text(b.updated_at).localeCompare(text(a.updated_at)))[0];
    const progressPercent = Math.max(0, Math.min(100, Math.round(Number(savedProgress?.progress_percent ?? enrollment.progress_percent ?? 0))));
    const status: EnrollmentStatus = !enrollment.active ? "inativo" : enrollment.completed_at || progressPercent >= 100 ? "concluido" : "ativo";
    const course: AcademyEnrollmentCourse = {
      id: String(enrollment.id),
      title: text(training?.title) || "Curso sem título",
      slug: text(training?.slug),
      accessType: accessTypeFor(enrollment, paidOrders, activeSubscriptionCustomers),
      status,
      progressPercent,
      enrolledAt: text(enrollment.enrolled_at),
      completedAt: text(enrollment.completed_at) || null,
    };
    const customerId = String(enrollment.customer_id);
    const current = students.get(customerId) ?? {
      id: customerId,
      name: text(customer?.full_name) || text(customer?.email) || "Aluno sem nome",
      email: text(customer?.email),
      courses: [],
    };
    current.courses.push(course);
    students.set(customerId, current);
  }

  const list = [...students.values()]
    .map((student) => ({ ...student, courses: student.courses.sort((a, b) => b.enrolledAt.localeCompare(a.enrolledAt)) }))
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  const courses = list.flatMap((student) => student.courses);

  return {
    generatedAt: now,
    metrics: {
      totalStudents: list.length,
      totalEnrollments: courses.length,
      freeEnrollments: courses.filter((course) => course.accessType === "gratuito").length,
      oneTimeEnrollments: courses.filter((course) => course.accessType === "avulso").length,
      subscriptionEnrollments: courses.filter((course) => course.accessType === "assinatura").length,
      activeEnrollments: courses.filter((course) => course.status === "ativo").length,
      completedEnrollments: courses.filter((course) => course.status === "concluido").length,
    },
    students: list,
  };
}

export async function getAdminAcademyEnrollmentSummary(supabase: Client, userId: string) {
  const data = await getAdminAcademyEnrollments(supabase, userId);
  return { generatedAt: data.generatedAt, metrics: data.metrics };
}
