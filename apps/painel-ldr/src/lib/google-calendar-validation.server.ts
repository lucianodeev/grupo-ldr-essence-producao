import { randomUUID } from "node:crypto";
import { CalendarError, cancelEvent, countEventsByAppointment, createEvent, findEventByAppointment, hasConflict, patchEvent } from "./google-calendar.server.ts";

let running = false;

/** Real Google API operations only. No appointments, credits, customers or invitations. */
export async function validateRealCalendar() {
  if (running) throw new Error("validation_busy");
  if (process.env["AGENDA_INTEGRATION_ENABLED"] === "true" ||
      process.env["GOOGLE_CALENDAR_VALIDATION_ENABLED"] !== "true" ||
      !process.env["GOOGLE_CALENDAR_TEST_ID"] ||
      process.env["GOOGLE_CALENDAR_TEST_ID"] !== process.env["GOOGLE_CALENDAR_ID"]) {
    throw new Error("validation_not_configured");
  }
  running = true;
  const appointmentId = randomUUID();
  const deterministicId = `ldr${appointmentId.replaceAll("-", "")}g0`;
  const checks: string[] = [];
  let eventMayExist = false;
  let cleanupComplete = false;
  const result: { ok: boolean; checks: string[]; cleanupComplete: boolean; failureCode?: string; remainingTestEventId?: string } = {
    ok: false, checks, cleanupComplete: false,
  };
  try {
    const start = new Date(Date.now() + 7 * 86400000);
    start.setUTCMinutes(0, 0, 0);
    const input = {
      appointmentId,
      summary: "LDR — TESTE TÉCNICO AUTOMÁTICO",
      startsAtIso: start.toISOString(),
      endsAtIso: new Date(+start + 300000).toISOString(),
      attendeeEmail: "",
    };
    if (await hasConflict(input.startsAtIso, input.endsAtIso, null)) throw new Error("test_slot_busy");
    checks.push("availability_read");
    eventMayExist = true; // A timeout can happen after Google has created the event.
    const created = await createEvent(input);
    if (created.eventId !== deterministicId) throw new Error("unexpected_event_identity");
    const read = await findEventByAppointment(appointmentId, created.eventId);
    if (!read || read.start !== +start) throw new Error("create_readback_failed");
    checks.push("create_and_readback");
    if (!await hasConflict(input.startsAtIso, input.endsAtIso, null)) throw new Error("busy_not_detected");
    if (await hasConflict(input.startsAtIso, input.endsAtIso, created.eventId)) throw new Error("own_event_conflict");
    checks.push("conflict_and_own_event");
    const duplicate = await createEvent(input);
    if (duplicate.eventId !== created.eventId || await countEventsByAppointment(appointmentId) !== 1) {
      throw new Error("duplicate_event_detected");
    }
    checks.push("duplicate_prevention");
    const newStart = new Date(+start + 86400000);
    const update = { ...input, startsAtIso: newStart.toISOString(), endsAtIso: new Date(+newStart + 300000).toISOString() };
    if (await hasConflict(update.startsAtIso, update.endsAtIso, null)) throw new Error("reschedule_slot_busy");
    const moved = await patchEvent(created.eventId, update);
    const movedRead = await findEventByAppointment(appointmentId, moved.eventId);
    if (moved.eventId !== created.eventId || movedRead?.start !== +newStart || movedRead.end !== +newStart + 300000) {
      throw new Error("reschedule_readback_failed");
    }
    checks.push("reschedule_same_identity");
    await cancelEvent(created.eventId);
    if (await findEventByAppointment(appointmentId, created.eventId)) throw new Error("cancel_readback_failed");
    checks.push("cancel_and_readback");
    await cancelEvent(created.eventId);
    if (await countEventsByAppointment(appointmentId) !== 0) throw new Error("remaining_test_event");
    cleanupComplete = true;
    checks.push("idempotent_cancel_and_zero_remaining");
    result.ok = true;
    result.cleanupComplete = true;
    return result;
  } catch (error) {
    result.failureCode = error instanceof CalendarError ? error.code : "validation_assertion_failed";
    return result;
  } finally {
    try {
      if (!eventMayExist) result.cleanupComplete = true;
      if (eventMayExist && !cleanupComplete) {
        // Deletes only the deterministic ID owned by this fresh test run.
        try {
          await cancelEvent(deterministicId);
          result.cleanupComplete = await countEventsByAppointment(appointmentId) === 0;
        } catch { result.cleanupComplete = false; }
        if (!result.cleanupComplete) result.remainingTestEventId = deterministicId;
      }
    } finally { running = false; }
  }
}
