import importlib.util
import json
import pathlib
import sys
import types
import unittest
from datetime import datetime, timezone, timedelta

ROOT=pathlib.Path(__file__).resolve().parents[1]
S=ROOT/"contracts"/"EventSureV3_1.py"
class Address:
    def __init__(self,a):self.as_hex=a
class Typed:
    def __class_getitem__(cls,item):return cls
class Return:
    def __init__(self,c):self.calldata=c
gl=types.ModuleType("genlayer.gl")
gl.Contract=object
gl.public=types.SimpleNamespace(write=lambda x:x,view=lambda x:x)
gl.vm=types.SimpleNamespace(UserError=ValueError,Return=Return,Result=object)
gl.message=types.SimpleNamespace(sender_address=Address("0x"+"a"*40),chain_id=61999)
gl.message_raw={"datetime":"2026-10-16T15:00:00Z"}
gl.nondet=types.SimpleNamespace(web=types.SimpleNamespace(get=lambda url:types.SimpleNamespace(status_code=200,body=(url+" valid source evidence "*20).encode())),exec_prompt=lambda *a,**kw:'{"supported":true,"independent_sources":2,"time_supported":true}')
def compare(leader,validator):
    x=leader()
    if not validator(Return(x)):raise ValueError("Validator disagreement")
    return x
gl.vm.run_nondet_unsafe=compare
lib=types.ModuleType("genlayer")
lib.gl=gl
lib.Address=Address
lib.TreeMap=Typed
lib.DynArray=Typed
lib.u256=int
sys.modules["genlayer"]=lib
sys.modules["genlayer.gl"]=gl
spec=importlib.util.spec_from_file_location("eventsure_v3",S)
mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
A="0x"+"a"*40;B="0x"+"b"*40;C="0x"+"c"*40;X="0x"+"f"*40
URLS=["https://api.github.com/repos/genlayerlabs/intelligent-oracle","https://docs.genlayer.com/developers/intelligent-contracts/introduction"]
def who(a):gl.message.sender_address=Address(a)
def clock(t):gl.message_raw["datetime"]=t
def client():
    c=mod.EventSureV3_1()
    c.cases={};c.case_ids=[];c.attestations={};c.challenges={};c.audit=[]
    return c
def register(c,urls=URLS,attestors=None,quorum=0,deadline="2026-10-16T15:02:00Z",id="CHECK-123"):
    c.create_case(id,"Qualification evidence","A public release is documented and time-stamped by authoritative sources",
                  "At least two independent authoritative sources must confirm the release by the frozen deadline.",
                  deadline,json.dumps(urls),json.dumps(attestors if attestors is not None else []),quorum)
def freeze(c,id="CHECK-123"):who(A);c.freeze_case(id)
def att(c,id="CHECK-123",text="A verified milestone release was completed."):who(B);c.attest(id,text,"ref:test")
def due():clock("2026-10-16T15:03:00Z")
def conclude(c):
    due()
    c.resolve_case("CHECK-123")

