# Scoop Product Context V2

## What Scoop Is
Scoop is a **confidence-calibrated, evidence-based decision-support system**. 
It is explicitly **NOT a fact-checker**. Fact-checkers declare objective truth; Scoop analyzes the available evidence and calculates the confidence we should have in a claim at a specific moment in time.

## Who It Is For
Scoop is designed for high-school communities:
- **Students** trying to navigate rumors about school policies or safety.
- **Parents & Caregivers** reacting to community panic on social media.
- **Local Journalists** tracking the origin of community claims.
- **School Administrators** understanding how a narrative is spreading.

## Why The System Exists
In closed community networks (Snapchat, neighborhood apps, group chats), misinformation spreads faster than verification. By the time an official statement is released, panic has already occurred. People need tools to evaluate the *quality of evidence* and the *intent behind the framing* before acting on a rumor.

## How It Works

### Trust & Lineage
Scoop uses **Trust Passports** to maintain long-term reliability scores for publishers and sources. It builds **Citation Graphs** to trace whether a rumor is independently verified by multiple sources or just repeated in an echo chamber.

### Context & Manipulation
Truth is not just about facts; it is about framing. Scoop performs:
- **Context Integrity Analysis**: Detects missing dates, selective quoting, cropped screenshots, and platform mismatches to ensure the claim hasn't been deceptively altered.
- **Emotional Manipulation Scanning**: Scores text for fear, anger, and outrage framing to detect language designed to bypass critical thinking.

### Evidence & Reasoning
Scoop uses a multi-agent **Courtroom Reasoning** system. Instead of asking one LLM if a claim is true, it forces adversarial evaluation:
- A **Prosecutor Agent** builds the case *against* the claim.
- A **Defense Agent** builds the case *for* the claim.
- A **Cross-Examiner Agent** stress-tests both arguments.
- A **Judge Agent** weighs the arguments against deterministic evidence strength scores.

## Responsible AI Posture
- **AI does not declare truth.** It presents evidence and confidence.
- **Separation of Concerns:** Evidence, confidence, context, and manipulation risk are calculated and presented independently.
- **Embracing Uncertainty:** The system explicitly acknowledges when there is not enough evidence to make a call.
- **Human Control:** The system does not automate safety-critical decisions. It recommends waiting for official sources.
- **Deterministic Scoring:** The final confidence calculation is deterministic math, not an LLM hallucination.

## Product Principles
1. Scoop is not a fact checker; it is a confidence calibrator.
2. The system must never behave like an authority that determines truth.
3. Every conclusion must be traceable to specific evidence.
4. If evidence is lacking, the system must clearly state what is missing.
5. All confidence scoring must be deterministic code, not LLM-generated.
6. **Trust is earned and tracked, not assumed.**
7. **Manipulation must be measured, not ignored.**
8. **Context is as important as content.**
