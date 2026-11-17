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

## Every story gets its talk-together prompts

Every story in `content.json` has a `talk` list: five prompts a grown-up can ask after the story (roadmap 1.4 and 7.6, dialogic reading). When a story is added later, its prompts are part of adding it, in the **same change**, never a follow-up:

- `complete`: a line from the story with the picture word left out for the child to say, e.g. `"चूँ-चूँ! … आया।" (चूज़ा)`.
- `recall`: what happened first, quoting the first page (for a poem, the first line).
- `open`: "जिस पन्ने पर X है, उसे खोलिए और पूछिए: यहाँ क्या हो रहा है?", with X a picture in the story.
- `why`: a "why" question about this story, written for it (not a template).
- `you`: a "what about you" question that links the story to the child's own life, written for it.

Each prompt has `hi` and `en`. Write the Hindi addressed to the child so it fits a boy or a girl ("तुम्हें…", a ने-construction or an imperative; not करोगे/करोगी). `validateContent` (js/validate.js) and `npm test` fail when a story is missing any of the five, so a story can't land without them. The prompts are read by the grown-up and not spoken, so they need no voice recordings.

## Long work: push after each piece, and keep a restart check-in

The user's usage limit can stop work part-way (it resets after 5 hours), and the cloud machine is reclaimed when idle, so:

1. For work with several parts (for example, more than one roadmap item), commit and push to the working branch after **each** finished piece (one roadmap item, with its ✅ tick and its check), not once at the end. Run `npm test` before each push.
2. **Always**, at the start of any task that may take more than a few minutes (not only roadmap work, and without being asked), schedule a restart check-in about 5 hours ahead (`send_later`) that names the task and its order of pieces, and tells this session to continue any unfinished piece from the last pushed step, or do nothing if all is done. If work is still going when it fires, schedule the next one. When everything is done, cancel any check-in still pending.
3. Opening or merging a pull request still waits for the user to ask.
