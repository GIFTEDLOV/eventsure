import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";

const root = fileURLToPath(new URL("../", import.meta.url));
const manifestPath = path.join(root, "deployments", "STUDIONET_V2_PROOF.json");
const proof = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const source = fs.readFileSync(path.join(root, proof.source_path));
const sourceSha256 = crypto.createHash("sha256").update(source).digest("hex");
const expectedMethods = [
  "contract_info",
  "create_event",
  "freeze_event",
  "get_audit",
  "get_audit_count",
  "get_event",
  "get_event_ids",
  "get_evidence",
  "resolve",
  "submit_evidence",
].sort();

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(sourceSha256 === proof.source_sha256, "Frozen source fingerprint mismatch");
assert(source.byteLength === proof.source_bytes, "Frozen source byte length mismatch");
assert(proof.chain_id === 61999, "Manifest chain ID is not Studionet");
assert(proof.rpc === "https://studio.genlayer.com/api", "Manifest RPC is not canonical Studionet");
assert(proof.contract_address === "0x5386AbB113Fb21868982a0d382E6abA6244DE617", "Unexpected canonical contract address");
assert(Object.keys(proof.transactions).length === 5, "Expected deployment and four qualification transaction hashes");

const client = createClient({ chain: studionet, endpoint: proof.rpc });
const chainHex = await client.request({ method: "eth_chainId", params: [] });
const chainId = Number.parseInt(chainHex, 16);
assert(chainId === proof.chain_id, `RPC chain ID mismatch: ${chainId}`);

const deployedCode = await client.getContractCode(proof.contract_address);
const deployedSource = Buffer.from(deployedCode, "utf8");
assert(deployedSource.equals(source), "On-chain source bytes differ from the frozen repository artifact");
const schema = await client.getContractSchema(proof.contract_address);
const methods = Object.keys(schema.methods ?? {}).sort();
assert(JSON.stringify(methods) === JSON.stringify(expectedMethods), "On-chain ABI method names differ from the expected ten-method interface");
assert(methods.length === proof.abi_method_count, "On-chain ABI method count differs from the manifest");

const event = await client.readContract({
  address: proof.contract_address,
  functionName: "get_event",
  args: [proof.event_id],
});
const evidence = await client.readContract({
  address: proof.contract_address,
  functionName: "get_evidence",
  args: [proof.event_id],
});
const auditCount = Number(await client.readContract({
  address: proof.contract_address,
  functionName: "get_audit_count",
  args: [],
}));

assert(event.event_id === proof.event_id, "Canonical event ID mismatch");
assert(event.status === "RESOLVED", "Canonical event is not resolved");
assert(event.verdict === proof.recorded_verdict, "Canonical verdict mismatch");
assert(event.chain_id === chainId, "Canonical event chain identity mismatch");
assert(event.attestor?.toLowerCase() === evidence.attestor?.toLowerCase(), "Event and evidence attestors differ");
assert(event.requirement && event.rule, "Frozen event requirement or rule is missing");
assert(new Date(event.deadline).getTime() > new Date(evidence.timestamp).getTime(), "Evidence was not submitted before the frozen deadline");
assert(evidence.event_id === proof.event_id, "Evidence event ID mismatch");
assert(evidence.sha256 === proof.evidence_sha256, "Evidence SHA-256 differs from the manifest");
assert(evidence.bytes === Buffer.byteLength(evidence.content, "utf8"), "Evidence UTF-8 byte length mismatch");
assert(crypto.createHash("sha256").update(evidence.content, "utf8").digest("hex") === evidence.sha256, "Stored evidence content does not match its SHA-256");
assert(evidence.sequence === 1, "Canonical evidence sequence is not the first submission");
assert(event.assessment?.event_id === proof.event_id, "Assessment event identity mismatch");
assert(event.assessment?.chain_id === chainId, "Assessment chain identity mismatch");
assert(event.assessment?.evidence_sha256 === evidence.sha256, "Assessment evidence digest mismatch");
assert(event.assessment?.evidence_bytes === evidence.bytes, "Assessment evidence length mismatch");
assert(event.assessment?.evidence_timestamp === evidence.timestamp, "Assessment timestamp differs from the stored evidence");
assert(event.assessment?.technical_status === "OK", "Assessment technical status is not OK");
assert(event.assessment?.supported === true, "Assessment does not support the attested claim");
assert(event.assessment_digest, "Assessment digest is missing");

