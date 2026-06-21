# design.md

# Scoop Design System

## Brand Overview

Scoop is not a fact-checker.

Scoop is an information intelligence platform that helps users understand:

- where information originated
- how it spread
- whether context is missing
- how strong the evidence is
- how trustworthy the source is

The visual identity should communicate:

- trust
- clarity
- investigation
- evidence
- transparency
- modernity

Avoid visual language associated with:

- cyber security dashboards
- hacker aesthetics
- government portals
- generic AI products
- social media platforms

The brand should feel like:

> Bloomberg × Linear × Notion × Financial Times × Investigative Journalism

not

> ChatGPT × Sci-Fi × Neon AI

---

# Core Brand Concept

## "Seeing the Full Picture"

Most people consume isolated pieces of information.

Scoop reveals:

- hidden connections
- evidence chains
- source relationships
- missing context

The visual language is therefore based around:

- grids
- networks
- structured systems
- layers
- transparency
- connected nodes

---

# Color System

## Primary Palette

```css
:root{
    --purple: #4759E4;
    --white: #F3F3F9;
    --red: #EE2F39;
    --black: #0C0C0C;
}
```

---

## Meaning

### Purple

Used for:

- trust
- intelligence
- analysis
- evidence

Represents:

> understanding

---

### Red

Used for:

- risk
- manipulation
- uncertainty
- warnings

Represents:

> skepticism

---

### Black

Used for:

- authority
- grounding
- typography

Represents:

> certainty

---

### White

Used for:

- clarity
- transparency
- readability

Represents:

> openness

---

# Light Mode First

Primary experience should be light mode.

Reason:

Trust products consistently perform better in light mode because:

- documents are light
- evidence is light
- newspapers are light
- research papers are light

Users subconsciously associate:

```text
Light = transparency

Dark = technology
```

Scoop is selling trust.

Not technology.

---

# Visual Language

## Structured Grid System

The grid is a core brand asset.

Not decoration.

Every screen should feel:

```text
Measured
Structured
Traceable
```

Use:

- visible grids
- alignment systems
- node layouts
- graph-inspired spacing

Example:

```css
background-image:
linear-gradient(
rgba(71,89,228,0.08) 1px,
transparent 1px
),
linear-gradient(
90deg,
rgba(71,89,228,0.08) 1px,
transparent 1px
);

background-size: 48px 48px;
```

---

## Node Language

Use small connection points.

Examples:

- graph nodes
- origin points
- timeline markers
- evidence links

They reinforce:

> information lineage

---

# Shape Language

## Two Core Shapes

### Blob

Represents:

- information
- ideas
- claims

Organic.

Fluid.

Unknown.

---

### Ring

Represents:

- verification
- investigation
- analysis

Controlled.

Structured.

Verified.

---

These become recurring brand motifs.

Examples:

- logo elements
- hero graphics
- loading states
- charts

---

# Glass Design System

Glass is used sparingly.

Not full glassmorphism.

Goal:

```text
Transparency
Depth
Trust
```

Not:

```text
Frosted futuristic UI
```

---

## Glass Card

```css
background:
rgba(255,255,255,0.55);

backdrop-filter:
blur(24px);

border:
1px solid rgba(255,255,255,0.7);

box-shadow:
0 8px 40px rgba(0,0,0,0.06);
```

---

## Card Principles

Cards should feel:

- document-like
- evidence-like
- archival

Not floating widgets.

---

# Typography

## Primary Typeface

Poppins

Reasons:

- geometric
- modern
- highly readable
- strong numerics

---

## Hierarchy

### Hero

64-96px

Weight:

700

---

### Section Title

40-56px

Weight:

700

---

### Subheading

24-32px

Weight:

600

---

### Body

16-18px

Weight:

400

---

### Metadata

12-14px

Weight:

500

---

# Layout Philosophy

## Large Empty Space

Do not fill every area.

Trust is created through restraint.

Use:

- large margins
- breathing room
- clear separation

---

## Asymmetric Composition

Avoid:

```text
Centered everything
```

Prefer:

```text
Editorial layouts
```

Inspired by:

- magazines
- newspapers
- Bloomberg terminals
- investigative reports

---

# Component Design

## Trust Passport Card

Purpose:

Evaluate sources.

Contents:

- authority
- transparency
- evidence density
- manipulation risk

Visual:

Clean report card.

---

## Citation Graph

Purpose:

Show information origin.

Visual:

Node graph.

Not flowchart.

Should feel:

```text
Investigation board
```

---

## Context Integrity Card

Purpose:

Show missing context.

Visual:

Large score.

Detected issues below.

Example:

```text
82

Integrity Score

Missing Date
Missing Replies
Source Unknown
```

---

## Manipulation Card

Purpose:

Show emotional framing.

Display:

- fear
- anger
- outrage

as independent metrics.

---

# Motion Language

Animations should be:

- slow
- deliberate
- informative

Never playful.

---

## Examples

### Node Expansion

Evidence graph unfolds.

---

### Line Tracing

Citation path reveals itself.

---

### Confidence Count-Up

0 → 82%

---

### Card Focus

Subtle elevation.

---

# Hero Section

Structure:

```text
Headline

Subheadline

Primary CTA

Visualization
```

---

Headline style:

```text
Understand Before You Believe.
```

Highlighted words use:

- Purple
- Red

Never gradients.

---

# Imagery

Use:

- graphs
- maps
- networks
- reports
- evidence boards
- structured diagrams

Avoid:

- robots
- brains
- glowing AI imagery
- circuits
- futuristic cities

---

# Design Principles

## Principle 1

Evidence Over Opinion

Every visual should feel grounded.

---

## Principle 2

Clarity Before Complexity

Users should understand the screen within 3 seconds.

---

## Principle 3

Transparency Builds Trust

Show reasoning.

Show uncertainty.

Show sources.

---

## Principle 4

Human In Control

The interface assists decisions.

It never appears to make decisions.

---

# Brand Keywords

```text
Investigative

Structured

Transparent

Trustworthy

Editorial

Analytical

Evidence-Driven

Human-Centered

Precise

Calm
```

---

# One-Line Design North Star

Scoop should feel like:

"A modern investigative newsroom powered by evidence and transparency."
