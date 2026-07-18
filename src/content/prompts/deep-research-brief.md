---
title: 'Deep research brief'
slug: deep-research-brief
category: analysis
models: [gpt-5-6-sol, claude-fable-5]
description: >-
  Turns a vague research question into a scoped brief with source
  requirements and a claim-verification pass — built for browsing-capable
  models.
lastVerified: 2026-07-18
---

```
Research this question: {QUESTION}

Process:
1. Restate the question as 3-5 sub-questions that would settle it.
2. For each, find at least 2 independent primary sources. Prefer official
   docs, filings, and announcements over commentary.
3. Note every claim you could NOT verify with a primary source.
4. Deliver: a one-paragraph answer, then findings per sub-question with
   linked sources, then an "unverified claims" list.

Never present an unverified claim as fact.
```

The explicit unverified-claims section is the key — it converts hallucination
risk into a visible, checkable list.
