/** Run real EventSure V3.2 evidence-consensus lifecycle on GenLayer Studionet.
 * Temporary signer generated inside this one CI job. Never persisted or displayed.
 */
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createAccount,createClient} from 'genlayer-js';
import {studionet} from 'genlayer-js/chains';
import {TransactionStatus} from 'genlayer-js/types';
const ROOT=fileURLToPath(new URL('../',import.meta.url));
const deployment=JSON.parse(fs.readFileSync(path.join(ROOT,'deployments','STUDIONET_V3_2_DEPLOYMENT.json'),'utf8'));
const source=fs.readFileSync(path.join(ROOT,'contracts','EventSureV3_2.py'));
const sha=crypto.createHash('sha256').update(source).digest('hex');
if(sha!==deployment.source_sha256||deployment.status!=='FINALIZED'||deployment.chain_id!==61999)throw Error('V3.2 deployment manifest/source mismatch');
if(!/^0x[0-9a-fA-F]{40}$/.test(deployment.address))throw Error('Invalid deployed contract address');
if(process.env.EVENTSURE_EPHEMERAL_QUALIFY!=='AUTHORIZED_STUDIONET_ONCE')throw Error('Missing live qualification authorization guard');
if(process.env.GITHUB_ACTIONS&&process.env.GITHUB_REF!=='refs/heads/release/eventsure-v3.1')throw Error('Unexpected release branch');
const RPC='https://studio.genlayer.com/api';
async function rpc(method,params=[]){
 const resp=await fetch(RPC,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method,params})});
 if(!resp.ok)throw Error(method+' HTTP '+resp.status);
 const r=await resp.json();if(r.error)throw Error(method+': '+JSON.stringify(r.error));
 return r.result;
}
if(Number.parseInt(await rpc('eth_chainId'),16)!==61999)throw Error('Wrong network');
const remote=await rpc('gen_getContractCode',[deployment.address]);
if(!Buffer.from(remote,'base64').equals(source))throw Error('V3.2 on-chain code does not match exact source');
const account=createAccount();
const client=createClient({chain:studionet,endpoint:RPC,account});
const info=await client.readContract({address:deployment.address,functionName:'contract_info',args:[]});
if(info?.version!=='3.2.0'||info?.admin!=='NONE')throw Error('Wrong V3.2 contract');
const id='EVS-APOLLO-V32-'+crypto.randomBytes(6).toString('hex').toUpperCase();
const deadline=new Date(Date.now()+9*60*1000).toISOString();
const question='Did the Apollo 11 crewed lunar module land on the Moon on July 20, 1969?';
const rule='Two independent authoritative public sources must explicitly substantiate the Apollo 11 crewed lunar landing occurred July 20, 1969, before the frozen deadline; lacking direct historical time evidence the decision must remain inconclusive.';
const urls=['https://www.nasa.gov/mission/apollo-11/','https://airandspace.si.edu/collections/apollo-11'];
const OUT=path.join(ROOT,'artifacts','v3_2_qualification');
fs.mkdirSync(OUT,{recursive:true});
const JOURNAL=path.join(OUT,'attempt.json');
if(fs.existsSync(JOURNAL))throw Error('Existing attempt journal: manually reconcile first');
const j={network:'Studionet',chain_id:61999,contract:deployment.address,source_sha256:sha,signer:account.address,case_id:id,question,rule,urls,deadline,txs:{},status:'PREPARING',created_at:new Date().toISOString()};
const save=()=>fs.writeFileSync(JOURNAL,JSON.stringify(j,null,2)+'\n',{mode:0o600});
save();
console.log('EVENTSURE_V32_QUALIFICATION_CASE='+id);
async function submit(stage,functionName,args){
 j.txs[stage]={attempted_at:new Date().toISOString(),broadcast_uncertain:true};save();
 const tx=await client.writeContract({address:deployment.address,functionName,args,account});
 j.txs[stage].tx=tx;save();
 console.log('EVENTSURE_V32_'+stage.toUpperCase()+'_TX='+tx);
 const receipt=await client.waitForTransactionReceipt({hash:tx,status:TransactionStatus.FINALIZED,retries:150});
 const result=receipt?.consensus_data?.leader_receipt?.[0]?.execution_result??'UNKNOWN';
 j.txs[stage].result=result;j.txs[stage].finalized_status=await rpc('gen_getTransactionStatus',[tx]);
 j.txs[stage].broadcast_uncertain=false;save();
 if(result!=='SUCCESS'||j.txs[stage].finalized_status!=='FINALIZED')throw Error(stage+' failed or not finalized; see journal');
}
await submit('create','create_case',[id,'Apollo 11 historical landing verification',question,rule,deadline,JSON.stringify(urls),'[]',0n]);
await submit('freeze','freeze_case',[id]);
const before=await client.readContract({address:deployment.address,functionName:'get_case',args:[id]});
if(before?.state!=='FROZEN')throw Error('Case was not actually frozen');
const wait=Math.max(0,Date.parse(deadline)-Date.now()+11000);
if(wait>10*60*1000)throw Error('Unexpectedly long case deadline wait');
j.status='WAITING_FOR_DEADLINE';save();
console.log('EVENTSURE_V32_WAITING_MS='+wait);
await new Promise(resolve=>setTimeout(resolve,wait));
await submit('resolve','resolve_case',[id]);
const final=await client.readContract({address:deployment.address,functionName:'get_case',args:[id]});
if(final?.state!=='PRELIMINARY'||!['VERIFIED','INCONCLUSIVE'].includes(final?.decision))throw Error('Unexpected contract decision or state');
j.status='FINALIZED_TXS_AND_PRELIMINARY_DECISION';
j.decision=final.decision;j.assessment=final.assessment;j.finished_at=new Date().toISOString();save();
console.log('EVENTSURE_V32_LIVE_QUALIFICATION=PASS');
console.log('EVENTSURE_V32_DECISION='+j.decision);
console.log(JSON.stringify({case_id:id,contract:deployment.address,decision:j.decision,state:final.state,txs:j.txs,assessment:j.assessment}));
