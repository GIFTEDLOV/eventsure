# GenLayer Project Track — EventSure V3.1

**Project:** EventSure — Public Evidence Verification Protocol
**GitHub:** https://github.com/GIFTEDLOV/eventsure
**Product:** https://eventsure-studionet.vercel.app
**Network:** Studionet 61999
**Canonical Intelligent Contract:** 0x13Bc702936d8d7Bd5880d4A16119690149D3D4c7
**Source SHA256:** 0fe025b631642094a3f86d49b6d928ba76a00c1af1102a2699036fb959a97acb

## Description

EventSure is a reusable public-evidence verification layer on GenLayer. Users freeze a question, deadline, verification rules, 2–3 public sources and optional multi-attestor quorum. GenLayer Intelligent Contract execution independently fetches the evidence, evaluates a structured semantic result, uses an independent validator rerun, stores an on-chain preliminary outcome, and supports a challenge and reconsideration window before finalization.

## Why GenLayer

The hard problem is neutral judgment of public natural-language and web-based evidence, not merely recording an answer computed on a centralized frontend. The contract uses gl.nondet.web.get and gl.nondet.exec_prompt within gl.vm.run_nondet_unsafe and has no privileged owner. Deterministic lifecycle checks, deadline rules and state transitions remain in contract code.

## Demo

Open the landing page, select Launch Protocol, use the live registry, read frozen source URLs, connect an EIP-1193 compatible wallet, create a case, freeze, wait for the deadline, run resolution, challenge a preliminary result and finalize after the challenge window. Technical limitations and trust disclaimers are visible in the UI.

## Integrity

Canonical contract: contracts/EventSureV3_1.py. Deployment proof: deployments/STUDIONET_V3_1_DEPLOYMENT.json. Live qualification: deployments/STUDIONET_V3_1_QUALIFICATION.json. Legacy deployments and their known failures are historical and must not be conflated with V3.1. Run the build, tests and provenance verifier before presenting this as qualified.

This repository does not assert approval by GenLayer Project Track reviewers, independent verification of real-world truth, third-party audits, or mainnet readiness.

