---
title: 'Evaluate two models on your own workload'
slug: model-eval-pipeline
category: evaluation
relatedModels: [gpt-5-6-sol, claude-opus-4-8]
description: >-
  A weekend-sized workflow for deciding between two models with your real
  tasks instead of vendor benchmarks: sample, run both, blind-grade, price.
lastVerified: 2026-07-18
---

Vendor benchmarks (marked "vendor" across this site) tell you who leads on
their eval harness — not on your tickets. This workflow gets a defensible
answer in a day.

1. **Sample 30–50 real tasks** from production traffic: representative, not
   cherry-picked, including the ugly ones.
2. **Run both models** with identical prompts and tools via the batch API
   (half price — see [cutting API costs](/tutorials/cut-llm-api-costs)).
3. **Blind-grade**: strip model names, have two people (or a third model)
   grade pass/fail per task with a written rubric.
4. **Price the winner properly**: multiply each model's real token usage by
   its rates in the [token cost calculator](/calculators/token-cost) —
   token-efficient models often win on cost even at higher sticker prices.
5. **Re-run monthly.** Models and prices change monthly in 2026; the
   [news feed](/news) tracks the changes that should trigger a re-run.
