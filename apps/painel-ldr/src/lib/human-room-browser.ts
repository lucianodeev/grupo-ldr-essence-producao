import { createBrowserClient } from "@supabase/ssr";
let client:any;
export function humanRoomClient(){
  if(client)return client;
  const url="https://lcvuuqtdboucayrysdvc.supabase.co";
  const key=import.meta.env.VITE_HUMAN_ROOM_SUPABASE_PUBLISHABLE_KEY;
  if(!url||!key)throw new Error("Human Room não configurado.");
  client=createBrowserClient(url,key);
  return client;
}
