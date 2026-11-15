// Fixture for the local integration job. Never performs HTTP requests.
export function syntheticCalendar(){
 const events=new Map();class CalendarError extends Error{constructor(code){super(code);this.code=code;}}
 return {CALENDAR_ID:'local-synthetic-calendar',CalendarError,isCalendarConfigured:()=>true,
  hasConflict:async(start,end,exclude)=>[...events.values()].some(e=>e.eventId!==exclude&&e.start<Date.parse(end)&&e.end>Date.parse(start)),
  findEventByAppointment:async(appointment,id)=>[...events.values()].find(e=>id?e.eventId===id:e.appointment===appointment)??null,
  countEventsByAppointment:async appointment=>[...events.values()].filter(e=>e.appointment===appointment).length,
  createEvent:async input=>{const id='ldr'+input.appointmentId.replaceAll('-','')+'g0';if(!events.has(id))events.set(id,{eventId:id,appointment:input.appointmentId,start:Date.parse(input.startsAtIso),end:Date.parse(input.endsAtIso),meetUrl:'https://meet.google.com/local-fixture'});return events.get(id);},
  patchEvent:async(id,input)=>{const e=events.get(id);if(!e)throw new CalendarError('nao_encontrado');Object.assign(e,{start:Date.parse(input.startsAtIso),end:Date.parse(input.endsAtIso)});return e;},
  cancelEvent:async id=>{events.delete(id);},
 };
}
