---
title: 'Meeting notes to decisions'
slug: meeting-to-decisions
category: productivity
models: [claude-sonnet-5, gpt-5-6-luna]
description: >-
  Extracts decisions, owners, and deadlines from raw meeting transcripts,
  tuned for cheap, fast models on high-volume workloads.
lastVerified: 2026-07-18
---

```
From this transcript, extract only:

DECISIONS: what was decided, by whom, in their words (quote).
ACTIONS: task / owner / deadline. Mark "no owner" and "no deadline"
explicitly when missing.
OPEN: questions raised but not resolved.

Skip: discussion summaries, pleasantries, anything speculative.
If the transcript contains no decisions, say "No decisions recorded."

<transcript>
{PASTE}
</transcript>
```

The "no owner / no deadline" flags are the value: they surface exactly the
follow-ups that die silently after meetings.
