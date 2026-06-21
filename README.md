# Scoop

**Confidence-calibrated, evidence-based decision support for community claims.**

Scoop is not a fact-checker. It analyzes the available evidence and calculates how confident you should be in a claim at a specific moment in time — then shows you exactly why.

Built for high-school communities: students navigating rumors, parents reacting to social media panic, local journalists tracking narrative origin, and administrators understanding how a story is spreading.

---

## What It Does

Scoop runs every claim through a multi-stage AI pipeline and returns:

- **Information DNA** — a semantic fingerprint to cluster identical claims across platforms
- **Citation Graph** — maps whether sources independently verified a claim or just repeated each other
- **Trust Passports** — long-term credibility profiles for publishers, adjusted by user feedback over time
- **Context Integrity** — detects missing dates, selective quoting, cropped screenshots, platform mismatches
- **Manipulation Score** — independently measures fear, anger, and outrage framing
- **Courtroom Reasoning** — a Prosecutor argues against, a Defense argues for, a Cross-Examiner stress-tests both, a Judge weighs the result
- **Calibrated Confidence** — a deterministic score (not an LLM opinion) with full component breakdown
- **Watch Mode** — re-run the pipeline on a claim over time and track how confidence evolves

---

## Architecture

```markdown
User Input
   │
   ▼
[ Input Normalization ]
   ├─► Classification Agent
   ├─► Claim Decomposition Agent
   └─► Fingerprinting Agent
         │
         ▼
[ Retrieval Planning Agent ]
         │
         ▼
[ Evidence Retrieval ]
         ├─► Source Classification Agent
         ├─► Trust Passport Agent
         ├─► Evidence Structuring Agent
         └─► Citation Graph Agent ──► Evidence Graph Builder (deterministic)
               │
               ▼
[ Context Integrity Agent ]
               │
               ▼
[ Emotional Manipulation Agent ]
               │
               ▼
[ Evidence Strength Engine ] (deterministic)
               │
               ▼
[ Evidence Collector Agent ]
               ├─► Prosecutor Agent
               ├─► Defense Agent
               └─► Cross-Examiner Agent
                     │
                     ▼
               [ Judge Agent ]
                     │
                     ▼
[ Belief Formation → Skeptic → Constitution ]
                     │
                     ▼
[ Confidence Engine ] (deterministic formula)
                     │
                     ▼
[ Action Recommendation → Response Formatter ]
                     │
                     ▼
Storage (SQLite)
```

### Deterministic Scoring

The final confidence score is math, not an LLM opinion:

```markdown
confidence =
  0.20 × authority
+ 0.15 × freshness
+ 0.15 × independence
+ 0.15 × evidence_agreement
+ 0.10 × historical_trust
+ 0.10 × context_integrity
+ 0.10 × (100 − manipulation_risk)
+ 0.05 × evidence_strength
```

Source type weights used in the Evidence Strength Engine:

| Source Type     | Weight |
|-----------------|--------|
| Official Notice | 1.00   |
| Government      | 0.95   |
| Peer Reviewed   | 0.90   |
| Major News      | 0.75   |
| Expert          | 0.70   |
| Community       | 0.40   |
| Social Media    | 0.25   |
| Anonymous       | 0.10   |

### Stack

- **Backend:** FastAPI + LangGraph (agent pipeline) + SQLAlchemy (SQLite)
- **LLM:** Google Gemini (fast agents use `gemini-flash-lite`, reasoning agents use configurable model)
- **Frontend:** Server-rendered HTML via Jinja2 templates; streaming via NDJSON
- **Storage:** SQLite (`scoop.db`) with versioned `AnalysisSnapshot` and `ConfidenceHistory` tables

---

## Running Locally

### 1. Clone and install dependencies

```bash
git clone <repo-url>
cd scoop
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```env
# At least one Gemini API key is required.
# Add up to 7 keys; the system round-robins them to stay under rate limits.
GEMINI_API_KEY_1=your_key_here
GEMINI_API_KEY_2=optional_second_key

# Optional overrides (defaults shown)
FAST_MODEL=gemini-3.1-flash-lite
REASONING_MODEL=gemini-3.1-flash-lite
DATABASE_URL=sqlite:///./scoop.db
MAX_RETRIES=3
RETRY_DELAY=1.0
```

### 3. Start the server

```bash
python main.py
```

The server starts on `http://localhost:8000` with hot-reload enabled.

### 4. Pages

| Route        | Description                              |
|--------------|------------------------------------------|
| `/`          | Landing page with live claim preview     |
| `/login`     | Auth page                                |
| `/onboarding`| First-run onboarding flow                |
| `/app`       | Main analysis interface                  |
| `/watch`     | Watch Mode — living confidence timeline  |

---

## API Reference

### `POST /landing/analyze`

Fast preview (DNA, manipulation, integrity) shown on the landing page before a full run.

```json
{ "claim": "The school is closing next Friday due to a gas leak." }
```

### `POST /analyze`

Full pipeline run. Returns the complete analysis object.

```json
{
  "claim": "The school is closing next Friday due to a gas leak.",
  "screenshot_ref": "",
  "metadata": {}
}
```

### `POST /analyze/stream`

Same as `/analyze` but streams NDJSON events as each pipeline stage completes — lets the UI render sections progressively.

Each event has a `type` of `stage`, `section`, `done`, or `error`.

### `GET /claim/{id}`

Fetch a stored claim with its latest analysis, full confidence history, feedback history, and watch status.

### `POST /feedback`

Submit user feedback (`helpful` / `misleading`) on a claim. Feedback is used to adjust the publisher's `historical_trust` score over time.

```json
{ "claim_id": "uuid", "feedback": "helpful", "note": "" }
```

### `POST /watch/{claim_id}`

Enable Watch Mode for a claim with a re-check interval.

```json
{ "recheck_horizon_hours": 24 }
```

### `POST /watch/{claim_id}/recheck`

Trigger a fresh pipeline run for a watched claim and update the confidence timeline.

### `GET /watch/{claim_id}/timeline`

Returns the full Watch Mode payload: confidence history, change cards explaining why the score moved, and a dated event timeline.

---

## Data Model

| Table                | Purpose                                                  |
|----------------------|----------------------------------------------------------|
| `claims`             | Raw claim text, fingerprint, canonical form              |
| `analysis_snapshots` | Versioned pipeline outputs per claim                     |
| `source_passports`   | Long-term publisher credibility profiles                 |
| `citation_nodes`     | Graph edges tracking how a claim spread                  |
| `confidence_history` | Time-series scores per snapshot (confidence, integrity, manipulation, strength)|
| `feedback`           | User assessments tied to claims                          |
| `claim_watches`      | Watch configuration and last-checked timestamp           |

---

## Design Principles

Scoop's visual identity is editorial, not technical — closer to Bloomberg or the Financial Times than a cybersecurity dashboard.

- **Light mode first.** Trust products live in light mode; documents, newspapers, and evidence are light.
- **Purple (#4759E4)** — intelligence, analysis, understanding
- **Red (#EE2F39)** — risk, manipulation, skepticism
- **Typeface:** Poppins — geometric, modern, strong numerics
- **Grid-based layout** — structured, traceable, measured

The interface assists decisions. It never appears to make them.
