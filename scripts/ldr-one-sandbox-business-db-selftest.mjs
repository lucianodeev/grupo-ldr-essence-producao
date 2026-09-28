// One-shot rollback-only Business seat integration against the isolated private PostgreSQL.
import {randomUUID} from "node:crypto";
import {checkSandboxEntitlement} from "./ldr-one-sandbox-entitlement-gate.mjs";
import {assignSandboxBusinessSeat} from "./ldr-one-sandbox-business-seats.mjs";
import {revokeSandboxBusinessSeat} from "./ldr-one-sandbox-revoke-seat.mjs";
if(process.env.RENDER_SERVICE_ID!=="srv-das6drvavr4c7397dflg"||process.env.LDR_ONE_SANDBOX_BUSINESS_DB_SELFTEST!=="yes")throw Error("Business DB selftest disabled");
const raw=process.env.DATABASE_URL;if(!raw)throw Error("Private sandbox DB missing");const url=new URL(raw);if(decodeURIComponent(url.pathname.slice(1))!=="ldr_one_sandbox_db")throw Error("Wrong database");
const {default:pg}=await import(process.env.LDR_ONE_PG_MODULE_URL||"pg");const db=new pg.Client({connectionString:raw,connectionTimeoutMillis:10000});let began=false;
try{await db.connect();await db.query("BEGIN");began=true;
 const admin=randomUUID(),customer=randomUUID(),sub=randomUUID(),members=[randomUUID(),randomUUID(),randomUUID(),randomUUID(),randomUUID(),randomUUID()];
 await db.query("INSERT INTO public.ldr_one_sandbox_subscriptions(id,customer_id,user_id,plan,billing_cycle,seats,status) VALUES($1,$2,$3,'business','monthly',5,'active')",[sub,customer,admin]);
 const identity={verified:true,businessAdmin:true,userId:admin,customerId:customer},verifyMember=async({customerId,userId})=>customerId===customer&&members.includes(userId);
 for(const m of members.slice(0,5))await assignSandboxBusinessSeat({db,identity,subscriptionId:sub,memberUserId:m,verifyMember});
 if(!(await checkSandboxEntitlement({db,identity:{verified:true,userId:members[0],customerId:customer}})).allowed)throw Error("Valid seat denied");
 let blocked=false;try{await assignSandboxBusinessSeat({db,identity,subscriptionId:sub,memberUserId:members[5],verifyMember});}catch{blocked=true;}if(!blocked)throw Error("Sixth seat accepted");
 // Simulate legacy/race over-allocation to prove the entitlement gate fails closed.
 await db.query("INSERT INTO public.ldr_one_sandbox_seat_assignments(subscription_id,user_id) VALUES($1,$2)",[sub,members[5]]);
 if((await checkSandboxEntitlement({db,identity:{verified:true,userId:members[0],customerId:customer}})).allowed)throw Error("Overallocated business granted access");
 await revokeSandboxBusinessSeat({db,identity,subscriptionId:sub,memberUserId:members[5]});
 if(!(await checkSandboxEntitlement({db,identity:{verified:true,userId:members[0],customerId:customer}})).allowed)throw Error("Access not restored after correcting roster");
 await revokeSandboxBusinessSeat({db,identity,subscriptionId:sub,memberUserId:members[0]});
 if((await checkSandboxEntitlement({db,identity:{verified:true,userId:members[0],customerId:customer}})).allowed)throw Error("Revoked member retained access");
 console.log("LDR ONE SANDBOX BUSINESS DB SELFTEST VERIFIED; SEAT LIMIT, OVERALLOCATION DENIAL, REVOCATION VERIFIED");
}finally{if(began)await db.query("ROLLBACK");await db.end();console.log("LDR ONE SANDBOX BUSINESS DB SELFTEST ROLLBACK VERIFIED");}
