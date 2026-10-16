import {CHAIN_ID,RPC} from "../../../lib/protocol.mjs";
export const dynamic="force-dynamic";
export async function GET(){
 try{
 const r=await fetch(RPC,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({jsonrpc:"2.0",id:1,method:"eth_chainId",params:[]}),cache:"no-store"});
 const j=await r.json(); const chain=parseInt(j.result,16);
 if(chain!==CHAIN_ID)throw Error("Unexpected chain "+chain);
 return Response.json({ok:true,chainId:chain},{headers:{"cache-control":"no-store"}});
 }catch(e){return Response.json({ok:false,error:String(e)},{status:503})}
}

