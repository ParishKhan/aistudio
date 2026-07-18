---
title: 'Structured code review'
slug: code-review-checklist
category: coding
models: [claude-opus-4-8, gpt-5-6-sol]
description: >-
  A review prompt that forces severity-ranked, line-anchored findings instead
  of vague style commentary — works well with strong agentic models.
lastVerified: 2026-07-18
---

```
Review this diff as a senior engineer. Rules:

1. Only report issues that change behavior, security, or performance —
   no style commentary.
2. For each finding: severity (blocker/major/minor), the exact line,
   a one-sentence failure scenario, and a suggested fix.
3. If you find nothing above "minor", say so explicitly.
4. End with: what test would have caught the worst finding?

<diff>
{PASTE DIFF}
</diff>
```

Why it works: severity gating and the "failure scenario" requirement suppress
the model's tendency to pad reviews with trivia, and the closing question
surfaces test gaps reviewers usually miss.
