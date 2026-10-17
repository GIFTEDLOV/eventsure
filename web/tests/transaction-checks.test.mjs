import {test} from "node:test";
import assert from "node:assert/strict";
import {verifyConsensusReceipt,verifyCaseReadback,EXPECTED_CASE_STATES} from "../lib/transaction-checks.mjs";
const receipt=(votes,execution_result="SUCCESS")=>({consensus_data:{leader_receipt:[{execution_result}],votes}});
test("valid majority agreement with idle validators passes",()=>{
 const x=verifyConsensusReceipt(receipt({a:"agree",b:"agree",c:"agree",d:"idle"}));
 assert.equal(x.agree,3);
});
test("minority dissent is acceptable when GenLayer finalizes majority",()=>{
 const vote=verifyConsensusReceipt(receipt({a:"agree",b:"agree",c:"agree",d:"disagree",e:"disagree"}));
 assert.equal(vote.agree,3);assert.equal(vote.disagree,2);assert.equal(vote.quorum,3);
});
test("rejects majority dissent despite successful leader",()=>{
 assert.throws(()=>verifyConsensusReceipt(receipt({a:"agree",b:"agree",c:"disagree",d:"disagree",e:"disagree"})),/Insufficient/);
});
test("rejects absent validator votes",()=>assert.throws(()=>verifyConsensusReceipt(receipt({})),/No validator/));
test("rejects insufficient agreeing validators",()=>assert.throws(()=>verifyConsensusReceipt(receipt({a:"agree",b:"idle"})),/Insufficient/));
test("rejects error leader execution",()=>assert.throws(()=>verifyConsensusReceipt(receipt({a:"agree",b:"agree"},"ERROR")),/did not execute/));
test("rejects missing receipt",()=>assert.throws(()=>verifyConsensusReceipt(undefined),/did not execute/));
test("all lifecycle states must be recognized",()=>assert.deepEqual(Object.keys(EXPECTED_CASE_STATES).sort(),[
 "create_case","freeze_case","attest","resolve_case","challenge_case","reconsider_case","finalize_case"
].sort()));
for(const [method,state] of Object.entries(EXPECTED_CASE_STATES)){
 test(method+" confirms exact on-chain case",()=>{
  const record={id:"CASE-999",state,decision:"VERIFIED",finalized_at:"2026-10-19T00:00:00Z"};
  assert.equal(verifyCaseReadback(method,record,"CASE-999"),record);
 });
 test(method+" rejects unmodified or mismatched case",()=>{
  assert.throws(()=>verifyCaseReadback(method,{id:"CASE-999",state:"UNRELATED"},"CASE-999"),/readback/);
  assert.throws(()=>verifyCaseReadback(method,{id:"OTHER",state},"CASE-999"),/readback/);
 });
}
test("resolution without semantic decision rejected",()=>assert.throws(()=>verifyCaseReadback("resolve_case",{id:"CASE-999",state:"PRELIMINARY",decision:""},"CASE-999"),/semantic decision/));
test("finalization without timestamp rejected",()=>assert.throws(()=>verifyCaseReadback("finalize_case",{id:"CASE-999",state:"FINALIZED",decision:"VERIFIED"},"CASE-999"),/timestamp/));
test("unsupported wallet write method rejected",()=>assert.throws(()=>verifyCaseReadback("upgrade",{id:"CASE-999",state:"FROZEN"},"CASE-999"),/Unsupported/));
