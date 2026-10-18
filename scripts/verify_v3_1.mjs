import fs from "node:fs";
import {createHash} from "node:crypto";
import {createClient} from "genlayer-js";
import {studionet} from "genlayer-js/chains";
const root=new URL("../",import.meta.url).pathname;
const dep=JSON.parse(fs.readFileSync(root+"deployments/STUDIONET_V3_1_DEPLOYMENT.json","utf8"));
const qual=JSON.parse(fs.readFileSync(root+"deployments/STUDIONET_V3_1_QUALIFICATION.json","utf8"));
const source=fs.readFileSync(root+"contracts/EventSureV3_1.py");
const hash=createHash("sha256").update(source).digest("hex");
if(hash!=="0fe025b631642094a3f86d49b6d928ba76a00c1af1102a2699036fb959a97acb"||dep.source_sha256!==hash)throw Error("Frozen contract source mismatch");
if(dep.chain_id!==61999||!dep.finalized||dep.execution_result!=="SUCCESS")throw Error("Deployment manifest mismatch");
if(qual.address!==dep.address||!qual.transactions.resolve?.hash)throw Error("Qualification identity mismatch");
async function rpc(method,params){
 for(let i=0;i<4;i++){try{
  const response=await fetch("https://studio.genlayer.com/api",{method:"POST",
   headers:{"content-type":"application/json"},body:JSON.stringify({jsonrpc:"2.0",id:1,method,params})});
  const j=await response.json();if(j.error)throw Error(JSON.stringify(j.error));return j.result;
 }catch(e){if(i===3)throw e;await new Promise(r=>setTimeout(r,1200*(i+1)))}}
}
const chainId=Number.parseInt(await rpc("eth_chainId",[]),16);
if(chainId!==61999)throw Error("Wrong network");
const deployed=Buffer.from(await rpc("gen_getContractCode",[dep.address]),"base64");
if(!deployed.equals(source))throw Error("On-chain source differs from repository");
const schema=await rpc("gen_getContractSchema",[dep.address]);
if(Object.keys(schema.methods).length!==14)throw Error("Unexpected on-chain ABI");
for(const [name,tx] of [["deploy",{hash:dep.tx}],...Object.entries(qual.transactions)]){
 if(!tx.hash)throw Error("Missing "+name+" transaction");
 const status=await rpc("gen_getTransactionStatus",[tx.hash]);
 if(status!=="FINALIZED")throw Error(name+" is "+status+" not FINALIZED");
}
const client=createClient({chain:studionet,endpoint:"https://studio.genlayer.com/api"});
const info=await client.readContract({address:dep.address,functionName:"contract_info",args:[]});
const state=await client.readContract({address:dep.address,functionName:"get_case",args:[qual.id]});
if(info.version!=="3.1.0"||info.admin!=="NONE")throw Error("Wrong contract");
if(state.state!=="PRELIMINARY"||state.decision!=="INCONCLUSIVE")throw Error("Unexpected canonical qualification outcome");
if(state.assessment.vote.independent_sources!==2||state.assessment.vote.time_supported!==false)throw Error("Proof not the conservative public-web assessment");
console.log(JSON.stringify({PASS:true,contract:dep.address,chainId,sourceSha256:hash,
 abiMethods:14,canonicalId:qual.id,canonicalDecision:state.decision,
 canonicalState:state.state,webSources:state.assessment.vote.independent_sources,
 finalizedTransactions:4},null,2));

