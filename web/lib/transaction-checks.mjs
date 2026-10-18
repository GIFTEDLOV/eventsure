/** Fail-closed receipt and contract readback checks for user-signed writes. */
export const EXPECTED_CASE_STATES=Object.freeze({
 create_case:"DRAFT",
 freeze_case:"FROZEN",
 attest:"FROZEN",
 resolve_case:"PRELIMINARY",
 challenge_case:"CHALLENGED",
 reconsider_case:"PRELIMINARY",
 finalize_case:"FINALIZED"
});
export function verifyConsensusReceipt(receipt) {
 const leader=receipt?.consensus_data?.leader_receipt?.[0]?.execution_result;
 if(leader!=="SUCCESS")throw Error("Transaction did not execute successfully under GenLayer consensus.");
 const votes=Object.values(receipt?.consensus_data?.votes??{});
 if(!votes.length)throw Error("No validator votes in receipt. Reconcile transaction before retrying.");
 const agrees=votes.filter(v=>v==="agree").length;
 const disagrees=votes.filter(v=>v==="disagree").length;
 // GenLayer can FINALIZE a transaction with a validator majority even if a
 // minority votes disagree (observed 3 agree / 2 disagree on a real V3.3
 // VERIFIED semantic resolution). Never demand unanimity.
 const quorum=Math.max(2,Math.floor(votes.length/2)+1);
 if(agrees<quorum)
  throw Error("Insufficient agreeing validators: "+agrees+"/"+votes.length+"; quorum "+quorum+". Inspect transaction.");
 return {agree:agrees,disagree:disagrees,quorum,unresponsive:votes.filter(v=>v==="idle").length};
}
export function verifyCaseReadback(method,record,id){
 const expected=EXPECTED_CASE_STATES[method];
 if(!expected)throw Error("Unsupported contract write method: "+method);
 if(!record||record.id!==id||record.state!==expected)
  throw Error("On-chain case readback did not reach "+expected+" after "+method+". Inspect transaction before retry.");
 if(method==="resolve_case"||method==="reconsider_case"){
  if(!["VERIFIED","INCONCLUSIVE"].includes(record.decision))
   throw Error("On-chain semantic decision missing after "+method+".");
 }
 if(method==="finalize_case"&&!record.finalized_at)
  throw Error("Finalization timestamp missing from on-chain record.");
 return record;
}
