/** Read-only V3.3 Studionet provenance verification. Never signs or deploys. */
import fs from 'node:fs';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {createClient} from 'genlayer-js';
import {studionet} from 'genlayer-js/chains';
const root=fileURLToPath(new URL('../',import.meta.url));
const manifest=JSON.parse(fs.readFileSync(root+'deployments/STUDIONET_V3_3_DEPLOYMENT.json','utf8'));
const source=fs.readFileSync(root+'contracts/EventSureV3_3.py');
const hash=crypto.createHash('sha256').update(source).digest('hex');
if(hash!=='63871815cd3a537dae86defe0f434aa5a08a551dce97a91ef8a76e71c0100abd'||hash!==manifest.source_sha256)throw Error('Frozen V3.3 source identity mismatch');
if(manifest.chain_id!==61999||manifest.status!=='FINALIZED'||manifest.execution_result!=='SUCCESS')throw Error('Deployment manifest is not verified');
async function rpc(method,params=[]){
 const resp=await fetch('https://studio.genlayer.com/api',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',method,params,id:1})});
 if(!resp.ok)throw Error('RPC HTTP '+resp.status+' '+method);
 const j=await resp.json();if(j.error)throw Error(JSON.stringify(j.error));return j.result;
}
if(Number.parseInt(await rpc('eth_chainId'),16)!==61999)throw Error('Wrong chain');
if(await rpc('gen_getTransactionStatus',[manifest.tx])!=='FINALIZED')throw Error('V3.3 deploy transaction not finalized');
const deployed=Buffer.from(await rpc('gen_getContractCode',[manifest.address]),'base64');
if(!deployed.equals(source))throw Error('V3.3 deployed source bytes mismatch');
const schema=await rpc('gen_getContractSchema',[manifest.address]);
if(Object.keys(schema?.methods??{}).length!==14)throw Error('Incorrect V3.3 method count');
const client=createClient({chain:studionet,endpoint:'https://studio.genlayer.com/api'});
const info=await client.readContract({address:manifest.address,functionName:'contract_info',args:[]});
if(info?.version!=='3.3.0'||info?.admin!=='NONE'||Number(info.chain_id)!==61999)throw Error('Unrecognized V3.3 contract identity');
const qualificationPath=root+'deployments/STUDIONET_V3_3_QUALIFICATION.json';
let qualification=null;
if(fs.existsSync(qualificationPath)){
 qualification=JSON.parse(fs.readFileSync(qualificationPath,'utf8'));
 if(qualification.address.toLowerCase()!==manifest.address.toLowerCase())throw Error('Qualification bound to wrong contract');
 for(const [name,item] of Object.entries(qualification.transactions??{})){
  if(!item.tx||await rpc('gen_getTransactionStatus',[item.tx])!=='FINALIZED')throw Error('Qualification transaction not finalized: '+name);
 }
 const state=await client.readContract({address:manifest.address,functionName:'get_case',args:[qualification.case_id]});
 if(state.state!==qualification.state||state.decision!==qualification.decision)throw Error('Live qualification decision/state mismatch');
}
console.log(JSON.stringify({PASS:true,chainId:61999,contract:manifest.address,sourceSha256:hash,abiMethods:14,deployedFinalized:true,qualification:qualification?{id:qualification.case_id,state:qualification.state,decision:qualification.decision}:null},null,2));
