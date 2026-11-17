# Notes for Claude

## Keep the roadmap in step with the work

`docs/ROADMAP.md` is the record of what is done, and it must always match the app. Whenever a change finishes a roadmap item (or part of one):

1. Change that item's row from `➡️ N` to `✅` and say in a sentence what was done, in the **same commit** as the work.
2. If the "Suggested order" section names the item, mark it ✅ there too.
3. Add the item to `DONE` in `tests/roadmap.test.js`: a short check that finds the feature in the code or the content. `npm test` then fails if a row is ticked without its feature, or a checked feature isn't ticked; `WATCH` in the same file catches open items that look built.
4. Before pushing, check that the ticks are really in the commit, for example:
   `git show --stat HEAD -- docs/ROADMAP.md` and `git show HEAD -- docs/ROADMAP.md | grep '^+| ✅'`
5. List the roadmap items marked done in the pull request description.
6. After a merge, check on `main` itself (not the merge reply) that the commit, the feature and the ✅ rows are there: `git fetch origin main`, then `git merge-base --is-ancestor <commit> origin/main` and `git show origin/main:docs/ROADMAP.md`.

An item that is only partly done stays `➡️`, with a note in its row of what is there and what is left.
