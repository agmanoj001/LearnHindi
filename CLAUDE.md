# Notes for Claude

## Keep the roadmap in step with the work

`docs/ROADMAP.md` is the record of what is done. Whenever a change finishes a roadmap item (or part of one):

1. Change that item's row from `➡️ N` to `✅` and say in a sentence what was done, in the **same commit** as the work.
2. If the "Suggested order" section names the item, mark it ✅ there too.
3. Before pushing, check that the ticks are really in the commit, for example:
   `git show --stat HEAD -- docs/ROADMAP.md` and `git show HEAD -- docs/ROADMAP.md | grep '^+| ✅'`
4. List the roadmap items marked done in the pull request description.

An item that is only partly done stays `➡️`, with a note of what is left.
