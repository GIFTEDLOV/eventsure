"""EventSure V2 executable unit and adversarial test harness (no mock receipts)."""
import importlib.util
import json
import sys
import types
import unittest
from datetime import datetime, timezone, timedelta
from pathlib import Path

source = Path(__file__).resolve().parents[1] / "contracts" / "EventSureV2.py"

class FakeAddress:
    def __init__(self, value):
        self.as_hex = value
    def __eq__(self, other):
        return isinstance(other, FakeAddress) and self.as_hex.lower() == other.as_hex.lower()

class Typed:
    def __class_getitem__(cls, item):
        return cls

class Return:
    def __init__(self, calldata):
        self.calldata = calldata

gl = types.ModuleType("genlayer.gl")
gl.Contract = object
gl.public = types.SimpleNamespace(write=lambda f:f, view=lambda f:f)
gl.vm = types.SimpleNamespace(UserError=ValueError, Return=Return, Result=object)
gl.message = types.SimpleNamespace(sender_address=FakeAddress("0x"+"a"*40),chain_id=61999)
gl.message_raw = {"datetime":"2026-10-16T12:00:00Z"}
gl.nondet = types.SimpleNamespace(exec_prompt=lambda *a, **k:'{"supported":true}')
def consensus(evaluate, validate):
    first=evaluate()
    if not validate(Return(first)):
        raise ValueError("Validator disagreement")
    return first
gl.vm.run_nondet_unsafe=consensus
layer=types.ModuleType("genlayer")
layer.__dict__.update({"Address":FakeAddress,"TreeMap":Typed,"DynArray":Typed,"u256":int})
layer.gl=gl
sys.modules["genlayer"]=layer
sys.modules["genlayer.gl"]=gl
sp=importlib.util.spec_from_file_location("eventsurev2",source)
mod=importlib.util.module_from_spec(sp)
sp.loader.exec_module(mod)

ALICE="0x"+"a"*40
BOB="0x"+"b"*40
EVE="0x"+"e"*40
ID="EVS-TEST-001"
DEADLINE="2026-10-17T12:00:00Z"
def actor(address):
    gl.message.sender_address=FakeAddress(address)
def now(value):
    gl.message_raw["datetime"]=value
def instance():
    x=mod.EventSure()
    x.events={}
    x.evidence={}
    x.event_ids=[]
    x.audit=[]
    return x
def create(x,event_id=ID,attestor=BOB,deadline=DEADLINE):
    actor(ALICE)
    x.create_event(event_id,"Verified milestone",
                   "A signed release attestation identifies the immutable code artifact.",
                   "Support only a factual, fully identified attestation.",deadline,attestor)
def freeze(x,event_id=ID):
    actor(ALICE);x.freeze_event(event_id)
def attest(x,event_id=ID,content="A"*60):
    actor(BOB);x.submit_evidence(event_id,content,"ref:test")

