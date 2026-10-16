import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const manifestPath = path.join(root, "deployments", "STUDIONET_V2_PROOF.json");
const proof = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const sourcePath = path.join(root, proof.source_path);
const source = fs.readFileSync(sourcePath);
const expectedTransactions = {
  deploy: "0xededdcf9eb528cb298111fddbde7923abfd2e315de29e4b1addf5c41b3ec365a",
  create: "0xcbd1da087c8046a79fa08357929e539e5b5af11355d3d292bc1e32cf8c9f0b2d",
  freeze: "0xd25ce16e08af67c9472d21f4e45751c069a587b66e17b5868c6174d4c07e4c09",
  attest: "0x0c2b3e19d2d1c948751990be907807d929475e4662c143dc4df43795cab2fb21",
  resolve: "0xc20a0e4b03a74e3e7aa1b4862f7a744e460fe1fe142d349420953bd2b0a36650",
};
const expectedSourceSha256 = "1840b0ff3cbb5b243052c5e52d1dda871f52570968eb3dd065351733f99a5c14";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(proof.project === "EventSure v2", "Unexpected project identity");
assert(proof.network === "studionet", "Manifest network must remain Studionet");
assert(proof.rpc === "https://studio.genlayer.com/api", "Unexpected Studionet RPC");
assert(proof.chain_id === 61999, "Unexpected chain ID");
assert(proof.contract_address === "0x5386AbB113Fb21868982a0d382E6abA6244DE617", "Unexpected canonical contract address");
assert(proof.source_path === "contracts/EventSureV2.py", "Unexpected frozen source path");
assert(proof.source_sha256 === expectedSourceSha256, "Manifest source fingerprint differs from the release fingerprint");
assert(crypto.createHash("sha256").update(source).digest("hex") === proof.source_sha256, "Frozen source hash mismatch");
assert(source.byteLength === proof.source_bytes, "Frozen source byte length mismatch");
assert(proof.abi_method_count === 10, "Manifest ABI method count mismatch");
assert(proof.event_id === "EVS-HARDENED-V2-FINAL-20261016", "Unexpected canonical qualification event");
assert(proof.evidence_sha256 === "18387b3a1f87e73df5336f06d0897c538b0aa88404606300f1b006c4091ed3fd", "Unexpected evidence fingerprint");
assert(proof.recorded_verdict === "ATTESTATION_SUPPORTED", "Unexpected recorded verdict");
assert(proof.trust_model.includes("no independent external fact verification"), "Manifest is missing the attestation trust limitation");
assert(proof.source_origin === "cloud reconstruction, not Windows EventSure initial source", "Release provenance is ambiguous");
assert(JSON.stringify(proof.transactions) === JSON.stringify(expectedTransactions), "Transaction map differs from the verified canonical hashes");
assert(Object.values(proof.transactions).every((hash) => /^0x[0-9a-f]{64}$/.test(hash)), "Malformed transaction hash");
assert(new Set(Object.values(proof.transactions)).size === 5, "Duplicate transaction hashes");

console.log("MANIFEST_PARITY=PASS");
