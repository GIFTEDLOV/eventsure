import fs from "node:fs";
import crypto from "node:crypto";
import {createClient} from "genlayer-js";
import {studionet} from "genlayer-js/chains";
const ROOT=new URL("../",import.meta.url).pathname;
const PATH=ROOT+"deployments/STUDIONET_V2_PROOF.json";
const proof=JSON.parse(fs.readFileSync(PATH,"utf8"));
const rpc=async(method,params)=>{
 const response=await fetch("https://studio.genlayer.com/api",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({jsonrpc:"2.0",id:1,method,params})});
 const json=await response.json();if(json.error)throw Error(JSON.stringify(json.error));return json.result;
};
const local=fs.readFileSync(ROOT+"contracts/EventSureV2.py");
const hash=crypto.createHash("sha256").update(local).digest("hex");
if(hash!==proof.source_sha256)throw Error("Source fingerprint mismatch");
const chain=Number.parseInt(await rpc("eth_chainId",[]),16);
if(chain!==61999)throw Error("Network mismatch");
const code=Buffer.from(await rpc("gen_getContractCode",[proof.contract_address]),"base64");
if(!code.equals(local))throw Error("On-chain code differs from repo source");
const schema=await rpc("gen_getContractSchema",[proof.contract_address]);
if(Object.keys(schema.methods).length!==10)throw Error("Expected ten methods");
const client=createClient({chain:studionet,endpoint:"https://studio.genlayer.com/api"});
const state=await client.readContract({address:proof.contract_address,functionName:"get_event",args:[proof.event_id]});
const evidence=await client.readContract({address:proof.contract_address,functionName:"get_evidence",args:[proof.event_id]});
if(state.verdict!=="ATTESTATION_SUPPORTED"||state.status!=="RESOLVED")throw Error("Qualification state mismatch");
if(evidence.sha256!==proof.evidence_sha256)throw Error("Evidence fingerprint mismatch");
if(evidence.bytes!==Buffer.byteLength(evidence.content,"utf8"))throw Error("Evidence bytes mismatch");
if(!evidence.content.includes("ten public ABI methods"))throw Error("Canonical attestation does not reflect ABI");
for(const [stage,txHash] of Object.entries(proof.transactions)){
 const status=await rpc("gen_getTransactionStatus",[txHash]);
 if(status!=="FINALIZED")throw Error(stage+" is not FINALIZED: "+status);
}
const n=await client.readContract({address:proof.contract_address,functionName:"get_audit_count",args:[]});
if(Number(n)<8)throw Error("Insufficient audit records");
console.log(JSON.stringify({GO:true,chain,source_sha256:hash,abi_methods:Object.keys(schema.methods).length,contract:proof.contract_address,event_id:proof.event_id,verdict:state.verdict,evidence_sha256:evidence.sha256,audit_count:Number(n),finalized_transactions:Object.keys(proof.transactions).length},null,2));

