import {createClient} from "genlayer-js";
import {studionet} from "genlayer-js/chains";
import {CONTRACT,RPC,HASH,CHAIN_ID,QUALIFICATION} from "../../../../lib/v3.mjs";
export const dynamic="force-dynamic";
export const runtime="nodejs";
export const maxDuration=45;
export async function GET(){
 try{
  const client=createClient({chain:studionet,endpoint:RPC});
  const info=await client.readContract({address:CONTRACT,functionName:"contract_info",args:[]});
  if(info.version!=="3.2.0"||Number(info.chain_id)!==CHAIN_ID)throw Error("Unrecognized contract");
  const ids=await client.readContract({address:CONTRACT,functionName:"get_case_ids",args:[]});
  const ordered=[...ids].reverse().slice(0,30);
  if(ids.includes(QUALIFICATION)&&!ordered.includes(QUALIFICATION))ordered.unshift(QUALIFICATION);
  const cases=[];
  for(const id of ordered){
   const v=await client.readContract({address:CONTRACT,functionName:"get_case",args:[id]});
   if(Number(v.challenge_count)>0){
    try{const objections=await client.readContract({address:CONTRACT,functionName:"get_challenge",args:[id]});v.challenges=objections.challenges||[];}catch{/* Challenge records may be temporarily unreadable */}
   }
   cases.push(v);
  }
  const auditCount=Number(await client.readContract({address:CONTRACT,functionName:"get_audit_count",args:[]}));
  const audit=[];
  for(let i=Math.max(0,auditCount-50);i<auditCount;i++){
   const entry=await client.readContract({address:CONTRACT,functionName:"get_audit",args:[i]});
   audit.push({...entry,index:i});
  }
  return Response.json({ok:true,contract:CONTRACT,sourceSha256:HASH,chainId:CHAIN_ID,info,
   totalCases:ids.length,cases,auditCount,audit,qualification:QUALIFICATION,asOf:new Date().toISOString()},
   {headers:{"cache-control":"no-store","x-content-type-options":"nosniff"}});
 }catch(e){return Response.json({ok:false,error:String(e)}, {status:502,headers:{"cache-control":"no-store"}})}
}

