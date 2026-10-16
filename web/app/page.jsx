"use client";
import {useEffect,useState,useCallback} from "react";
import {CHAIN_ID,CHAIN_HEX,RPC,CONTRACT,SOURCE_SHA256,CANONICAL_EVENT,HISTORICAL_EXPLORATORY_EVENT,TX,short,validNewEvent,validEvidence,canFreeze,canAttest,canResolve} from "../lib/protocol.mjs";

const tabs=["OVERVIEW","EVENTS","WORKSPACE","AUDIT","PROVENANCE"];
const explorer="https://explorer-studio.genlayer.com";
const initial={id:"",title:"",requirement:"",rule:"",deadline:"",attestor:""};
function clock(v){return v?new Date(v).toLocaleString():"-"}
export default function Home(){
 const [tab,setTab]=useState("OVERVIEW");
 const [data,setData]=useState(null);
 const [selected,setSelected]=useState(CANONICAL_EVENT);
 const [loading,setLoading]=useState(true);
 const [busy,setBusy]=useState(false);
 const [wallet,setWallet]=useState("");
 const [notice,setNotice]=useState("");
 const [error,setError]=useState("");
 const [pending,setPending]=useState("");
 const [form,setForm]=useState(initial);
 const [evidence,setEvidence]=useState("");
 const [reference,setReference]=useState("");
 const refresh=useCallback(async()=>{
  setLoading(true);
  try{
   const result=await fetch("/api/state",{cache:"no-store"});
   const json=await result.json();
   if(!json.ok)throw Error(json.error||"On-chain read failed");
   setData(json);setError("");
  }catch(e){setError("Live chain readback unavailable: "+String(e));}
  finally{setLoading(false)}
 },[]);
 useEffect(()=>{refresh();const timer=setInterval(refresh,60000);return()=>clearInterval(timer)},[refresh]);
 const active=data?.events?.find(x=>x.event.event_id===selected)||data?.events?.[0];
 const event=active?.event,evidenceRecord=active?.evidence;
 const resolved=data?.events?.filter(x=>x.event.status==="RESOLVED").length||0;
 const supported=data?.events?.filter(x=>x.event.verdict==="ATTESTATION_SUPPORTED").length||0;
 const say=(message)=>{setNotice(message);setError("")};
 const connect=async()=>{
  try{
   if(typeof window==="undefined"||!window.ethereum)throw Error("Install a compatible EIP-1193 wallet to sign transactions.");
   const accounts=await window.ethereum.request({method:"eth_requestAccounts"});
   if(!accounts?.[0])throw Error("No account authorized");
   let chain=await window.ethereum.request({method:"eth_chainId"});
   if(parseInt(chain,16)!==CHAIN_ID){
    try{await window.ethereum.request({method:"wallet_switchEthereumChain",params:[{chainId:CHAIN_HEX}]})}
    catch(e){
     if(e.code!==4902)throw e;
     await window.ethereum.request({method:"wallet_addEthereumChain",params:[{chainId:CHAIN_HEX,chainName:"GenLayer Studionet",rpcUrls:[RPC],nativeCurrency:{name:"GEN",symbol:"GEN",decimals:18},blockExplorerUrls:[explorer]}]});
    }
    chain=await window.ethereum.request({method:"eth_chainId"});
    if(parseInt(chain,16)!==CHAIN_ID)throw Error("Wallet is not on Studionet 61999");
   }
   setWallet(accounts[0]);say("Wallet connected: "+short(accounts[0]));
  }catch(e){setError("Wallet connection failed: "+String(e.message||e))}
 };
 async function transact(method,args){
  setError("");setNotice("");setBusy(true);setPending("");
  let submittedHash="";
  try{
   if(!wallet||!window.ethereum)throw Error("Connect a wallet before signing.");
   const chain=await window.ethereum.request({method:"eth_chainId"});
   if(parseInt(chain,16)!==CHAIN_ID)throw Error("Wrong network. Switch to GenLayer Studionet.");
   const accounts=await window.ethereum.request({method:"eth_accounts"});
   if(accounts?.[0]?.toLowerCase()!==wallet.toLowerCase())throw Error("Wallet account changed; reconnect before signing.");
   const [{createClient},{studionet},{TransactionStatus}]=await Promise.all([import("genlayer-js"),import("genlayer-js/chains"),import("genlayer-js/types")]);
   const client=createClient({chain:studionet,endpoint:RPC,account:wallet,provider:window.ethereum});
   const hash=await client.writeContract({address:CONTRACT,functionName:method,args});
   submittedHash=hash;
   setPending(hash);setNotice("Submitted "+method+": "+hash+". Checking finality; do not resubmit.");
   await client.waitForTransactionReceipt({hash,status:TransactionStatus.FINALIZED,retries:150});
   const transaction=await client.getTransaction({hash});
   const receipts=transaction.consensus_data?.leader_receipt??[];
   const leader=receipts.find((entry)=>entry.mode==="leader");
   const validator=receipts.find((entry)=>entry.mode==="validator");
   if(transaction.statusName!=="FINALIZED"||transaction.result_name!=="MAJORITY_AGREE"||leader?.execution_result!=="SUCCESS"||validator?.vote!=="agree"||validator?.execution_result!=="SUCCESS")throw Error("Transaction has not reached finalized successful consensus. Inspect hash "+hash);
   say(method+" finalized with SUCCESS. "+hash);
   setPending("");await refresh();setTab("EVENTS");
  }catch(e){setError("Operation stopped: "+String(e.message||e)+(submittedHash?". Do not resubmit until transaction "+submittedHash+" is reconciled.":""))}
  finally{setBusy(false)}
 }
 function newID(){const arr=new Uint8Array(6);window.crypto.getRandomValues(arr);const id="EVS-"+Array.from(arr,x=>x.toString(16).padStart(2,"0")).join("").toUpperCase();setForm(v=>({...v,id}))}
 const create=async(e)=>{e.preventDefault();try{const value={...form,deadline:new Date(form.deadline).toISOString()};validNewEvent(value);await transact("create_event",[value.id,value.title,value.requirement,value.rule,value.deadline,value.attestor]);setSelected(value.id)}catch(e){setError(String(e.message||e))}};
 const attest=async(e)=>{e.preventDefault();try{if(!event||!canAttest(event,wallet,!!evidenceRecord))throw Error("Your wallet is not the authorized attestor or evidence is already committed");validEvidence(evidence,reference);await transact("submit_evidence",[event.event_id,evidence,reference])}catch(e){setError(String(e.message||e))}};
 return <div className="app">
  <aside className="sidebar"><a className="logo" onClick={()=>setTab("OVERVIEW")}><div className="logo-mark">E<span>.</span></div><div><strong>EventSure</strong><small>INTELLIGENT PROTOCOL</small></div></a>
   <div className="nav-title">COMMAND CENTER</div>
   <nav>{tabs.map((v,i)=><button key={v} className={v===tab?"selected":""} onClick={()=>setTab(v)}><span className="nav-icon">{["◫","▤","⌘","≡","◇"][i]}</span>{v}<span className="nav-arrow">→</span></button>)}</nav>
   <div className="sidebar-bottom"><div className="network-status"><span className="pulse"/> STUDIONET <b>61999</b></div><div className="sideline"><span>PROTOCOL RELEASE</span><b>v2.0.0</b></div><div className="sideline"><span>TRUST MODEL</span><b>ATTESTATION</b></div><p>Evidence-driven consensus. No independent proof of external-world truth.</p></div>
  </aside>
  <div className="work">
   <header className="topbar"><div><span className="crumb">EVENTSURE</span><span className="slash">/</span><span>{tab}</span></div><div className="top-actions"><span className="status"><i/> LIVE RPC</span><button className="ghost" disabled={loading} onClick={refresh}>{loading?"SYNCING":"↻ SYNC"}</button><button className="wallet" disabled={busy} onClick={connect}>{wallet?short(wallet):"CONNECT WALLET ↗"}</button></div></header>
   <main className="content">
    {error&&<div className="notification danger">{error}</div>}
    {notice&&<div className="notification ok">{notice}</div>}
    {pending&&<div className="notification warning">Transaction may be pending: <a href={explorer+"/tx/"+pending} target="_blank" rel="noreferrer">{pending}</a>. Do not resubmit until it is reconciled.</div>}
    {tab==="OVERVIEW"&&<><div className="eyebrow">THE GENLAYER INTELLIGENT CONTRACT</div><section className="hero"><div><h1>Truth is a claim.<br/><em>Consensus is proof.</em></h1><p>Define an immutable milestone. Commit authorized evidence. Let independent validators adjudicate the attestation against frozen rules.</p><div className="hero-actions"><button className="primary" onClick={()=>setTab("WORKSPACE")}>OPEN WORKSPACE <span>↗</span></button><a href={explorer+"/address/"+CONTRACT} target="_blank" rel="noreferrer" className="outline">VIEW CONTRACT ↗</a></div></div><div className="seal"><div className="ring"><span>ES / V2</span><b>VERIFIED<br/>ON-CHAIN</b><span>STUDIONET 61999</span></div></div></section>
     <div className="eyebrow sectionlabel">01 / NETWORK INTELLIGENCE <span>LIVE CONTRACT READBACK</span></div>
     <div className="metrics"><div><small>TOTAL MILESTONES</small><strong>{data?.totalEvents??"—"}</strong><span>Immutable event registrations</span></div><div><small>SHOWN RESOLVED</small><strong>{data?resolved:"—"}</strong><span>In displayed records</span></div><div><small>SHOWN SUPPORTED</small><strong>{data?supported:"—"}</strong><span>In displayed records</span></div><div><small>AUDIT RECORDS</small><strong>{data?.auditCount??"—"}</strong><span>Append-only actions</span></div></div><p className="subtitle">The canonical release case is {CANONICAL_EVENT}. The earlier exploratory case {HISTORICAL_EXPLORATORY_EVENT} remains visible in on-chain history, but its nine-method claim is excluded from this release qualification.</p>
     <div className="section-heading"><h2>Canonical qualification</h2><button onClick={()=>{setSelected(CANONICAL_EVENT);setTab("EVENTS")}}>EXPLORE DETAILS →</button></div>
     <div className="featured"><div><small>RELEASE / VERIFIED REFERENCE</small><h3>{data?.events?.find(x=>x.event.event_id===CANONICAL_EVENT)?.event.title||"Connecting to on-chain state"}</h3><p>{data?.events?.find(x=>x.event.event_id===CANONICAL_EVENT)?.event.requirement||"Synchronizing contract information"}</p></div><div className="outcome"><small>CONSENSUS OUTCOME</small><strong>{data?.events?.find(x=>x.event.event_id===CANONICAL_EVENT)?.event.verdict||"PENDING RPC"}</strong><span>Authenticated attestation, not independent external fact verification.</span></div></div>
    </>}
    {tab==="EVENTS"&&<><div className="eyebrow">02 / CONTRACT REGISTRY</div><div className="section-heading"><h1>Live milestones</h1><button onClick={()=>setTab("WORKSPACE")}>+ CREATE EVENT</button></div><p className="subtitle">The registry total is read from the deployed EventSure v2 contract. This view shows the canonical case and the latest additional milestone; the earlier exploratory nine-method case remains labeled historical and excluded from release qualification.</p><div className="event-layout"><div className="event-list">{data?.events?.map(({event:v})=><button className={v.event_id===event?.event_id?"current":""} key={v.event_id} onClick={()=>setSelected(v.event_id)}><small>{v.event_id===CANONICAL_EVENT?"CANONICAL RELEASE CASE":v.event_id===HISTORICAL_EXPLORATORY_EVENT?"HISTORICAL / EXPLORATORY":short(v.event_id)}</small><strong>{v.title}</strong><span>{v.status} / {v.verdict||"NOT RESOLVED"}</span></button>)}{!data&&<p>Loading registry...</p>}</div><div className="panel detail"><small>EVENT DETAILS</small>{event?<><h2>{event.title}</h2><div className="tag">{event.event_id===CANONICAL_EVENT?"CANONICAL RELEASE CASE":event.event_id===HISTORICAL_EXPLORATORY_EVENT?"HISTORICAL CASE ? EXCLUDED FROM RELEASE QUALIFICATION":event.verdict||event.status}</div><p>{event.requirement}</p><div className="fact"><label>EVENT ID</label><b>{event.event_id}</b></div><div className="fact"><label>CREATOR</label><b title={event.creator}>{short(event.creator)}</b></div><div className="fact"><label>ATTESTOR</label><b title={event.attestor}>{short(event.attestor)}</b></div><div className="fact"><label>DEADLINE</label><b>{clock(event.deadline)}</b></div><div className="fact"><label>RULE</label><b>{event.rule}</b></div><div className="fact"><label>EVIDENCE HASH</label><b title={evidenceRecord?.sha256}>{short(evidenceRecord?.sha256)}</b></div><div className="fact"><label>ASSESSMENT</label><b title={event.assessment_digest}>{short(event.assessment_digest)}</b></div><button className="primary wide" onClick={()=>setTab("WORKSPACE")}>OPEN ACTION WORKSPACE →</button></>:<p>Choose a milestone.</p>}</div></div></>}
    {tab==="WORKSPACE"&&<><div className="eyebrow">03 / EXECUTION TERMINAL</div><div className="section-heading"><h1>Action workspace</h1><span className="muted">{wallet?"WALLET "+short(wallet):"Connect wallet before signing"}</span></div><p className="subtitle">Four steps, one immutable lifecycle. Your wallet signs every state change; the site never requests private keys or seed phrases.</p>
      <div className="workspace-grid"><form className="panel form" onSubmit={create}><div className="step-title"><span>01</span><h2>Create milestone</h2></div><label>EVENT IDENTIFIER<div className="inline-input"><input required maxLength={80} value={form.id} onChange={e=>setForm(v=>({...v,id:e.target.value}))} placeholder="EVS-..." /><button type="button" onClick={newID}>GENERATE</button></div></label><label>TITLE<input required maxLength={120} value={form.title} onChange={e=>setForm(v=>({...v,title:e.target.value}))} placeholder="Milestone release title" /></label><label>FROZEN REQUIREMENT<textarea required rows={4} value={form.requirement} onChange={e=>setForm(v=>({...v,requirement:e.target.value}))} placeholder="Describe the objective requirement to evaluate." /></label><label>ADJUDICATION RULE<textarea required rows={3} value={form.rule} onChange={e=>setForm(v=>({...v,rule:e.target.value}))} placeholder="State the semantic rule and required evidence." /></label><label>AUTHORIZED ATTESTOR<input required value={form.attestor} onChange={e=>setForm(v=>({...v,attestor:e.target.value}))} placeholder="0x..." /></label><label>DEADLINE<input type="datetime-local" required value={form.deadline} onChange={e=>setForm(v=>({...v,deadline:e.target.value}))} /></label><button className="primary wide" type="submit" disabled={busy||!wallet}>SIGN & CREATE EVENT ↗</button></form>
      <div className="right-steps"><div className="panel"><div className="step-title"><span>02</span><h2>Freeze the specification</h2></div><p>Select a draft milestone below. Only the wallet that created it can freeze its rules.</p><select value={selected} onChange={e=>setSelected(e.target.value)}>{data?.events?.map(x=><option key={x.event.event_id} value={x.event.event_id}>{x.event.title} ({x.event.status})</option>)}</select><div className="substatus">CURRENT STATE: <b>{event?.status||"NONE"}</b></div><button className="outline wide" disabled={busy||!canFreeze(event,wallet)} onClick={()=>transact("freeze_event",[event.event_id])}>SIGN & FREEZE EVENT →</button></div>
       <form className="panel" onSubmit={attest}><div className="step-title"><span>03</span><h2>Submit attested evidence</h2></div><p>Only the frozen event's configured attestor can commit one evidence record before the deadline.</p><label>EVIDENCE CONTENT<textarea rows={4} value={evidence} onChange={e=>setEvidence(e.target.value)} placeholder="Detailed, factual evidence submitted by the attestor." /></label><label>DOCUMENT REFERENCE<input value={reference} onChange={e=>setReference(e.target.value)} placeholder="Content-addressed URI, reference or URL (optional)" /></label><button className="outline wide" disabled={busy||!canAttest(event,wallet,!!evidenceRecord)} type="submit">SIGN & COMMIT EVIDENCE →</button></form>
       <div className="panel"><div className="step-title"><span>04</span><h2>Request validator resolution</h2></div><p>Independent GenLayer validators evaluate the authenticated evidence against the frozen requirement. Anyone may trigger resolution once admissible evidence exists.</p><button className="primary wide" disabled={busy||!wallet||!canResolve(event,!!evidenceRecord)} onClick={()=>transact("resolve",[event.event_id])}>RUN CONSENSUS ASSESSMENT ↗</button><div className="substatus">TRUST MODE: <b>ATTESTATION ONLY</b></div></div>
      </div></div>
    </>}
    {tab==="AUDIT"&&<><div className="eyebrow">04 / IMMUTABLE ACTIONS</div><div className="section-heading"><h1>Consensus audit trail</h1><span className="muted">{data?.auditCount??"—"} TOTAL ENTRIES</span></div><p className="subtitle">Showing the latest four entries. Each row is read directly from its original append-only contract index; no locally generated success records.</p><div className="audit-list"><div className="audit-head"><span>INDEX</span><span>ACTION</span><span>EVENT</span><span>CHAIN TIMESTAMP</span></div>{data?.audit?.map((a,i)=><div className="audit-row" key={a.index??i}><span className="lime">{String((a.index??i)+1).padStart(2,"0")}</span><b>{a.action}</b><button onClick={()=>{setSelected(a.event_id);setTab("EVENTS")}}>{short(a.event_id)}</button><span>{clock(a.timestamp)}</span></div>)}</div></>}
    {tab==="PROVENANCE"&&<><div className="eyebrow">05 / RELEASE INTEGRITY</div><div className="section-heading"><h1>Provable by design.</h1></div><p className="subtitle">Contract code is checked by SHA-256 before it is delivered. Qualification hashes link to actual GenLayer transactions.</p><div className="proof-grid"><div className="panel"><small>CANONICAL V2 CONTRACT</small><h2 className="mono">{CONTRACT}</h2><p>Chain ID 61999. Independent event creators. Distinct authorized attestors. Immutable evidence and bounded semantic adjudication.</p><a href="/api/source" className="primary inline-btn">DOWNLOAD VERIFIED SOURCE ↗</a></div><div className="panel"><small>DEPLOYED SOURCE SHA-256</small><h2 className="mono">{SOURCE_SHA256}</h2><p>Hash checked against the exact bytes served by the GenLayer RPC.</p><a className="outline inline-btn" href={explorer+"/address/"+CONTRACT} target="_blank" rel="noreferrer">INSPECT EXPLORER ↗</a></div></div><div className="section-heading"><h2>Final qualification transactions</h2></div><div className="tx-list">{Object.entries(TX).map(([name,hash])=><a href={explorer+"/tx/"+hash} target="_blank" rel="noreferrer" key={name}><b>{name.toUpperCase()}</b><span className="mono">{hash}</span><span>↗</span></a>)}</div><div className="notification info">TRUST BOUNDARY: The verdict reports validator agreement about an authenticated attestor claim. It is not independently verified external-world truth.</div></>}
   </main>
   <footer><span>EVENTSURE / INTELLIGENT ATTESTATION PROTOCOL</span><span>{data?.asOf?"LAST RPC READ "+clock(data.asOf):"LIVE READ PENDING"}</span><span>STUDIONET 61999</span></footer>
  </div>
 </div>;
}

