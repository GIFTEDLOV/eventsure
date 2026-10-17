import {createHash} from "node:crypto";
import {CONTRACT,RPC,HASH} from "../../../../lib/v3.mjs";
export const dynamic="force-dynamic";
export const runtime="nodejs";
export async function GET(){
 try{
  const r=await fetch(RPC,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({jsonrpc:"2.0",id:1,method:"gen_getContractCode",params:[CONTRACT]}),cache:"no-store"});
  if(!r.ok)throw Error("RPC temporarily unavailable");
  const j=await r.json();
  if(typeof j.result!=="string")throw Error("Source not found");
  const bytes=Buffer.from(j.result,"base64");
  const actual=createHash("sha256").update(bytes).digest("hex");
  if(actual!==HASH)throw Error("Deployed source hash mismatch");
  return new Response(bytes,{headers:{"content-type":"text/x-python; charset=utf-8",
   "content-disposition":"attachment; filename=EventSureV3_2.py","cache-control":"no-store","x-content-type-options":"nosniff"}});
 }catch(e){return Response.json({error:String(e)},{status:502,headers:{"cache-control":"no-store"}})}
}

