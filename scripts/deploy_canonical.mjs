import fs from "node:fs";
import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {createAccount,createClient} from "genlayer-js";
import {studionet} from "genlayer-js/chains";
import {TransactionStatus} from "genlayer-js/types";
const root=fileURLToPath(new URL("../",import.meta.url));
const manifest=JSON.parse(fs.readFileSync(path.join(root,"deployments","STUDIONET_V2_PROOF.json"),"utf8"));
const expected=manifest.source_sha256;
const code=fs.readFileSync(path.join(root,manifest.source_path));
if(crypto.createHash("sha256").update(code).digest("hex")!==expected)throw Error("Frozen source mismatch");
if(process.env.EVENTSURE_APPROVE_NEW_DEPLOY!=="EXPLICITLY_AUTHORIZED")throw Error("Deployment disabled: explicit approval environment guard missing.");
const secret=process.env.EVENTSURE_PRIVATE_KEY;
if(!secret||!/^0x[a-fA-F0-9]{64}$/.test(secret))throw Error("Missing secure signing key; do not commit secrets.");
const account=createAccount(secret);
const client=createClient({chain:studionet,endpoint:"https://studio.genlayer.com/api",account});
const jpath=path.join(root,"deployments","pending-private-deployment.json");
let j=fs.existsSync(jpath)?JSON.parse(fs.readFileSync(jpath,"utf8")):{source_sha256:expected,network:"studionet",chain_id:61999,signer:account.address};
if(j.source_sha256!==expected||j.signer!==account.address)throw Error("Journal identity mismatch");
const save=()=>fs.writeFileSync(jpath,JSON.stringify(j,null,2),{mode:0o600});
if(j.attempted&&!j.tx)throw Error("Prior broadcast uncertain: reconcile nonce/history manually, no retry.");
if(!j.tx){j.attempted=new Date().toISOString();save();j.tx=await client.deployContract({code:code.toString("utf8"),args:[]});save();}
const receipt=await client.waitForTransactionReceipt({hash:j.tx,status:TransactionStatus.FINALIZED,retries:150});
j.receipt=receipt;save();
const success=receipt.consensus_data?.leader_receipt?.[0]?.execution_result==="SUCCESS"&&receipt.data?.contract_address;
if(!success)throw Error("Deployment did not succeed; inspect journal");
console.log(JSON.stringify({tx:j.tx,address:receipt.data.contract_address,status:"FINALIZED",source_sha256:expected}));

