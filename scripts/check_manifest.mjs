import fs from "node:fs";
import crypto from "node:crypto";
const p=JSON.parse(fs.readFileSync(new URL("../deployments/STUDIONET_V2_PROOF.json",import.meta.url),"utf8"));
const code=fs.readFileSync(new URL("../contracts/EventSureV2.py",import.meta.url));
if(crypto.createHash("sha256").update(code).digest("hex")!==p.source_sha256)throw new Error("Frozen source hash mismatch");
if(code.length!==p.source_bytes)throw new Error("Frozen source byte length mismatch");
if(p.chain_id!==61999||p.abi_method_count!==10)throw new Error("Network/ABI manifest mismatch");
if(Object.keys(p.transactions).length!==5)throw new Error("Missing final tx hashes");
console.log("MANIFEST_PARITY=PASS");

