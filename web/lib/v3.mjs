export const CONTRACT="0x13Bc702936d8d7Bd5880d4A16119690149D3D4c7";
export const CHAIN_ID=61999;
export const CHAIN_HEX="0xf22f";
export const RPC="https://studio.genlayer.com/api";
export const HASH="0fe025b631642094a3f86d49b6d928ba76a00c1af1102a2699036fb959a97acb";
export const EXPLORER="https://explorer-studio.genlayer.com";
export const QUALIFICATION="EVS-WEB-V3-1-20261016";
export const short=v=>v?String(v).slice(0,7)+"..."+String(v).slice(-4):"—";
export const humanDate=v=>v?new Date(v).toLocaleString():"—";
export function validateCase(v){
 if(!/^[A-Za-z0-9_:.-]{5,80}$/.test(v.id||""))throw Error("Case ID must be 5–80 ASCII-safe characters.");
 if((v.title||"").length<4||(v.title||"").length>120)throw Error("Title must have 4–120 characters.");
 if((v.question||"").length<16||(v.question||"").length>1200)throw Error("Question must have 16–1200 characters.");
 if((v.rule||"").length<16||(v.rule||"").length>1200)throw Error("Verification rule must have 16–1200 characters.");
 if(!v.deadline||!Number.isFinite(Date.parse(v.deadline))||Date.parse(v.deadline)<=Date.now())throw Error("Deadline must be in the future.");
 const urls=(v.sources||[]).map(s=>s.trim()).filter(Boolean);
 if(urls.length<2||urls.length>3)throw Error("Provide 2–3 independent public sources.");
 const hosts=urls.map(u=>{let p;try{p=new URL(u)}catch{throw Error("Invalid source URL.")}if(p.protocol!=="https:"||p.username||p.password||p.port||p.hash||p.pathname==="/")throw Error("Sources require public HTTPS document URLs without custom ports.");if(!/^[a-z0-9][a-z0-9.-]{2,180}\.[a-z]{2,24}$/.test(p.hostname)||/localhost|\.local$|\.internal$|metadata/.test(p.hostname))throw Error("Source hostname must be public.");return p.hostname==="github.com"||p.hostname.endsWith(".github.com")||p.hostname==="githubusercontent.com"||p.hostname.endsWith(".githubusercontent.com")?"github":p.hostname;});
 if(new Set(hosts).size!==hosts.length)throw Error("Sources must come from distinct hosts.");
 const att=(v.attestors||[]).map(s=>s.trim()).filter(Boolean);
 if(att.length>5||new Set(att.map(s=>s.toLowerCase())).size!==att.length||att.some(s=>!/^0x[a-f0-9]{40}$/i.test(s)||/^0x0{40}$/i.test(s)))throw Error("Provide up to 5 unique valid attestor wallets.");
 const quorum=Number(v.quorum||0);
 if(!Number.isInteger(quorum)||quorum<0||quorum>att.length)throw Error("Invalid attestor quorum.");
 return {id:v.id,title:v.title,question:v.question,rule:v.rule,deadline:new Date(v.deadline).toISOString(),urls,attestors:att,quorum};
}
export const canFreeze=(c,w)=>Boolean(c&&w&&c.state==="DRAFT"&&c.creator?.toLowerCase()===w.toLowerCase()&&Date.parse(c.deadline)>Date.now());
export const canAttest=(c,w)=>Boolean(c&&w&&c.state==="FROZEN"&&c.attestors?.includes(w.toLowerCase())&&!c.attestation_ids?.includes(w.toLowerCase())&&Date.parse(c.deadline)>=Date.now());
export const canResolve=c=>Boolean(c&&c.state==="FROZEN"&&Date.parse(c.deadline)<=Date.now()&&c.attestation_count>=c.quorum);
export const canChallenge=c=>Boolean(c&&c.state==="PRELIMINARY"&&c.challenge_count===0&&Date.parse(c.challenge_deadline)>Date.now());
export const canReconsider=c=>Boolean(c&&c.state==="CHALLENGED");
export const canFinalize=c=>Boolean(c&&c.state==="PRELIMINARY"&&Date.parse(c.challenge_deadline)<=Date.now());

