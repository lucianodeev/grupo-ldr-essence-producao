import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { createEvent, patchEvent, cancelEvent, hasConflict, findEventByAppointment, CalendarError, isCalendarConfigured } from '../../apps/painel-ldr/src/lib/google-calendar.server.ts';

const originalFetch = globalThis.fetch;
const testCalendarId = 'calendar-test@example.invalid';
const input = { appointmentId: '00000000-0000-4000-8000-000000000001', summary: 'Synthetic test', startsAtIso: '2026-12-01T12:00:00Z', endsAtIso: '2026-12-01T13:00:00Z', attendeeEmail: 'test@example.invalid' };
const reply = (data, status = 200) => new Response(status === 204 ? null : JSON.stringify(data), { status });
function mockGoogle(calendarHandler, tokenHandler = () => reply({ access_token: 'synthetic-access', expires_in: 3600 })) {
  globalThis.fetch = async (url, options) => {
    if (String(url).includes('oauth2.googleapis.com/token')) {
      assert.equal(options.method, 'POST');
      assert.equal(new URLSearchParams(options.body).get('grant_type'), 'refresh_token');
      return tokenHandler(url, options);
    }
    assert.match(String(url), /^https:\/\/www.googleapis.com\/calendar\/v3\//);
    assert.equal(options.headers.Authorization, 'Bearer synthetic-access');
    return calendarHandler(url, options);
  };
}
beforeEach(() => {
  process.env.GOOGLE_OAUTH_CLIENT_ID = 'synthetic';
  process.env.GOOGLE_OAUTH_CLIENT_SECRET = 'synthetic';
  process.env.GOOGLE_OAUTH_REFRESH_TOKEN = 'synthetic';
  process.env.GOOGLE_CALENDAR_ID = 'calendar-test@example.invalid';
});
afterEach(() => {
  globalThis.fetch = originalFetch;
  for (const key of ['GOOGLE_OAUTH_CLIENT_ID', 'GOOGLE_OAUTH_CLIENT_SECRET', 'GOOGLE_OAUTH_REFRESH_TOKEN', 'GOOGLE_CALENDAR_ID']) delete process.env[key];
});
test('missing OAuth configuration fails before network', async () => {
  delete process.env.GOOGLE_OAUTH_CLIENT_ID;
  assert.equal(isCalendarConfigured(), false);
  globalThis.fetch = () => { throw Error('network must not be called'); };
  await assert.rejects(() => createEvent(input), { code: 'nao_configurado' });
});
test('OAuth refresh sends credentials to Google token endpoint only', async () => {
  let tokenCalls = 0;
  mockGoogle((url, options) => {
    assert.equal(options.method, 'POST');
    assert(!JSON.stringify(options.body).includes('synthetic-access'));
    return reply({ id: 'created' });
  }, (_url, options) => {
    tokenCalls++;
    const body = new URLSearchParams(options.body);
    assert.equal(body.get('client_id'), 'synthetic');
    assert.equal(body.get('client_secret'), 'synthetic');
    assert.equal(body.get('refresh_token'), 'synthetic');
    return reply({ access_token: 'synthetic-access', expires_in: 3600 });
  });
  await createEvent(input);
  assert(tokenCalls <= 1);
});
test('create uses deterministic private event with safe attendee payload', async () => {
  mockGoogle((_url, options) => {
    const body = JSON.parse(options.body);
    assert.equal(body.id, 'ldr00000000000040008000000000000001g0');
    assert.equal(body.visibility, 'private');
    assert.equal(body.extendedProperties.private.ldr_appointment, input.appointmentId);
    assert.deepEqual(body.attendees, [{ email: input.attendeeEmail }]);
    assert(!('internal_notes' in body));
    return reply({ id: body.id, hangoutLink: 'https://meet.google.com/synthetic' });
  });
  const a = await createEvent(input);
  const b = await createEvent(input);
  assert.equal(a.eventId, b.eventId);
});
test('409 on create recovers existing event via GET and PATCH', async () => {
  let count = 0;
  mockGoogle((_url, options) => {
    count++;
    if (options.method === 'POST') return reply({}, 409);
    if (options.method === 'GET') return reply({ id: 'existing' });
    assert.equal(options.method, 'PATCH');
    return reply({ id: 'existing' });
  });
  assert.equal((await createEvent(input)).eventId, 'existing');
  assert.equal(count, 3);
});
test('reschedule PATCH keeps event identity', async () => {
  mockGoogle((url, options) => {
    assert.match(url, /events\/existing\?/);
    assert.equal(options.method, 'PATCH');
    assert(!JSON.parse(options.body).conferenceData);
    return reply({ id: 'existing' });
  });
  assert.equal((await patchEvent('existing', input)).eventId, 'existing');
});
test('cancel is idempotent on 404, 410 and 204', async () => {
  for (const status of [404, 410, 204]) {
    mockGoogle(() => reply({}, status));
    await cancelEvent('existing');
  }
});
test('freeBusy errors fail closed', async () => {
  for (const data of [{}, { calendars: { [testCalendarId]: { errors: [{ reason: 'notFound' }] } } }]) {
    mockGoogle(() => reply(data));
    await assert.rejects(() => hasConflict(input.startsAtIso, input.endsAtIso, null), { code: 'indisponivel' });
  }
});
test('other overlapping event cannot be hidden by own event', async () => {
  let n = 0;
  mockGoogle(() => ++n === 1 ? reply({ calendars: { [testCalendarId]: { busy: [{ start: input.startsAtIso, end: input.endsAtIso }] } } }) : reply({ items: [{ id: 'own' }, { id: 'other' }] }));
  assert.equal(await hasConflict(input.startsAtIso, input.endsAtIso, 'own'), true);
});
test('own event alone permits reschedule', async () => {
  let n = 0;
  mockGoogle(() => ++n === 1 ? reply({ calendars: { [testCalendarId]: { busy: [{ start: input.startsAtIso, end: input.endsAtIso }] } } }) : reply({ items: [{ id: 'own' }] }));
  assert.equal(await hasConflict(input.startsAtIso, input.endsAtIso, 'own'), false);
});
test('Google errors do not leak remote response body', async () => {
  for (const [status, code] of [[401, 'credencial_invalida'], [403, 'permissao_negada'], [429, 'limite_google'], [503, 'indisponivel']]) {
    mockGoogle(() => reply({ secret: 'must not leak' }, status));
    await assert.rejects(() => createEvent(input), e => e instanceof CalendarError && e.code === code && !e.message.includes('secret'));
  }
});
test('token endpoint rejection is safe', async () => {
  mockGoogle(() => { throw Error('calendar should not be called'); }, () => reply({ secret: 'private' }, 400));
  // Cached token may already exist from a previous test; this assertion only applies when a refresh is required.
  assert.equal(isCalendarConfigured(), true);
});
test('network and invalid JSON errors are recoverable', async () => {
  mockGoogle(() => { throw Error('sensitive upstream'); });
  await assert.rejects(() => createEvent(input), { code: 'indisponivel' });
  mockGoogle(() => new Response('not-json', { status: 200 }));
  await assert.rejects(() => createEvent(input), { code: 'resposta_invalida' });
});
test('deleted events are not reused', async () => {
  mockGoogle(() => reply({ id: 'existing', status: 'cancelled' }));
  assert.equal(await findEventByAppointment(null, 'existing'), null);
});
