# Domain docs

## Layout and reading rules

This project uses a single context:

- `GLOSSARY.md` at the repository root defines domain vocabulary.
- `docs/adr/` contains architectural decision records.

Before exploring an area, read the glossary and ADRs relevant to that area. If these files do not exist, proceed silently. Create them through domain-modeling work when terms or decisions are resolved.

If a root `GLOSSARY-MAP.md` is introduced later, follow its pointers to the relevant context glossaries.

## Vocabulary

Use the glossary’s terms in issue titles, proposals, hypotheses, and tests. Reconsider unfamiliar terminology or record a genuine vocabulary gap for domain modeling.

## Decisions

Explicitly flag a proposal that contradicts an existing ADR, naming the ADR and explaining why the decision should be revisited.