class EventSureSecurityTests(unittest.TestCase):
    def setUp(self):
        actor(ALICE)
        now("2026-10-16T12:00:00Z")
        gl.nondet.exec_prompt=lambda *a,**kw:'{"supported":true}'
        gl.vm.run_nondet_unsafe=consensus
        self.x=instance()
    def assertRejected(self,func,*args):
        with self.assertRaises(ValueError):func(*args)
    def test_create_event(self):create(self.x);self.assertEqual(self.x.get_event(ID)["status"],"DRAFT")
    def test_creator_binding(self):create(self.x);self.assertEqual(self.x.get_event(ID)["creator"],ALICE)
    def test_permissionless_creators(self):
        actor(EVE);self.x.create_event("EVE-ID","Title","Required content text","Frozen rule text here",DEADLINE,EVE)
        self.assertEqual(self.x.get_event("EVE-ID")["creator"],EVE)
    def test_duplicate_id_rejected(self):create(self.x);self.assertRejected(create,self.x)
    def test_empty_id_rejected(self):self.assertRejected(create,self.x,"")
    def test_non_ascii_id_rejected(self):self.assertRejected(create,self.x,"é")
    def test_invalid_attestor_rejected(self):self.assertRejected(create,self.x,ID,"0x"+"z"*40)
    def test_zero_attestor_rejected(self):self.assertRejected(create,self.x,ID,"0x"+"0"*40)
    def test_late_freeze_rejected(self):
        create(self.x);now("2026-10-18T12:00:00Z");self.assertRejected(freeze,self.x)
    def test_short_attestor_rejected(self):self.assertRejected(create,self.x,ID,"0x123")
    def test_naive_deadline_rejected(self):self.assertRejected(create,self.x,ID,BOB,"2026-10-17T12:00:00")
    def test_expired_deadline_rejected(self):self.assertRejected(create,self.x,ID,BOB,"2026-10-15T12:00:00Z")
    def test_unauthorized_freeze_rejected(self):
        create(self.x);actor(EVE);self.assertRejected(self.x.freeze_event,ID)
    def test_freeze_once(self):
        create(self.x);freeze(self.x);self.assertRejected(freeze,self.x)
    def test_evidence_requires_freeze(self):
        create(self.x);self.assertRejected(attest,self.x)
    def test_evidence_requires_attestor(self):
        create(self.x);freeze(self.x);actor(EVE);self.assertRejected(self.x.submit_evidence,ID,"A"*60,"ref")
    def test_evidence_length_min(self):
        create(self.x);freeze(self.x);self.assertRejected(attest,self.x,ID,"A"*31)
    def test_evidence_length_max(self):
        create(self.x);freeze(self.x);self.assertRejected(attest,self.x,ID,"A"*12001)
    def test_evidence_deadline(self):
        create(self.x);freeze(self.x);now("2026-10-18T12:00:00Z");self.assertRejected(attest,self.x)
    def test_repeat_evidence_rejected(self):
        create(self.x);freeze(self.x);attest(self.x);self.assertRejected(attest,self.x)
    def test_evidence_chain_and_hash(self):
        create(self.x);freeze(self.x);attest(self.x)
        data=self.x.get_evidence(ID);self.assertEqual(data["bytes"],60);self.assertEqual(data["chain_id"],61999)
        self.assertEqual(data["sha256"],mod._digest("A"*60))
    def test_resolve_requires_attestation(self):
        create(self.x);freeze(self.x);self.assertRejected(self.x.resolve,ID)
    def test_positive_consensus(self):
        create(self.x);freeze(self.x);attest(self.x);actor(EVE);self.x.resolve(ID)
        self.assertEqual(self.x.get_event(ID)["verdict"],"ATTESTATION_SUPPORTED")
        self.assertEqual(self.x.get_event(ID)["assessment"]["technical_status"],"OK")
    def test_negative_consensus(self):
        create(self.x);freeze(self.x);attest(self.x)
        gl.nondet.exec_prompt=lambda *a,**kw:'{"supported":false}'
        self.x.resolve(ID);self.assertEqual(self.x.get_event(ID)["verdict"],"INCONCLUSIVE")
    def test_validator_disagreement_rejected(self):
        create(self.x);freeze(self.x);attest(self.x)
        call=[0]
        def flip(*args,**kw):
            call[0]+=1
            return '{"supported":true}' if call[0]==1 else '{"supported":false}'
        gl.nondet.exec_prompt=flip
        self.assertRejected(self.x.resolve,ID)
        self.assertEqual(self.x.get_event(ID)["status"],"FROZEN")
    def test_malformed_llm_json_rejected(self):
        create(self.x);freeze(self.x);attest(self.x)
        gl.nondet.exec_prompt=lambda *a,**kw:'{"supported":"true"}'
        self.assertRejected(self.x.resolve,ID)
    def test_malformed_llm_keys_rejected(self):
        create(self.x);freeze(self.x);attest(self.x)
        gl.nondet.exec_prompt=lambda *a,**kw:'{"supported":true,"inject":"ignore"}'
        self.assertRejected(self.x.resolve,ID)
    def test_evidence_tamper_hash_rejected(self):
        create(self.x);freeze(self.x);attest(self.x)
        evidence=json.loads(self.x.evidence[ID]);evidence["content"]="EVIL";self.x.evidence[ID]=json.dumps(evidence)
        self.assertRejected(self.x.resolve,ID)
    def test_evidence_tamper_size_rejected(self):
        create(self.x);freeze(self.x);attest(self.x)
        evidence=json.loads(self.x.evidence[ID]);evidence["bytes"]=999;self.x.evidence[ID]=json.dumps(evidence)
        self.assertRejected(self.x.resolve,ID)
    def test_evidence_chain_mismatch_rejected(self):
        create(self.x);freeze(self.x);attest(self.x)
        evidence=json.loads(self.x.evidence[ID]);evidence["chain_id"]=4221;self.x.evidence[ID]=json.dumps(evidence)
        self.assertRejected(self.x.resolve,ID)
    def test_replay_resolve_rejected(self):
        create(self.x);freeze(self.x);attest(self.x);self.x.resolve(ID);self.assertRejected(self.x.resolve,ID)
    def test_append_only_audit(self):
        create(self.x);freeze(self.x);attest(self.x);self.x.resolve(ID)
        self.assertEqual(self.x.get_audit_count(),4)
        self.assertEqual([self.x.get_audit(i)["action"] for i in range(4)],["CREATED","FROZEN","ATTESTED","RESOLVED"])
        self.assertRejected(self.x.get_audit,4)
    def test_missing_event(self):self.assertRejected(self.x.get_event,"MISSING")
    def test_contract_info(self):
        self.assertEqual(self.x.contract_info()["trust_model"],"AUTHENTICATED_ATTESTATION")
    def test_release_attestation_not_fact_proof(self):
        create(self.x);freeze(self.x);attest(self.x);self.x.resolve(ID)
        self.assertNotIn("OCCURRED_ON_TIME",self.x.get_event(ID)["verdict"])

if __name__=="__main__":unittest.main()

