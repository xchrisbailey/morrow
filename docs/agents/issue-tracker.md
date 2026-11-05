# Issue tracker: GitHub

Issues and specs live in GitHub Issues in `xchrisbailey/morrow`. Use the `gh` CLI.

## Operations

- Before the first issue creation in a session, verify the target with `gh repo view --json nameWithOwner`. Use `--repo xchrisbailey/morrow` explicitly when needed.
- Create issues with `gh issue create --title "..." --body-file <file>`. Use a file for multiline descriptions and comments.
- Read issues with `gh issue view <number> --json number,title,body,labels,comments`.
- List issues with `gh issue list`, using appropriate state and label filters.
- Apply or remove labels with `gh issue edit <number> --add-label "..."` or `--remove-label "..."`.
- Close issues after posting the resolution with `gh issue comment`, then `gh issue close`.

Use native GitHub sub-issues and blocking dependencies when supported by the installed CLI. Otherwise, put `Part of #<parent>` and `Blocked by: #<number>` in the child issue and maintain a task list in the parent. Work is unblocked when all blockers are closed.

“Publish to the issue tracker” means create a GitHub issue. “Fetch the relevant ticket” means read that issue.

## Pull requests as a triage surface

**PRs as a request surface: no.**

## Wayfinding

Represent a map as an issue labelled `wayfinder:map`. Link child tickets as sub-issues, or use the parent task-list fallback. Use `wayfinder:research`, `wayfinder:prototype`, `wayfinder:grilling`, or `wayfinder:task` for child types.

Choose the first open, unassigned child in map order with no open blockers. Claim it by assigning yourself. On resolution, comment with the answer, close the child, and add a summary and link to the map’s Decisions-so-far.
