import {createClient} from 'genlayer-js';
import {studionet} from 'genlayer-js/chains';
const tx='0x14d07568dfa27df65562721b7cf841dcf53f2e74992ce28ede2aff17dff9479e';
const url='https://studio.genlayer.com/api';
async function rpc(method,params){const r=await fetch(url,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method,params})});const j=await r.json();if(j.error)throw Error(JSON.stringify(j.error));return j.result;}
try{const x=await rpc('gen_getTransactionReceipt',[{txId:tx}]);console.log('FULL_RECEIPT='+JSON.stringify(x,null,2).slice(0,14000));}catch(e){console.log('RECEIPT_ERROR='+String(e.message||e));}
const client=createClient({chain:studionet,endpoint:url});
try{const x=await client.debugTraceTransaction({hash:tx,round:0});console.log('TRACE='+JSON.stringify({code:x?.result_code,stderr:String(x?.stderr||'').slice(0,7000),genvm_log:String(x?.genvm_log||'').slice(0,3000)},null,2));}catch(e){console.log('TRACE_ERROR='+String(e.message||e));}
