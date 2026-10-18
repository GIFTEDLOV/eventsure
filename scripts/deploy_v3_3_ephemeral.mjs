/** One-shot GenLayer Studionet V3.3 deployment using an ephemeral signing account.
 * No secret is read, written, uploaded or printed. Testnet only.
 */
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createAccount,createClient} from 'genlayer-js';
import {studionet} from 'genlayer-js/chains';
import {TransactionStatus} from 'genlayer-js/types';
const root=fileURLToPath(new URL('../',import.meta.url));
const expected='63871815cd3a537dae86defe0f434aa5a08a551dce97a91ef8a76e71c0100abd';
const sourcePath=path.join(root,'contracts','EventSureV3_3.py');
const source=fs.readFileSync(sourcePath);
const sha=crypto.createHash('sha256').update(source).digest('hex');
if(sha!==expected)throw Error('REFUSING: V3.3 source does not match frozen SHA-256');
if(process.env.EVENTSURE_EPHEMERAL_DEPLOY!=='AUTHORIZED_STUDIONET_ONCE')throw Error('Missing explicit one-shot deployment guard');
if(process.env.GITHUB_ACTIONS && process.env.GITHUB_REF!=='refs/heads/release/eventsure-v3.1')throw Error('Unexpected branch');
const dir=path.join(root,'artifacts','v3_3_ephemeral');
fs.mkdirSync(dir,{recursive:true});
const journalFile=path.join(dir,'deployment-journal.json');
if(fs.existsSync(journalFile))throw Error('Deployment journal already exists; reconcile before retry');
const save=(p,v)=>fs.writeFileSync(p,JSON.stringify(v,null,2)+'\n',{mode:0o600});
async function rpc(method,params=[]){
 const res=await fetch('https://studio.genlayer.com/api',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',method,params,id:1})});
 if(!res.ok)throw Error('GenLayer RPC '+method+' HTTP '+res.status);
 const msg=await res.json();
 if(msg.error)throw Error('GenLayer RPC '+method+': '+JSON.stringify(msg.error));
 return msg.result;
}
const chain=Number.parseInt(await rpc('eth_chainId'),16);
if(chain!==61999)throw Error('WRONG CHAIN: expected Studionet 61999');
const account=createAccount();
if(!/^0x[0-9a-fA-F]{40}$/.test(account.address))throw Error('Account generation failed');
const balance=await rpc('eth_getBalance',[account.address,'latest']);
const journal={network:'Studionet',chain_id:chain,source_sha256:expected,account:account.address,balance_before:balance,tx:null,phase:'PREPARING',started:new Date().toISOString()};
save(journalFile,journal);
console.log('EPHEMERAL_SIGNER_ADDRESS='+account.address);
console.log('EPHEMERAL_SIGNER_BALANCE='+balance);
const client=createClient({chain:studionet,endpoint:'https://studio.genlayer.com/api',account});
journal.phase='BROADCAST_ATTEMPT_UNCERTAIN';save(journalFile,journal);
let tx;
try{
 tx=await client.deployContract({code:source.toString('utf8'),args:[]});
}catch(e){
 journal.phase='BROADCAST_RESULT_UNKNOWN';
 journal.error=String(e?.message??e).slice(0,800);
 save(journalFile,journal);
 throw e;
}
journal.tx=tx;journal.phase='BROADCAST';save(journalFile,journal);
console.log('EVENTSURE_V33_DEPLOYMENT_TX='+tx);
const receipt=await client.waitForTransactionReceipt({hash:tx,status:TransactionStatus.FINALIZED,retries:150});
journal.execution_result=receipt?.consensus_data?.leader_receipt?.[0]?.execution_result??'UNKNOWN';
journal.address=receipt?.data?.contract_address??null;
journal.phase='RECEIPT_RETURNED';save(journalFile,journal);
if(journal.execution_result!=='SUCCESS'||!/^0x[0-9a-fA-F]{40}$/.test(journal.address??''))throw Error('Deployment not confirmed successful; review journal before retry');
if(await rpc('gen_getTransactionStatus',[tx])!=='FINALIZED')throw Error('Transaction not FINALIZED');
const deployed=await rpc('gen_getContractCode',[journal.address]);
if(!Buffer.from(deployed,'base64').equals(source))throw Error('CRITICAL: on-chain bytes do not match frozen V3.3');
const schema=await rpc('gen_getContractSchema',[journal.address]);
const methods=Object.keys(schema?.methods??{});
if(methods.length!==14)throw Error('Unexpected on-chain ABI method count: '+methods.length);
const info=await client.readContract({address:journal.address,functionName:'contract_info',args:[]});
if(info?.version!=='3.3.0'||info?.admin!=='NONE')throw Error('Incorrect V3.3 contract identity');
const proof={network:'Studionet',chain_id:chain,source_path:'contracts/EventSureV3_3.py',source_sha256:sha,tx,address:journal.address,signer:account.address,execution_result:journal.execution_result,status:'FINALIZED',source_parity:true,method_count:methods.length,verified_at:new Date().toISOString(),signer_mode:'ephemeral'};
save(path.join(dir,'V3_3_DEPLOYMENT_PROOF.json'),proof);
journal.phase='VERIFIED_SUCCESS';save(journalFile,journal);
console.log('EVENTSURE_V33_EPHEMERAL_DEPLOYMENT=PASS');
console.log(JSON.stringify(proof));
