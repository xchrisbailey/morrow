# Project agent rules

## Model selection

Optimize for total cost to a verified result, including context, reasoning, retries,
and review. Choose by task complexity rather than using every model on every task.
Explicit user model choices take precedence.

Models are grouped into three tiers. Use the column for the active harness: OpenAI
under Codex, Anthropic under Claude Code.

| Tier | OpenAI | Anthropic | Best fit | Starting effort |
| --- | --- | --- | --- | --- |
| Light | Luna (`gpt-6-luna`) | Haiku (`haiku`, `claude-haiku-5-5`) | Targeted lookup, triage, extraction, mechanical edits, and small changes with explicit requirements and an obvious check. | Low |
| Mid | Terra (`gpt-6.1-terra`) | Sonnet (`sonnet`, `claude-sonnet-5-5`) | Visual inspection, browser interaction, layout work, concise copy from supplied material, and scoped code fixes with clear acceptance criteria. | Low; medium for multi-step work |
| Strong | Sol (`gpt-6.1-sol`) | Opus (`opus`, `claude-opus-5-5`) | Ambiguous requirements, architecture, changes across interacting modules, difficult debugging, and security or data-integrity decisions. | Medium; high for unresolved complexity |

For mixed work, use the strong tier to resolve consequential design decisions, then
assign bounded implementation or inspection to the mid or light tier when the handoff
saves more work than it adds. Keep straightforward tasks with one agent.

Escalate light or mid work to the strong tier when a focused attempt leaves the cause
unclear, a verification failure unresolved, or reveals broader architectural
consequences. Pass the evidence and failed approach so the next agent can continue
directly. Use higher reasoning effort only when the remaining uncertainty warrants it.

These rules guide model selection; they do not change the active chat's model.
Select models explicitly through available delegation controls. If model selection
is unavailable, continue with the current model and report a material limitation.

## Delegation and token use

- Delegate independent, bounded work when it reduces total effort or materially
  shortens a substantial task. Default to one agent; start with at most two workers.
- Give each worker a model, objective, relevant paths, constraints, acceptance
  criteria, and a concise expected response. Prefer fresh context containing only
  the necessary facts. When overriding a subagent model, use `fork_turns: "none"`
  in Codex; in Claude Code, start a fresh agent (forks ignore `model`).
- Give writers separate files or clearly disjoint ownership. The coordinating
  agent owns integration and final verification.
- Return findings, changed paths, checks, and blockers. Share focused excerpts
  instead of full files, raw logs, or conversation history.
- Search narrowly, read relevant sections, and batch independent lookups. Reuse
  established findings until changed evidence requires another read.
- Run checks appropriate to the affected behavior. Repeat them after relevant
  changes or failures; avoid duplicate reviews and checks without a concrete need.

## Project workflow

Read applicable local guidance and inspect the existing implementation before
editing. Derive build and test commands from project configuration when it exists.
Keep changes within the request and preserve unrelated user work. Finish with a
concise account of the outcome, verification, and any unresolved limitation.

OpenAI model roles follow [OpenAI's model-selection guidance](https://developers.openai.com/api/docs/guides/model-selection).

## Agent skills

### Issue tracker

Use GitHub Issues in `xchrisbailey/morrow`. Before tracker operations,
read `docs/agents/issue-tracker.md`.

### Triage labels

Use the five canonical triage labels. Before triaging issues,
read `docs/agents/triage-labels.md`.

### Domain docs

Use a single-context layout: root `GLOSSARY.md` and `docs/adr/`.
Before exploring domain concepts or decisions, read `docs/agents/domain.md`.
