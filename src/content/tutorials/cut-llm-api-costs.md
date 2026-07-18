---
title: 'Cut your LLM API bill: caching, batch, and tier tricks that actually work'
slug: cut-llm-api-costs
pubDate: 2026-07-18
description: >-
  Prompt caching cuts input costs up to 90%, batch APIs halve everything, and
  picking the right tier saves multiples. Here's a field guide with verified 2026
  rates.
difficulty: intermediate
relatedModels: [claude-opus-4-8, gpt-5-6-sol, deepseek-v4-flash, claude-sonnet-5]
---

Most teams overpay for LLM APIs by 3–10×, not because prices are hidden but
because the discounts require changing how you call the API. The three levers,
in order of impact:

## 1. Prompt caching (up to 90% off input)

If your requests share a prefix (system prompt, tool definitions, document
context), caching reprices that prefix from full input cost to a fraction:
$0.50 vs $5.00 per million on [Claude Opus 4.8](/claude-opus-4-8-pricing) and
[GPT-5.6 Sol](/gpt-5-6-sol-pricing) alike. DeepSeek's cache pricing is the
extreme case: [$0.0028 per million on hits](/deepseek-v4-flash-pricing), a
98% discount.

Watch the write costs: Anthropic charges 1.25× input for 5-minute cache
writes and 2× for 1-hour writes, so caching pays off after one or two hits.
OpenAI's GPT-5.6 generation added explicit cache breakpoints with a
30-minute minimum lifetime, making hits far more predictable.

## 2. Batch APIs (50% off everything)

Anything that doesn't need an answer in seconds, like evals, backfills,
enrichment, and report generation, belongs on the batch endpoint at half price.
That turns Opus 4.8 into a $2.50/$12.50 model and Sol into $2.50/$15.
Anthropic's batch tier even raises the output cap to 300K tokens with a beta
header.

## 3. Tier down deliberately

The mid tiers are much closer to the flagships than their prices suggest.
OpenAI's own numbers put [GPT-5.6 Terra](/gpt-5-6-terra) above the previous
flagship GPT-5.5 on most coding evals at half the price, and
[Claude Sonnet 5](/claude-sonnet-5)'s intro pricing ($2/$10 through August
31) makes it the cheapest 1M-context Claude ever. Route by task difficulty:
a small-model classifier deciding which tier handles each request routinely
cuts blended costs in half.

## Traps to know

- **Length tiers**: Gemini and Grok double input rates past 200K tokens;
  GPT-5.5 surcharges past 272K for the whole session.
- **Time-of-day pricing**: DeepSeek's official V4 doubles rates during
  Chinese business hours, so schedule batch work off-peak.
- **Tokenizer differences**: Claude's newer tokenizer produces ~30% more
  tokens for the same text than older Claude models, so compare cost per task,
  never cost per token.

Model your own workload in the [token cost calculator](/calculators/token-cost),
and check each model's pricing page for the full matrix.
