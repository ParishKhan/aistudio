---
title: 'Spec-first feature build'
slug: spec-first-feature
category: coding
models: [claude-opus-4-8, gpt-5-6-sol, grok-4-5]
description: >-
  Makes an agent write and confirm a mini-spec before touching code, which
  cuts wasted agentic loops on ambiguous feature requests.
lastVerified: 2026-07-18
---

```
Implement: {FEATURE REQUEST}

Before writing any code:
1. Write a spec of max 10 lines: user-visible behavior, data changes,
   edge cases, and what is explicitly OUT of scope.
2. List the files you expect to touch and why.
3. State your riskiest assumption. If it materially changes the work,
   ask me; otherwise proceed.

Then implement, run the tests, and end with: spec line -> where it's
satisfied in the diff.
```

Works because ambiguity is resolved when it's cheap (10 spec lines) instead
of expensive (500 diff lines). The spec-to-diff traceback catches silent
scope drift.