class Security(unittest.TestCase):
    def setUp(self):
        who(A);clock("2026-10-16T15:00:00Z")
        gl.nondet.exec_prompt=lambda *a,**kw:'{"supported":true,"independent_sources":2,"time_supported":true}'
        gl.nondet.web.get=lambda u:types.SimpleNamespace(status_code=200,body=(u+" source "*40).encode())
        self.x=client()
    def fail(self,f,*a):
        with self.assertRaises(ValueError):f(*a)
    def test_01_create(self):register(self.x);self.assertEqual(self.x.get_case("CHECK-123")["state"],"DRAFT")
    def test_02_duplicate(self):register(self.x);self.fail(register,self.x)
    def test_03_short_id(self):self.fail(register,self.x,URLS,[],0,"2026-10-16T15:02:00Z","x")
    def test_04_bad_id(self):self.fail(register,self.x,URLS,[],0,"2026-10-16T15:02:00Z","a space")
    def test_05_future_deadline(self):self.fail(register,self.x,URLS,[],0,"2020-01-01T00:00:00Z")
    def test_06_naive_deadline(self):self.fail(register,self.x,URLS,[],0,"2026-10-16T15:02:00")
    def test_07_one_source(self):self.fail(register,self.x,URLS[:1])
    def test_08_duplicate_source_host(self):self.fail(register,self.x,[URLS[0],URLS[0]+"/readme"])
    def test_09_http_rejected(self):self.fail(register,self.x,["http://api.github.com/repos/x/y",URLS[1]])
    def test_10_localhost_rejected(self):self.fail(register,self.x,["https://localhost.example.local/p",URLS[1]])
    def test_11_private_ip_rejected(self):self.fail(register,self.x,["https://192.168.0.1/test",URLS[1]])
    def test_12_url_credentials_rejected(self):self.fail(register,self.x,["https://admin:foo@a.example.com/path",URLS[1]])
    def test_13_port_rejected(self):self.fail(register,self.x,["https://a.example.com:443/path",URLS[1]])
    def test_14_zero_attestor_rejected(self):self.fail(register,self.x,URLS,["0x"+"0"*40],0)
    def test_15_duplicate_attestor_rejected(self):self.fail(register,self.x,URLS,[B,B],1)
    def test_16_bad_quorum(self):self.fail(register,self.x,URLS,[B],2)
    def test_17_multiple_creators(self):
        who(B);register(self.x);self.assertEqual(self.x.get_case("CHECK-123")["creator"],B)
    def test_18_non_creator_freeze(self):
        register(self.x);who(B);self.fail(self.x.freeze_case,"CHECK-123")
    def test_19_freeze_once(self):
        register(self.x);freeze(self.x);self.fail(freeze,self.x)
    def test_20_late_freeze(self):
        register(self.x);due();self.fail(freeze,self.x)
    def test_21_attestation_requires_freeze(self):
        register(self.x,URLS,[B],1);self.fail(att,self.x)
    def test_22_wrong_attestor(self):
        register(self.x,URLS,[B],1);freeze(self.x);who(X);self.fail(self.x.attest,"CHECK-123","A"*50,"test")
    def test_23_short_attestation(self):
        register(self.x,URLS,[B],1);freeze(self.x);who(B);self.fail(self.x.attest,"CHECK-123","A"*10,"test")
    def test_24_no_double_attestation(self):
        register(self.x,URLS,[B],1);freeze(self.x);att(self.x);self.fail(att,self.x)
    def test_25_attestation_deadline(self):
        register(self.x,URLS,[B],1);freeze(self.x);due();self.fail(att,self.x)
    def test_26_two_attestors_quorum(self):
        register(self.x,URLS,[B,C],2);freeze(self.x);att(self.x);due();self.fail(self.x.resolve_case,"CHECK-123")
    def test_27_early_resolution(self):
        register(self.x);freeze(self.x);self.fail(self.x.resolve_case,"CHECK-123")
    def test_28_approved_consensus(self):
        register(self.x);freeze(self.x);conclude(self.x)
        self.assertEqual(self.x.get_case("CHECK-123")["decision"],"VERIFIED")
    def test_29_negative_consensus(self):
        register(self.x);freeze(self.x)
        gl.nondet.exec_prompt=lambda *a,**kw:'{"supported":false,"independent_sources":0,"time_supported":false}'
        conclude(self.x);self.assertEqual(self.x.get_case("CHECK-123")["decision"],"INCONCLUSIVE")
    def test_30_insufficient_sources_vote(self):
        register(self.x);freeze(self.x)
        gl.nondet.exec_prompt=lambda *a,**kw:'{"supported":true,"independent_sources":1,"time_supported":true}'
        conclude(self.x);self.assertEqual(self.x.get_case("CHECK-123")["decision"],"INCONCLUSIVE")
    def test_31_missing_time_vote(self):
        register(self.x);freeze(self.x)
        gl.nondet.exec_prompt=lambda *a,**kw:'{"supported":true,"independent_sources":2,"time_supported":false}'
        conclude(self.x);self.assertEqual(self.x.get_case("CHECK-123")["decision"],"INCONCLUSIVE")
    def test_32_prompt_schema_rejection(self):
        register(self.x);freeze(self.x)
        gl.nondet.exec_prompt=lambda *a,**kw:'{"supported":"yes","independent_sources":2,"time_supported":true}'
        self.fail(conclude,self.x)
    def test_33_validator_disagreement(self):
        register(self.x);freeze(self.x)
        n=[0]
        def disagree(*a,**kw):
            n[0]+=1
            return '{"supported":true,"independent_sources":2,"time_supported":true}' if n[0]==1 else '{"supported":false,"independent_sources":2,"time_supported":true}'
        gl.nondet.exec_prompt=disagree
        self.fail(conclude,self.x)
        self.assertEqual(self.x.get_case("CHECK-123")["state"],"FROZEN")
    def test_34_http_error_rejected(self):
        register(self.x);freeze(self.x)
        gl.nondet.web.get=lambda u:types.SimpleNamespace(status_code=404,body=b"")
        self.fail(conclude,self.x)
    def test_35_replay_resolution_rejected(self):
        register(self.x);freeze(self.x);conclude(self.x)
        self.fail(self.x.resolve_case,"CHECK-123")
    def test_36_challenge_open(self):
        register(self.x);freeze(self.x);conclude(self.x)
        who(X);self.x.challenge_case("CHECK-123","The source release timestamp is not proven by these documents.","")
        self.assertEqual(self.x.get_case("CHECK-123")["state"],"CHALLENGED")
    def test_37_challenge_once(self):
        register(self.x);freeze(self.x);conclude(self.x)
        self.x.challenge_case("CHECK-123","A"*40,"")
        self.fail(self.x.challenge_case,"CHECK-123","B"*40,"")
    def test_38_finalization_too_early(self):
        register(self.x);freeze(self.x);conclude(self.x)
        self.fail(self.x.finalize_case,"CHECK-123")
    def test_39_finalization_after_wait(self):
        register(self.x);freeze(self.x);conclude(self.x)
        clock("2026-10-18T15:03:00Z")
        self.x.finalize_case("CHECK-123")
        self.assertEqual(self.x.get_case("CHECK-123")["state"],"FINALIZED")
    def test_40_reconsider(self):
        register(self.x);freeze(self.x);conclude(self.x)
        self.x.challenge_case("CHECK-123","A"*40,"")
        self.x.reconsider_case("CHECK-123")
        self.assertEqual(self.x.get_case("CHECK-123")["round"],2)
    def test_41_challenge_blocks_finalize(self):
        register(self.x);freeze(self.x);conclude(self.x)
        self.x.challenge_case("CHECK-123","A"*40,"")
        clock("2026-10-19T15:03:00Z");self.fail(self.x.finalize_case,"CHECK-123")
    def test_42_attestation_hash(self):
        register(self.x,URLS,[B],1);freeze(self.x);att(self.x)
        record=self.x.get_attestation("CHECK-123",B)
        self.assertEqual(record["sha256"],mod.digest(record["claim"]))
    def test_43_challenge_audit(self):
        register(self.x);freeze(self.x);conclude(self.x)
        self.x.challenge_case("CHECK-123","A"*40,"")
        self.assertEqual(self.x.get_audit_count(),4)
    def test_44_missing_case(self):self.fail(self.x.get_case,"not-found")
    def test_45_no_admin(self):self.assertEqual(self.x.contract_info()["admin"],"NONE")
    def test_46_unique_source_constraint(self):
        register(self.x);self.assertEqual(len(self.x.get_case("CHECK-123")["sources"]),2)
    def test_47_multiple_attestations(self):
        register(self.x,URLS,[B,C],2);freeze(self.x);att(self.x)
        who(C);self.x.attest("CHECK-123","C"*45,"")
        self.assertEqual(self.x.get_case("CHECK-123")["attestation_count"],2)
    def test_48_challenge_after_expiration(self):
        register(self.x);freeze(self.x);conclude(self.x)
        clock("2026-10-18T15:03:00Z")
        self.fail(self.x.challenge_case,"CHECK-123","A"*40,"")
    def test_50_same_publisher_git_hosts_rejected(self):
        urls=["https://api.github.com/repos/genlayerlabs/intelligent-oracle",
              "https://raw.githubusercontent.com/genlayerlabs/intelligent-oracle/main/README.md"]
        self.fail(register,self.x,urls)
    def test_49_post_challenge_finalize(self):
        register(self.x);freeze(self.x);conclude(self.x)
        self.x.challenge_case("CHECK-123","A"*40,"")
        self.x.reconsider_case("CHECK-123")
        clock("2026-10-18T15:03:00Z")
        self.x.finalize_case("CHECK-123")
        self.assertEqual(self.x.get_case("CHECK-123")["state"],"FINALIZED")
if __name__=="__main__":unittest.main()

