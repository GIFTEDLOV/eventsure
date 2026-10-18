/** EventSure V3.2 Studionet deploy (one-attempt, fail-closed). */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {createAccount, createClient} from 'genlayer-js';
import {studionet} from 'genlayer-js/chains';
import {TransactionStatus} from 'genlayer-js/types';

const ROOT=fileURLToPath(new URL('../',import.meta.url));
const SOURCE='contracts/EventSureV3_2.py';
const EXPECTED_SHA256='9cc30efa9d1107afc30eb1e94d3d6b8cd0671f57f810c17d3801d6dba688b02f';
const RPC='https://studio.genlayer.com/api';
const OUT=path.join(ROOT,'artifacts','v3_2');
const JOURNAL=path.join(OUT,'deploy-attempt.json');
const PROOF=path.join(OUT,'deployment-proof.json');
const save=(p,obj)=>fs.writeFileSync(p,JSON.stringify(obj,null,2)+'\n',{mode:0o600});
const digest=(data)=>crypto.createHash('sha256').update(data).digest('hex');
const requireTrue=(condition,message)=>{if(!condition) throw Error(message)};

async function rpc(method,params){
  const response=await fetch(RPC,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method,params})});
  requireTrue(response.ok,'RPC '+method+' HTTP status '+response.status);
  const data=await response.json();
  requireTrue(!data.error,'RPC '+method+' error: '+JSON.stringify(data.error));
  return data.result;
}

requireTrue(process.env.EVENTSURE_APPROVE_NEW_DEPLOY==='EXPLICITLY_AUTHORIZED','Explicit V3.2 deployment authorization guard missing');
requireTrue(!process.env.GITHUB_ACTIONS || process.env.GITHUB_REF==='refs/heads/release/eventsure-v3.1','Not authorized release branch');
const code=fs.readFileSync(path.join(ROOT,SOURCE));
requireTrue(digest(code)===EXPECTED_SHA256,'Source hash mismatch: refusing unknown code');
const secret=process.env.EVENTSURE_PRIVATE_KEY;
requireTrue(/^0x[a-fA-F0-9]{64}$/.test(secret??''),'Missing or malformed secure signing key');
const account=createAccount(secret);
requireTrue(Number.parseInt(await rpc('eth_chainId',[]),16)===61999,'Wrong network: not Studionet 61999');
fs.mkdirSync(OUT,{recursive:true});
requireTrue(!fs.existsSync(JOURNAL),'Prior deployment journal exists; reconcile it before another attempt');
const client=createClient({chain:studionet,endpoint:RPC,account});
const journal={network:'Studionet',chain_id:61999,source_path:SOURCE,source_sha256:EXPECTED_SHA256,signer:account.address,attempted:new Date().toISOString(),broadcast_uncertain:true};
save(JOURNAL,journal);
console.log('EVENTSURE_V3_2_DEPLOY_ATTEMPT=STARTED');
const hash=await client.deployContract({code:code.toString('utf8'),args:[]});
requireTrue(/^0x[0-9a-fA-F]{64}$/.test(hash),'SDK returned invalid transaction hash');
journal.tx=hash;save(JOURNAL,journal);
console.log('EVENTSURE_V3_2_DEPLOY_TX='+hash);
const receipt=await client.waitForTransactionReceipt({hash,status:TransactionStatus.FINALIZED,retries:150});
const address=receipt?.data?.contract_address;
const execution=receipt?.consensus_data?.leader_receipt?.[0]?.execution_result;
requireTrue(/^0x[0-9a-fA-F]{40}$/.test(address??''),'Missing contract address in finalized receipt');
requireTrue(execution==='SUCCESS','Deployment finalized but did not execute successfully');
requireTrue(await rpc('gen_getTransactionStatus',[hash])==='FINALIZED','Transaction is not FINALIZED');
const returnedCode=await rpc('gen_getContractCode',[address]);
requireTrue(Buffer.from(returnedCode,'base64').equals(code),'Deployed source bytes are not identical');
const schema=await rpc('gen_getContractSchema',[address]);
requireTrue(Object.keys(schema?.methods??{}).length===14,'On-chain ABI must contain 14 public methods');
const info=await client.readContract({address,functionName:'contract_info',args:[]});
requireTrue(info?.version==='3.2.0'&&info?.admin==='NONE','On-chain contract identity mismatch');
const proof={network:'Studionet',chain_id:61999,source_path:SOURCE,source_sha256:EXPECTED_SHA256,signer:account.address,tx:hash,address,status:'FINALIZED',execution_result:'SUCCESS',abi_methods:14,source_parity:true,verified_at:new Date().toISOString()};
save(PROOF,proof);
journal.broadcast_uncertain=false;journal.status='FINALIZED';journal.address=address;save(JOURNAL,journal);
console.log('EVENTSURE_V3_2_DEPLOY=PASS');
console.log(JSON.stringify(proof));
