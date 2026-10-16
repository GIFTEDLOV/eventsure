import {createClient} from "genlayer-js";
import {studionet} from "genlayer-js/chains";
import {CONTRACT,CANONICAL_EVENT,CHAIN_ID,RPC,SOURCE_SHA256,TX} from "../../../lib/protocol.mjs";
export const dynamic="force-dynamic";
export const runtime="nodejs";
export const maxDuration=30;
export async function GET(){
 try{
  const c=createClient({chain:studionet,endpoint:RPC});
  const info=await c.readContract({address:CONTRACT,functionName:"contract_info",args:[]});
  if(info.version!==2||info.network!==CHAIN_ID||info.trust_model!=="AUTHENTICATED_ATTESTATION")throw Error("Contract info mismatch");
  const ids=await c.readContract({address:CONTRACT,functionName:"get_event_ids",args:[]});
  const selected=[CANONICAL_EVENT,...ids.filter(x=>x!==CANONICAL_EVENT).slice(-24).reverse()];
  const events=[];
  for(const id of selected){
   try{
    const event=await c.readContract({address:CONTRACT,functionName:"get_event",args:[id]});
    let evidence=null;
    if(event.status!=="DRAFT"){try{evidence=await c.readContract({address:CONTRACT,functionName:"get_evidence",args:[id]});}catch{}}
    events.push({event,evidence});
   }catch(e){throw Error("Contract event read failed: "+id+": "+String(e));}
  }
  const count=Number(await c.readContract({address:CONTRACT,functionName:"get_audit_count",args:[]}));
  const audit=[];
  for(let i=Math.max(0,count-80);i<count;i++)audit.push(await c.readContract({address:CONTRACT,functionName:"get_audit",args:[i]}));
  return Response.json({ok:true,contract:CONTRACT,network:"Studionet",chainId:CHAIN_ID,
    sourceSha256:SOURCE_SHA256,canonicalId:CANONICAL_EVENT,contractInfo:info,
    events,audit,auditCount:count,totalEvents:ids.length,transactions:TX,asOf:new Date().toISOString()},
    {headers:{"cache-control":"no-store, max-age=0","x-content-type-options":"nosniff"}});
 }catch(e){return Response.json({ok:false,error:String(e)},{
  status:502,headers:{"cache-control":"no-store","x-content-type-options":"nosniff"}});}
}

