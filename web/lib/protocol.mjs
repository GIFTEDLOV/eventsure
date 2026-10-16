export const CHAIN_ID=61999;
export const CHAIN_HEX="0xf22f";
export const RPC="https://studio.genlayer.com/api";
export const CONTRACT="0x5386AbB113Fb21868982a0d382E6abA6244DE617";
export const SOURCE_SHA256="1840b0ff3cbb5b243052c5e52d1dda871f52570968eb3dd065351733f99a5c14";
export const CANONICAL_EVENT="EVS-HARDENED-V2-FINAL-20261016";
export const TX={
deploy:"0xededdcf9eb528cb298111fddbde7923abfd2e315de29e4b1addf5c41b3ec365a",
create:"0xcbd1da087c8046a79fa08357929e539e5b5af11355d3d292bc1e32cf8c9f0b2d",
freeze:"0xd25ce16e08af67c9472d21f4e45751c069a587b66e17b5868c6174d4c07e4c09",
attest:"0x0c2b3e19d2d1c948751990be907807d929475e4662c143dc4df43795cab2fb21",
resolve:"0xc20a0e4b03a74e3e7aa1b4862f7a744e460fe1fe142d349420953bd2b0a36650"
};
export const bytes=(s)=>new TextEncoder().encode(s).length;
export function validNewEvent({id,title,requirement,rule,deadline,attestor}){
 if(!/^[A-Za-z0-9_:.-]{1,80}$/.test(id||""))throw Error("Event ID must be 1-80 ASCII letters, numbers, - _ : .");
 if(!title || title.length>120)throw Error("Title length must be 1-120.");
 if(!requirement||requirement.length<8||requirement.length>2500)throw Error("Requirement length must be 8-2500.");
 if(!rule||rule.length<8||rule.length>1500)throw Error("Rule length must be 8-1500.");
 if(!/^0x[a-fA-F0-9]{40}$/.test(attestor||"")||/^0x0{40}$/i.test(attestor))throw Error("Choose a valid, nonzero attestor address.");
 if(!deadline || !Number.isFinite(Date.parse(deadline)) || Date.parse(deadline)<=Date.now())throw Error("Deadline must be in the future.");
 return true;
}
export function validEvidence(content,reference){
 if(bytes(content||"")<32||bytes(content)>12000)throw Error("Evidence must be 32-12000 UTF-8 bytes.");
 if((reference||"").length>500)throw Error("Reference must be <=500 characters.");
 return true;
}
export function canFreeze(event,wallet){return Boolean(event?.status==="DRAFT" && wallet && event?.creator?.toLowerCase()===wallet.toLowerCase() && Date.parse(event?.deadline)>Date.now());}
export function canAttest(event,wallet,hasEvidence){return Boolean(event?.status==="FROZEN"&&wallet&&event.attestor?.toLowerCase()===wallet.toLowerCase()&&!hasEvidence&&Date.parse(event.deadline)>=Date.now());}
export function canResolve(event,hasEvidence){return Boolean(event?.status==="FROZEN"&&hasEvidence);}
export function short(s){return s?String(s).slice(0,9)+"..."+String(s).slice(-5):"—";}

