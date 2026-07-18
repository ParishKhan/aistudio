---
title: 'Claude Fable 5 is back: Anthropic redeploys its Mythos-class model'
slug: claude-fable-5-redeployed
pubDate: 2026-07-01
description: >-
  After a June 9 launch and a June 12 suspension, Claude Fable 5 returned to
  general availability on July 1, still $10/$50 per 1M tokens, still the
  strongest agentic-coding scores on record.
tags: [anthropic, claude, launch]
sources:
  - url: https://www.anthropic.com/news/claude-fable-5-mythos-5
    verified: 2026-07-18
---

[Claude Fable 5](/claude-fable-5) had the strangest launch of 2026: released
June 9 as the first generally available Mythos-class model, suspended three
days later, and redeployed on July 1. It is now available across the Claude
API, Bedrock, Vertex AI, and Microsoft Foundry at $10/$50 per million tokens.

Fable 5 is the same underlying model as Claude Mythos 5, which remains
restricted to cyber defenders in Project Glasswing. What separates them is
safeguards: Fable routes classifier-flagged requests (cybersecurity,
biology/chemistry, suspected distillation) to Claude Opus 4.8, which
Anthropic says touches fewer than 5% of sessions.

The capability claims have held up in third-party reporting. Its 80%
SWE-Bench Pro score is the highest in our database, and both OpenAI's and
SpaceXAI's launch posts treat Fable as the frontier reference point. The open
question is whether [Opus 4.8 at half the price](/claude-opus-4-8-vs-claude-fable-5)
is the better production default.
