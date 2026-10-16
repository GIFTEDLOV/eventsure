import {createHash} from "node:crypto";
import {CONTRACT,RPC,SOURCE_SHA256} from "../../../lib/protocol.mjs";
export const dynamic="force-dynamic";
export const runtime="nodejs";
export async function GET(){
 try{
 const response=await fetch(RPC,{method:"POST",headers:{"content-type":"application/json"},
  body:JSON.stringify({jsonrpc:"2.0",id:1,method:"gen_getContractCode",params:[CONTRACT]}),cache:"no-store"});
 if(!response.ok)throw Error("RPC error "+response.status);
 const result=await response.json();
 if(!result.result)throw Error("Missing source");
 const data=Buffer.from(result.result,"base64");
 const sha=createHash("sha256").update(data).digest("hex");
 if(sha!==SOURCE_SHA256)throw Error("Source integrity mismatch");
 return new Response(data,{headers:{"content-type":"text/x-python; charset=utf-8",
  "content-disposition":"attachment; filename=EventSureV2.py","cache-control":"no-store","x-content-type-options":"nosniff"}});
 }catch(e){return Response.json({error:String(e)},{status:502,headers:{"cache-control":"no-store"}})}
}

