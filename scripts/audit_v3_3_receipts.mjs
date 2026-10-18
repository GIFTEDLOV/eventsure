/** Read-only audit: validator votes on historical V3.3 transactions. */
import {createClient} from "genlayer-js";
import {studionet} from "genlayer-js/chains";
import {TransactionStatus} from "genlayer-js/types";
const client=createClient({chain:studionet,endpoint:"https://studio.genlayer.com/api"});
const txs=[
 ["positive create","0x60277b68d7ceb22f4c4d03d2749f1ffa5cf9eddfa57e5b1ddca08ca400d8c723"],
 ["positive freeze","0x73b07c22541ae8382368ac672ce5c6201b10cd9a4dfe819243e4aae0411230e9"],
 ["positive resolve","0xe4aa025673ebc30c22a9771da92ebab5c29c7ca4b6ce7b700ed45ece8682da53"],
 ["conservative create","0xa61ab77558acad81b766faa6e7cb1775136bb2e529f315c562a01441b748fa12"],
 ["conservative freeze","0xe694ee8b19d612fe6f3154a5bb554e794a826d9ba3f3dc1be1ed2d2e36730edd"],
 ["conservative resolve","0x35486954ec65ba41f2d2bb9ced83102af92b1fe9717e1683d4cd2b7ce2f60469"],
 ["public challenge","0xe3b848a2b64ae6d679122e056d9261b6dc84a233244f4c54e364a2b01824a1da"]
];
let success=0;
for(const [name,hash] of txs){
 const r=await client.waitForTransactionReceipt({hash,status:TransactionStatus.FINALIZED,retries:3});
 const votes=Object.values(r?.consensus_data?.votes??{});
 const agreed=votes.filter(v=>v==="agree").length;
 const disagreed=votes.filter(v=>v==="disagree").length;
 const idle=votes.filter(v=>v==="idle").length;
 const execution=r?.consensus_data?.leader_receipt?.[0]?.execution_result??"UNKNOWN";
 console.log(JSON.stringify({name,hash,execution,agreed,disagreed,idle}));
 const quorum=Math.max(2,Math.floor(votes.length/2)+1);
 if(execution!=="SUCCESS"||agreed<quorum)
  throw Error("Live GenLayer receipt violates majority wallet safety gate for "+name+" (agree="+agreed+", committee="+votes.length+")");
 success++;
}
console.log("EVENTSURE_V33_REAL_RECEIPT_CONSENSUS=PASS "+success+"/"+txs.length);
