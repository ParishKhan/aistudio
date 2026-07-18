---
title: 'SpaceXAI launches Grok 4.5, trained alongside Cursor'
slug: grok-4-5-launch
pubDate: 2026-07-16
description: >-
  Grok 4.5 arrives at $2/$6 per 1M tokens with 83.3% on Terminal-Bench 2.1
  and a claimed 4× token-efficiency edge over Opus 4.8, served at 80
  tokens/second with a 500K context window.
tags: [xai, grok, launch]
sources:
  - url: https://x.ai/news/grok-4-5
    verified: 2026-07-18
  - url: https://docs.x.ai/docs/models
    verified: 2026-07-18
---

SpaceXAI, the merged SpaceX/xAI entity, released [Grok 4.5](/grok-4-5) on
July 16 as its strongest model, built for coding, agentic tasks, and knowledge
work and trained alongside Cursor on real engineering workflows.

The pitch is intelligence per dollar and per second: $2 per million input
tokens and $6 per million output (doubling past 200K input), served at
fast-model speeds of ~80 tokens/second. On SWE-Bench Pro tasks it averages
15,954 output tokens, about 4.2× fewer than Claude Opus 4.8 at max effort,
and it posts 83.3% on Terminal-Bench 2.1 and 64.7% on SWE-Bench Pro,
mid-flagship territory at a fraction of flagship prices.

The context window is 500K tokens, half the 1M-token standard elsewhere.
Grok 4.5 is now the default model in Grok Build, is available in Cursor on
all plans with a free-usage window, and answers to `grok-4.5` in the
SpaceXAI API. See how it stacks up [against GPT-5.6 Sol](/gpt-5-6-sol-vs-grok-4-5)
and [against Claude Opus 4.8](/claude-opus-4-8-vs-grok-4-5).
