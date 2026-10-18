import assert from "node:assert/strict";
import {chromium} from "playwright";

const origin=process.env.EVENTSURE_BROWSER_BASE||"http://127.0.0.1:3001";
const wallet="0x"+"a".repeat(40);
const fixture={
 ok:true,version:"3.3.0",chainId:61999,contract:"0x33d84fF024161DDCaDa0412Dc1D52dbDb1f149b0",
 asOf:"2026-10-17T09:00:00Z",totalCases:1,auditCount:1,
 qualification:"EVS-BROWSER-CASE",audit:[{index:0,id:"EVS-BROWSER-CASE",action:"CREATED",time:"2026-10-17T08:00:00Z"}],
 cases:[{id:"EVS-BROWSER-CASE",title:"Browser test case",question:"Did a documented public milestone occur before the deadline?",
  state:"PRELIMINARY",decision:"VERIFIED",creator:"0x"+"b".repeat(40),sources:["https://nasa.gov/mission/apollo-11","https://airandspace.si.edu/apollo-11"],
  rule:"Require two independent dated public sources.",deadline:"2026-10-17T06:54:59Z",
  challenge_deadline:"2099-01-01T00:00:00Z",quorum:0,attestation_count:0,attestors:[],attestation_ids:[],challenge_count:0,
  assessment:{vote:{independent_sources:2,time_supported:true},context_hash:"a".repeat(64)}}]
};
function createWalletScript({chain="0xf22f",reject=false}={}){
 return ({account,initialChain,rejectConnect})=>{
  let currentChain=initialChain;
  const handlers=new Map();
  window.__walletMock={
   events:[],emit(name,payload){for(const cb of handlers.get(name)||[])cb(payload);},
   get chain(){return currentChain;}
  };
  window.ethereum={
   request:async({method,params})=>{
    window.__walletMock.events.push(method);
    if(method==="eth_requestAccounts"){
     if(rejectConnect)throw Error("User rejected the request.");
     return [account];
    }
    if(method==="eth_accounts")return [account];
    if(method==="eth_chainId")return currentChain;
    if(method==="wallet_switchEthereumChain"){currentChain=params[0].chainId;return null;}
    if(method==="wallet_addEthereumChain"){currentChain=params[0].chainId;return null;}
    throw Error("Unexpected wallet method: "+method);
   },
   on(name,listener){handlers.set(name,[...(handlers.get(name)||[]),listener]);},
   removeListener(name,listener){handlers.set(name,(handlers.get(name)||[]).filter(f=>f!==listener));}
  };
 };
}
const browser=await chromium.launch({headless:true});
try{
 const standard=await browser.newContext({viewport:{width:1440,height:900}});
 await standard.route("**/api/v3/state",route=>route.fulfill({status:200,contentType:"application/json",body:JSON.stringify(fixture)}));
 const noWallet=await standard.newPage();
 await noWallet.goto(origin+"/app",{waitUntil:"networkidle"});
 await noWallet.getByRole("button",{name:/CONNECT WALLET/i}).click();
 await noWallet.getByRole("alert").getByText(/No EIP-1193 wallet detected/i).waitFor();
 assert.equal(await noWallet.getByRole("button",{name:/CONNECT WALLET/i}).count(),1);
 await noWallet.close();
 await standard.close();
 const connected=await browser.newContext({viewport:{width:1440,height:900}});
 await connected.route("**/api/v3/state",route=>route.fulfill({status:200,contentType:"application/json",body:JSON.stringify(fixture)}));
 await connected.addInitScript(createWalletScript(),{account:wallet,initialChain:"0xf22f",rejectConnect:false});
 const page=await connected.newPage();
 await page.goto(origin+"/app",{waitUntil:"networkidle"});
 await page.getByRole("button",{name:/CONNECT WALLET/i}).click();
 await page.getByRole("status").getByText(/Wallet connected to Studionet/i).waitFor();
 assert.equal(await page.getByRole("button",{name:/CONNECT WALLET/i}).count(),0);
 await page.getByRole("button",{name:/Case registry/i}).click();
 await page.getByText("Browser test case").first().waitFor();
 await page.getByText("Require two independent dated public sources.").waitFor();
 assert.equal(await page.getByRole("button",{name:/Finalize/i}).isDisabled(),true,"Finalization must stay disabled during review");
 await page.evaluate(()=>window.__walletMock.emit("accountsChanged",[]));
 await page.getByRole("button",{name:/CONNECT WALLET/i}).waitFor();
 await page.close();await connected.close();
 const switching=await browser.newContext({viewport:{width:390,height:844}});
 await switching.route("**/api/v3/state",route=>route.fulfill({status:200,contentType:"application/json",body:JSON.stringify(fixture)}));
 await switching.addInitScript(createWalletScript(),{account:wallet,initialChain:"0x1",rejectConnect:false});
 const mobile=await switching.newPage();
 await mobile.goto(origin+"/app",{waitUntil:"networkidle"});
 await mobile.getByRole("button",{name:/CONNECT WALLET/i}).click();
 await mobile.getByRole("status").getByText(/Wallet connected to Studionet/i).waitFor();
 const walletMethods=await mobile.evaluate(()=>window.__walletMock.events);
 assert(walletMethods.includes("wallet_switchEthereumChain"),"Wrong-chain wallet must be switched to Studionet");
 assert.equal(await mobile.evaluate(()=>window.__walletMock.chain),"0xf22f");
 const overflow=await mobile.evaluate(()=>({viewport:innerWidth,document:document.documentElement.scrollWidth}));
 assert(overflow.document<=overflow.viewport+5,"Mobile layout overflows viewport: "+JSON.stringify(overflow));
 await mobile.close();await switching.close();
 const rejecting=await browser.newContext({viewport:{width:1440,height:900}});
 await rejecting.route("**/api/v3/state",route=>route.fulfill({status:200,contentType:"application/json",body:JSON.stringify(fixture)}));
 await rejecting.addInitScript(createWalletScript(),{account:wallet,initialChain:"0xf22f",rejectConnect:true});
 const rejected=await rejecting.newPage();
 await rejected.goto(origin+"/app",{waitUntil:"networkidle"});
 await rejected.getByRole("button",{name:/CONNECT WALLET/i}).click();
 await rejected.getByRole("alert").getByText(/User rejected the request/i).waitFor();
 await rejected.close();await rejecting.close();
 console.log("EVENTSURE_BROWSER_EIP1193_MOCKED=PASS");
 console.log("CHECKS=no-wallet-rejection,wallet-connect,registry-state,disallowed-finalization,account-disconnect,wrong-chain-switch,mobile-overflow,user-rejection");
 console.log("NOTE=Browser provider simulated; no live wallet transaction signed.");
}finally{await browser.close();}