const canonicalAudit = [];
for (let index = 0; index < auditCount; index += 1) {
  const entry = await client.readContract({
    address: proof.contract_address,
    functionName: "get_audit",
    args: [index],
  });
  if (entry.event_id === proof.event_id) canonicalAudit.push(entry);
}
const actions = canonicalAudit.map((entry) => entry.action);
const expectedActions = ["CREATED", "FROZEN", "ATTESTED", "RESOLVED"];
assert(JSON.stringify(actions) === JSON.stringify(expectedActions), "Canonical audit is not exactly the four append-only lifecycle actions");
assert(canonicalAudit.every((entry, index) => index === 0 || new Date(entry.timestamp) > new Date(canonicalAudit[index - 1].timestamp)), "Canonical audit timestamps are not strictly increasing");

const transactionResults = [];
for (const [stage, hash] of Object.entries(proof.transactions)) {
  const receipt = await client.waitForTransactionReceipt({
    hash,
    status: TransactionStatus.FINALIZED,
    interval: 250,
    retries: 4,
  });
  const transaction = await client.getTransaction({ hash });
  assert(transaction.statusName === "FINALIZED", `${stage} transaction is not stored as FINALIZED`);
  assert(transaction.recipient?.toLowerCase() === proof.contract_address.toLowerCase(), `${stage} transaction is for a different contract`);
  assert(transaction.result_name === "MAJORITY_AGREE", `${stage} transaction did not reach majority agreement`);
  const receipts = transaction.consensus_data?.leader_receipt ?? [];
  const leader = receipts.find((entry) => entry.mode === "leader");
  const validator = receipts.find((entry) => entry.mode === "validator");
  assert(leader?.execution_result === "SUCCESS", `${stage} leader execution did not succeed`);
  assert(validator?.vote === "agree", `${stage} validator vote did not agree`);
  assert(validator?.execution_result === "SUCCESS", `${stage} validator execution did not succeed`);
  if (stage === "resolve") {
    const readableOutput = leader.eq_outputs?.["0"]?.payload?.readable;
    assert(typeof readableOutput === "string", "Resolve receipt is missing the validator-consensus assessment output");
    const assessmentOutput = JSON.parse(JSON.parse(readableOutput));
    assert(assessmentOutput.event_id === proof.event_id, "Consensus assessment output event identity mismatch");
    assert(assessmentOutput.chain_id === chainId, "Consensus assessment output chain identity mismatch");
    assert(assessmentOutput.evidence_sha256 === evidence.sha256, "Consensus assessment output evidence hash mismatch");
    assert(assessmentOutput.evidence_bytes === evidence.bytes, "Consensus assessment output evidence length mismatch");
    assert(assessmentOutput.evidence_timestamp === evidence.timestamp, "Consensus assessment output evidence timestamp mismatch");
    assert(assessmentOutput.technical_status === "OK", "Consensus assessment output has a failing technical status");
    assert(assessmentOutput.supported === true, "Consensus assessment output does not support the attested claim");
    assert(assessmentOutput.context_digest === event.assessment.context_digest, "Consensus assessment context digest differs from canonical state");
  }
  assert(receipt, `${stage} transaction finalized receipt is missing`);
  transactionResults.push({
    stage,
    hash,
    status: transaction.statusName,
    consensus: transaction.result_name,
    leaderExecution: leader.execution_result,
    validatorVote: validator.vote,
    validatorExecution: validator.execution_result,
  });
}

console.log(JSON.stringify({
  GO: true,
  chainId,
  sdk: "genlayer-js@1.1.8",
  sourceSha256,
  sourceBytes: source.byteLength,
  abiMethods: methods,
  contract: proof.contract_address,
  eventId: proof.event_id,
  status: event.status,
  verdict: event.verdict,
  attestor: evidence.attestor,
  deadline: event.deadline,
  evidenceTimestamp: evidence.timestamp,
  evidenceSha256: evidence.sha256,
  evidenceBytes: evidence.bytes,
  assessmentDigest: event.assessment_digest,
  auditCount,
  canonicalAuditActions: actions,
  transactions: transactionResults,
}, null, 2));
