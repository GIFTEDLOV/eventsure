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
const proofs=[
 {file:'STUDIONET_V3_3_QUALIFICATION.json',label:'original_inconclusive'},
 {file:'STUDIONET_V3_3_POSITIVE_QUALIFICATION.json',label:'positive_verified'}
];
const checked=[];
for(const entry of proofs){
 const file=root+'deployments/'+entry.file;
 if(!fs.existsSync(file))throw Error('Missing V3.3 case qualification proof: '+entry.file);
 const proof=JSON.parse(fs.readFileSync(file,'utf8'));
 if(proof.address.toLowerCase()!==manifest.address.toLowerCase())throw Error('Qualification bound to wrong contract');
 if(proof.source_sha256!==hash||proof.chain_id!==61999)throw Error('Qualification source fingerprint or chain mismatch');
 for(const [stage,details] of Object.entries(proof.transactions??{})){
  const tx=details.tx??details.hash;
  if(!tx||await rpc('gen_getTransactionStatus',[tx])!=='FINALIZED')throw Error('Historic '+entry.label+' transaction not FINALIZED: '+stage);
 }
 const live=await client.readContract({address:manifest.address,functionName:'get_case',args:[proof.case_id]});
 if(live.id!==proof.case_id||!['PRELIMINARY','CHALLENGED','FINALIZED'].includes(live.state)||Number(live.round)<1)
  throw Error('Case missing or invalid lifecycle progression: '+entry.label);
 // Immutable evidence of the original preliminary verdict is in its historic,
 // finalized resolution tx. Current mutable case state may legitimately evolve.
 if(Number(live.round)===1&&live.decision!==proof.decision)
  throw Error('Round-one historic verdict was unexpectedly overwritten: '+entry.label);
 checked.push({caseId:proof.case_id,proofVerdict:proof.decision,historicalState:proof.state,currentState:live.state,currentDecision:live.decision,round:live.round});
}
console.log(JSON.stringify({PASS:true,chainId:61999,contract:manifest.address,sourceSha256:hash,abiMethods:14,deployedFinalized:true,qualificationHistory:checked},null,2));
