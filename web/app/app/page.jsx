"use client";
import Link from "next/link";
import {useState,useEffect,useCallback} from "react";
import "./console.css";
import {CONTRACT,CHAIN_ID,CHAIN_HEX,RPC,HASH,EXPLORER,QUALIFICATION,short,humanDate,
 validateCase,canFreeze,canAttest,canResolve,canChallenge,canReconsider,canFinalize} from "../../lib/v3.mjs";

const TABS=[["overview","Overview","▦"],["registry","Case registry","▤"],["create","Create a case","⊕"],["activity","Activity log","≡"],["developers","Developers","⌘"]];
const initial=()=>({id:"",title:"",question:"",rule:"",deadline:"",sources:["",""],attestors:"",quorum:0});
const phase=c=>c?.state==="FINALIZED"?"FINALIZED":c?.state==="PRELIMINARY"?"UNDER REVIEW":c?.state||"UNAVAILABLE";
function IconLogo(){return <span className="console-symbol"><i/><i/><i/></span>}
export default function Console(){
 const [tab,setTab]=useState("overview"),[wallet,setWallet]=useState(""),[data,setData]=useState(null);
 const [selected,setSelected]=useState(QUALIFICATION),[busy,setBusy]=useState(false),[loading,setLoading]=useState(true);
 const [error,setError]=useState(""),[notice,setNotice]=useState(""),[pending,setPending]=useState("");
 const [form,setForm]=useState(initial),[claim,setClaim]=useState(""),[attestRef,setAttestRef]=useState("");
 const [objection,setObjection]=useState(""),[challengeRef,setChallengeRef]=useState("");
 const refresh=useCallback(async()=>{
  setLoading(true);
  try{
   const r=await fetch("/api/v3/state",{cache:"no-store"}),j=await r.json();
   if(!r.ok||!j.ok)throw Error(j.error||"Contract readback failed");
   setData(j);setError("");
  }catch(e){setError("Live GenLayer readback unavailable: "+String(e.message||e))}
  finally{setLoading(false)}
 },[]);
 useEffect(()=>{refresh();const timer=setInterval(refresh,60000);return()=>clearInterval(timer)},[refresh]);
 const cases=data?.cases||[],current=cases.find(c=>c.id===selected)||cases[0]||null;
 const resolved=cases.filter(c=>["PRELIMINARY","CHALLENGED","FINALIZED"].includes(c.state)).length;
 const final=cases.filter(c=>c.state==="FINALIZED").length;
 const sourceCount=cases.reduce((n,c)=>n+(c.sources?.length||0),0);
 const update=(key,val)=>setForm(v=>({...v,[key]:val}));
 const newId=()=>{const a=new Uint8Array(7);window.crypto.getRandomValues(a);update("id","EVS-"+Array.from(a,x=>x.toString(16).padStart(2,"0")).join("").toUpperCase())};
 const connect=async()=>{
  try{
   if(!window.ethereum)throw Error("No EIP-1193 wallet detected. Install a compatible wallet.");
   const accounts=await window.ethereum.request({method:"eth_requestAccounts"});
   if(!accounts?.[0])throw Error("Wallet did not authorize an account.");
   let id=await window.ethereum.request({method:"eth_chainId"});
   if(parseInt(id,16)!==CHAIN_ID){
    try{await window.ethereum.request({method:"wallet_switchEthereumChain",params:[{chainId:CHAIN_HEX}]})}
    catch(e){
     if(e.code!==4902)throw e;
     await window.ethereum.request({method:"wallet_addEthereumChain",params:[{chainId:CHAIN_HEX,chainName:"GenLayer Studionet",rpcUrls:[RPC],nativeCurrency:{name:"GEN",symbol:"GEN",decimals:18},blockExplorerUrls:[EXPLORER]}]});
    }
    id=await window.ethereum.request({method:"eth_chainId"});
    if(parseInt(id,16)!==CHAIN_ID)throw Error("Wallet must switch to GenLayer Studionet 61999.");
   }
   setWallet(accounts[0]);setError("");setNotice("Wallet connected to Studionet.");
  }catch(e){setError("Connection failed: "+String(e.message||e))}
 };
 useEffect(()=>{
  if(!window.ethereum?.on)return;
  const accounts=a=>{setWallet(a?.[0]||"");setPending("")};
  const chain=()=>{setWallet("");setPending("");setNotice("Network changed. Please reconnect.")};
  window.ethereum.on("accountsChanged",accounts);window.ethereum.on("chainChanged",chain);
  return()=>{window.ethereum.removeListener?.("accountsChanged",accounts);window.ethereum.removeListener?.("chainChanged",chain)}
 },[]);
 const submit=async(method,args,targetId)=>{
  if(!wallet){setError("Connect a wallet before signing.");return}
  if(busy||pending){setError("An operation is already pending. Reconcile it before retrying.");return}
  setError("");setNotice("");setBusy(true);let hash="";
  try{
   const id=await window.ethereum.request({method:"eth_chainId"});
   if(parseInt(id,16)!==CHAIN_ID)throw Error("Wrong network. Switch to GenLayer Studionet.");
   const accounts=await window.ethereum.request({method:"eth_accounts"});
   if(accounts?.[0]?.toLowerCase()!==wallet.toLowerCase())throw Error("Wallet account changed. Reconnect.");
   const [{createClient},{studionet},{TransactionStatus}]=await Promise.all([import("genlayer-js"),import("genlayer-js/chains"),import("genlayer-js/types")]);
   const client=createClient({chain:studionet,endpoint:RPC,provider:window.ethereum,account:wallet});
   hash=await client.writeContract({address:CONTRACT,functionName:method,args});
   setPending(hash);setNotice("Submitted "+method+". Awaiting on-chain finality; do not submit again.");
   const receipt=await client.waitForTransactionReceipt({hash,status:TransactionStatus.FINALIZED,retries:240});
   const status=receipt?.consensus_data?.leader_receipt?.[0]?.execution_result;
   if(status!=="SUCCESS")throw Error("Transaction finalized without execution SUCCESS. Inspect the hash.");
   setPending("");setNotice(method+" finalized successfully.");
   await refresh();
   if(targetId)setSelected(targetId);
   setTab("registry");
  }catch(e){
   setError(String(e.message||e)+(hash?" Review transaction "+hash+" before retrying.":""));
  }finally{setBusy(false)}
 };
 const create=async e=>{
  e.preventDefault();
  try{
   const parsed=validateCase({...form,attestors:form.attestors.split(/[,\n]/).map(x=>x.trim()).filter(Boolean)});
   await submit("create_case",[parsed.id,parsed.title,parsed.question,parsed.rule,parsed.deadline,
    JSON.stringify(parsed.urls),JSON.stringify(parsed.attestors),parsed.quorum],parsed.id);
  }catch(e){setError(String(e.message||e))}
 };
 const attest=e=>{
  e.preventDefault();
  if(!current||!canAttest(current,wallet)){setError("Not an authorized, unsubmitted attestor.");return}
  if(new TextEncoder().encode(claim).length<32){setError("Evidence must contain at least 32 UTF-8 bytes.");return}
  submit("attest",[current.id,claim,attestRef]);
 };
 const challenge=e=>{
  e.preventDefault();
  if(!current||!canChallenge(current)){setError("This case has no open challenge window.");return}
  if(new TextEncoder().encode(objection).length<32){setError("Challenge must contain at least 32 UTF-8 bytes.");return}
  submit("challenge_case",[current.id,objection,challengeRef]);
 };
 const section=(v)=>{setTab(v);setError("");setNotice("")};
 return <div className="vc-shell">
  <aside className="vc-side"><Link href="/" className="vc-brand"><IconLogo/> eventsure<span>.</span></Link>
   <div className="vc-side-label">WORKSPACE / V3</div>
   <nav aria-label="Workspace">{TABS.map(([id,title,icon])=><button key={id} className={tab===id?"vc-active":""} onClick={()=>section(id)}><span className="vc-navicon">{icon}</span>{title}<span className="vc-navarrow">↗</span></button>)}</nav>
   <div className="vc-side-bottom"><div className="vc-network"><i/> GENLAYER STUDIONET <b>61999</b></div><div className="vc-side-separator"/><small>CANONICAL INTELLIGENT CONTRACT</small><a href={EXPLORER+"/address/"+CONTRACT} target="_blank" rel="noreferrer">{short(CONTRACT)} ↗</a><p>Consensus checks public evidence. It does not guarantee external-world truth.</p></div>
  </aside>
  <div className="vc-body"><header className="vc-top"><div className="vc-breadcrumb"><Link href="/">HOME</Link><span>/</span><b>{TABS.find(x=>x[0]===tab)?.[1]?.toUpperCase()}</b></div><div className="vc-top-right"><span className="vc-online"><i/> LIVE NETWORK</span><button className="vc-refresh" onClick={refresh} disabled={loading}>{loading?"SYNCING":"↻ REFRESH"}</button><button className="vc-connect" onClick={connect} disabled={busy}>{wallet?short(wallet):"CONNECT WALLET"} <span>↗</span></button></div></header>
   <main className="vc-main">
    {error&&<div role="alert" className="vc-message error">{error}</div>}
    {notice&&<div role="status" className="vc-message success">{notice}</div>}
    {pending&&<div className="vc-message warning">Pending transaction: <a href={EXPLORER+"/tx/"+pending} target="_blank" rel="noreferrer">{short(pending)} ↗</a>. Do not resubmit until reconciled.</div>}
    {tab==="overview"&&<><div className="vc-kicker">NETWORK OVERVIEW / GENLAYER STUDIO</div><div className="vc-intro"><div><h1>Evidence has a<br/><em>new standard.</em></h1><p>Public-source verification with frozen rules, independent validator consensus and a fair challenge window.</p><button className="vc-btn vc-accent" onClick={()=>section("create")}>Create a verification case <span>↗</span></button></div><div className="vc-verified-mark"><span>⟡</span><small>INTELLIGENT</small><b>PROTOCOL</b><small>VERSION 3.0</small></div></div>
     <div className="vc-split-title"><span>01 / PROTOCOL METRICS</span><span>LIVE ON-CHAIN DATA</span></div><div className="vc-metrics">{[["REGISTERED CASES",data?.totalCases??"—","Global registry"],["ASSESSED",data?resolved:"—","Preliminary and final"],["FINALIZED",data?final:"—","After challenge window"],["SOURCE REFERENCES",data?sourceCount:"—","Frozen across displayed cases"]].map(x=><div key={x[0]}><small>{x[0]}</small><strong>{x[1]}</strong><span>{x[2]}</span></div>)}</div>
     <div className="vc-section-head"><h2>Verification registry</h2><button onClick={()=>section("registry")}>EXPLORE ALL CASES ↗</button></div>
     <div className="vc-table-wrap"><table className="vc-table"><thead><tr><th>CASE</th><th>STATUS</th><th>SOURCES</th><th>DEADLINE</th><th></th></tr></thead><tbody>{cases.map(c=><tr key={c.id} onClick={()=>{setSelected(c.id);section("registry")}}><td><strong>{c.title}</strong><small>{short(c.id)}</small></td><td><span className={"vc-status "+c.state.toLowerCase()}>{phase(c)}</span></td><td>{c.sources?.length} independent</td><td>{humanDate(c.deadline)}</td><td className="vc-linkarrow">↗</td></tr>)}{!cases.length&&<tr><td colSpan={5}>{loading?"Loading on-chain registry...":"No cases returned by network."}</td></tr>}</tbody></table></div>
     <div className="vc-footnotes"><div><b>02</b><span>REQUIRED WEB SOURCES</span></div><div><b>24h</b><span>CHALLENGE WINDOW</span></div><div><b>0</b><span>PRIVILEGED ADMINS</span></div></div>
    </>}
    {tab==="registry"&&<><div className="vc-kicker">02 / REGISTERED VERIFICATION CASES</div><div className="vc-section-head vc-big"><div><h1>Case registry<span>.</span></h1><p>Read the actual GenLayer state. Select a case to inspect its frozen source policy and perform eligible actions.</p></div><button className="vc-btn vc-accent" onClick={()=>section("create")}>+ NEW CASE</button></div>
     <div className="vc-register-layout"><div className="vc-register-list">{cases.map(c=><button key={c.id} className={current?.id===c.id?"selected":""} onClick={()=>setSelected(c.id)}><span className="vc-list-id">{short(c.id)}</span><strong>{c.title}</strong><span className="vc-list-bottom">{phase(c)} <span>↗</span></span></button>)}</div><div className="vc-case-details">{current?<><div className="vc-detail-bar"><span>CASE RECORD / {short(current.id)}</span><span className={"vc-status "+current.state.toLowerCase()}>{phase(current)}</span></div><h2>{current.title}</h2><p className="vc-detail-desc">{current.question}</p>
      <div className="vc-detail-grid"><div><small>DEADLINE</small><b>{humanDate(current.deadline)}</b></div><div><small>ATTESTOR QUORUM</small><b>{current.attestation_count}/{current.quorum} required</b></div><div><small>CREATOR</small><b title={current.creator}>{short(current.creator)}</b></div><div><small>VERDICT</small><b>{current.decision||"PENDING"}</b></div></div>
      <div className="vc-detail-group"><small>FROZEN EVALUATION RULE</small><p>{current.rule}</p></div>
      <div className="vc-detail-group"><small>INDEPENDENT WEB SOURCES</small>{current.sources.map((s,i)=><a className="vc-evidence-link" href={s} key={i} target="_blank" rel="noreferrer"><span>0{i+1}</span><b>{s}</b><span>↗</span></a>)}</div>
      {current.assessment&&<div className="vc-verdict"><small>ON-CHAIN ASSESSMENT</small><strong>{current.decision}</strong><p>Independent sources: {current.assessment.vote?.independent_sources??"—"} · Timing corroborated: {String(current.assessment.vote?.time_supported??false)}</p><small>CONTEXT HASH: {short(current.assessment.context_hash)}</small></div>}
      <div className="vc-actions"><h3>Contract actions</h3><p>Only actions permitted by this case's frozen state and your wallet are enabled.</p>
       <div className="vc-action-row"><button disabled={busy||!canFreeze(current,wallet)} onClick={()=>submit("freeze_case",[current.id])}>Freeze case ↗</button><button disabled={busy||!wallet||!canResolve(current)} onClick={()=>submit("resolve_case",[current.id])}>Run public-web consensus ↗</button><button disabled={busy||!wallet||!canReconsider(current)} onClick={()=>submit("reconsider_case",[current.id])}>Reconsider challenge ↗</button><button disabled={busy||!wallet||!canFinalize(current)} onClick={()=>submit("finalize_case",[current.id])}>Finalize ↗</button></div>
       {current.state==="FROZEN"&&current.attestors?.length>0&&<form className="vc-action-form" onSubmit={attest}><h4>Authorized attestation</h4><p>Only a configured attestor may submit one immutable statement.</p><textarea value={claim} onChange={e=>setClaim(e.target.value)} placeholder="Your detailed attestation, at least 32 bytes..." rows={3}/><input value={attestRef} onChange={e=>setAttestRef(e.target.value)} placeholder="Reference (optional)"/><button disabled={busy||!canAttest(current,wallet)}>Submit signed attestation ↗</button></form>}
       {canChallenge(current)&&<form className="vc-action-form" onSubmit={challenge}><h4>Open a formal challenge</h4><p>One challenge may be submitted before the review deadline: {humanDate(current.challenge_deadline)}.</p><textarea value={objection} onChange={e=>setObjection(e.target.value)} placeholder="Describe material contradicting evidence..." rows={3}/><input value={challengeRef} onChange={e=>setChallengeRef(e.target.value)} placeholder="Reference (optional)"/><button disabled={busy||!wallet}>Submit signed challenge ↗</button></form>}
      </div></>:<p>Select a case to inspect.</p>}</div></div>
    </>}
    {tab==="create"&&<><div className="vc-kicker">03 / LAUNCH A VERIFICATION PROCESS</div><div className="vc-section-head vc-big"><div><h1>Create a case<span>.</span></h1><p>Define exactly what validators must verify. Public sources, policies and deadlines are frozen on-chain before resolution.</p></div><span className="vc-security">⛨ WALLET-SIGNED / NO PRIVATE KEYS</span></div>
     <div className="vc-create-layout"><form className="vc-create-form" onSubmit={create}>
      <div className="vc-form-header"><span>01 / CASE DEFINITION</span><b>PUBLIC INPUTS</b></div>
      <label>CASE IDENTIFIER <div className="vc-input-group"><input required maxLength={80} value={form.id} onChange={e=>update("id",e.target.value)} placeholder="EVS-RELEASE-2026"/><button type="button" onClick={newId}>GENERATE</button></div></label>
      <label>CASE TITLE<input required maxLength={120} value={form.title} onChange={e=>update("title",e.target.value)} placeholder="Release milestone verification"/></label>
      <label>THE VERIFIABLE QUESTION<textarea required rows={3} value={form.question} onChange={e=>update("question",e.target.value)} placeholder="What exact public claim needs to be independently established?"/></label>
      <label>FROZEN VERIFICATION CRITERIA<textarea required rows={4} value={form.rule} onChange={e=>update("rule",e.target.value)} placeholder="Describe authoritative sources, evidence thresholds and event-time requirements."/></label>
      <div className="vc-form-header vc-form-gap"><span>02 / INDEPENDENT SOURCE POLICY</span><b>REQUIRED</b></div>
      <p className="vc-form-help">Use two or three stable, public HTTPS documents from distinct hosts. Validators fetch these directly. Changing sources requires a new case.</p>
      {form.sources.map((u,i)=><label key={i}>PUBLIC SOURCE {String(i+1).padStart(2,"0")}<input type="url" required value={u} onChange={e=>update("sources",form.sources.map((s,j)=>i===j?e.target.value:s))} placeholder="https://api.example.com/release/123"/></label>)}
      <div className="vc-source-controls"><button type="button" disabled={form.sources.length>=3} onClick={()=>update("sources",[...form.sources,""])}>+ ADD THIRD SOURCE</button>{form.sources.length>2&&<button type="button" onClick={()=>update("sources",form.sources.slice(0,2))}>REMOVE THIRD</button>}</div>
      <div className="vc-form-header vc-form-gap"><span>03 / DEADLINE & OPTIONAL ATTESTORS</span></div>
      <label>RESOLUTION DEADLINE (LOCAL TIME)<input type="datetime-local" required value={form.deadline} onChange={e=>update("deadline",e.target.value)}/></label>
      <label>ATTESTOR ADDRESSES (OPTIONAL)<textarea rows={2} value={form.attestors} onChange={e=>update("attestors",e.target.value)} placeholder="0x123..., one address per line"/></label>
      <label>REQUIRED ATTESTATIONS<input type="number" min="0" max="5" value={form.quorum} onChange={e=>update("quorum",e.target.value)}/></label>
      <button className="vc-btn vc-accent vc-submit" disabled={!wallet||busy}>SIGN & CREATE ON STUDIONET <span>↗</span></button>
      {!wallet&&<p className="vc-form-help">Connect a wallet above to enable on-chain creation.</p>}
     </form><aside className="vc-guidance"><div className="vc-guidance-head"><span>⟡</span> POLICY CHECKLIST</div><div><b>01</b><h3>Choose stable evidence</h3><p>Public documents should remain independently retrievable when the deadline passes. Volatile webpages can cause validator disagreement.</p></div><div><b>02</b><h3>Describe verifiable timing</h3><p>Don't mistake a present-day status for proof that an event occurred before its deadline.</p></div><div><b>03</b><h3>Freeze before the deadline</h3><p>The creator must separately freeze a draft. Once frozen, the rules and source URLs cannot change.</p></div><div><b>04</b><h3>Allow due process</h3><p>After preliminary resolution, there is a 24-hour challenge window before finalization.</p></div><div className="vc-trust-note">This is a testnet research protocol. Validation of public sources reduces single-attestor dependence but cannot guarantee their factual accuracy.</div></aside></div>
    </>}
    {tab==="activity"&&<><div className="vc-kicker">04 / APPEND-ONLY CONTRACT HISTORY</div><div className="vc-section-head vc-big"><div><h1>Protocol activity<span>.</span></h1><p>Read directly from the GenLayer audit log. Records shown here are not generated by the website.</p></div><span className="vc-security">{data?.auditCount??"—"} TOTAL RECORDS</span></div><div className="vc-table-wrap"><table className="vc-table"><thead><tr><th>INDEX</th><th>ACTION</th><th>CASE</th><th>ON-CHAIN TIMESTAMP</th></tr></thead><tbody>{data?.audit?.map(a=><tr key={a.index}><td className="vc-lime">{a.index.toString().padStart(3,"0")}</td><td>{a.action}</td><td>{short(a.id)}</td><td>{humanDate(a.time)}</td></tr>)}{!data?.audit?.length&&<tr><td colSpan={4}>Awaiting on-chain activity...</td></tr>}</tbody></table></div></>}
    {tab==="developers"&&<><div className="vc-kicker">05 / DEVELOPER INTEGRATION</div><div className="vc-section-head vc-big"><div><h1>Built to integrate<span>.</span></h1><p>One reusable on-chain interface, no operator-owned admin key, and a documented frozen-source policy.</p></div></div>
     <div className="vc-dev-grid"><div className="vc-dev-card"><small>CANONICAL V3 CONTRACT</small><code>{CONTRACT}</code><p>Deployed on GenLayer Studionet, chain 61999. Developers can create independent cases through this existing contract.</p><a target="_blank" rel="noreferrer" href={EXPLORER+"/address/"+CONTRACT}>OPEN BLOCK EXPLORER ↗</a></div><div className="vc-dev-card"><small>ON-CHAIN SOURCE SHA-256</small><code>{HASH}</code><p>Verified source bytes are retrieved from the GenLayer RPC and checked against this frozen hash before download.</p><a href="/api/v3/source">DOWNLOAD VERIFIED PYTHON ↗</a></div></div>
     <div className="vc-dev-methods"><h2>Contract interface</h2><p>These public writes are owned by the Intelligent Contract, not a centralized application backend.</p>{[["create_case","Register a new configurable verification policy"],["freeze_case","Lock creator-defined terms on-chain"],["attest","Record authorized stakeholder evidence"],["resolve_case","Fetch public sources and execute AI validator consensus"],["challenge_case","Raise a public objection in the review window"],["reconsider_case","Re-evaluate challenged evidence"],["finalize_case","Seal the outcome after the waiting period"]].map(([m,d])=><div key={m}><code>{m}()</code><span>{d}</span></div>)}</div>
    </>}
   </main><footer className="vc-footer"><span>EVENTSURE V3 / PUBLIC EVIDENCE PROTOCOL</span><span>{data?.asOf?"CHAIN SYNC: "+humanDate(data.asOf):"AWAITING RPC"}</span><span>STUDIONET 61999</span></footer>
  </div>
 </div>;
}

