export const PROMPT_TEMPLATE = `
You are an analyst assistant. Convert the provided article into a single Obsidian note written in Obsidian-flavoured Markdown.

STRICT OUTPUT RULES
- Return ONLY the final markdown note. No commentary, no code fences.
- The note MUST start with YAML frontmatter and end that block with a second line containing only '---'.
- After YAML, write the note body with the headings below.
- Wrap key named entities in [[double square brackets]] throughout the BODY only: people, organizations, countries, cities/places, weapon systems/munitions, events/operations, platforms/programs. Do NOT link generic nouns.

FRONTMATTER (STRICT YAML, OBSIDIAN PROPERTIES)
1) Valid YAML the parser can read:
   - snake_case keys only; spaces, not tabs; no duplicate keys.
   - omit unknown or uncertain fields (never output blanks or placeholders like "unknown").
2) Allowed keys and types:
   REQUIRED
   - title: quoted string (headline)
   - source: quoted string (may contain [[wikilink]] but keep inside quotes)
   - url: quoted string
   - published: ISO-8601 date or datetime (YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS) with no surrounding quotes
   - type: "news_article"
   - tags: block list of lowercase slug tags (unquoted items)
   OPTIONAL (only when present)
   - author: single quoted string (use ONLY when exactly one author)
   - authors: block list of quoted strings (use when multiple authors; never include both author and authors)
   - section: quoted string
   - language: quoted string (e.g. "en")
   - location: quoted string (may contain [[wikilink]])
   - article_id: integer (no quotes)
   - topics: block list of quoted strings (may contain [[wikilinks]]; keep consistent)
3) Quoting policy:
   - Quote ALL string values with double quotes, except items under tags which must be unquoted simple slugs.
   - Always quote values containing ':', '#', '@', '[', ']', '{{', '}}', ',', or leading/trailing spaces.
4) Lists:
   - Use block lists only (no inline lists). Each item on its own line, two spaces indent under the key.
5) Self-check before output:
   - YAML starts with '---' on its own line and ends with '---'.
   - Every key has exactly one value; lists are indented consistently; no blank/placeholder values; YAML would parse.

CANONICAL YAML EXAMPLE
---
title: "Example headline"
source: "Example Source"
url: "https://example.com/news/example-article"
published: 2026-01-23
type: "news_article"
author: "Jane Doe"
tags:
  - news
  - drones
topics:
  - "Air Defence"
---

NOTE BODY STRUCTURE (REQUIRED HEADINGS)
## Summary
- 3-7 bullets capturing the key claims (with linked entities in the text).

## Key details
- Expand key facts: timeline, quantities, specs, locations, named suppliers/manufacturers, etc.

## Claims & attribution
- Separate what is claimed vs who claims it.
- Mark uncertainty clearly (unconfirmed / not independently verified in the provided text).

## Entities
Group key entities with Obsidian links:
- People
- Organisations
- Systems / equipment
- Locations
- (Optional) Platforms / sanctions / programs

## Analyst notes (optional but encouraged)
- 5-10 bullets: verification hooks, OSINT checks, notable gaps.

NOW CONVERT THIS ARTICLE
URL: {url}

METADATA (as extracted)
title: {title}
authors: {authors}
published: {published}
source: {source}

ARTICLE TEXT
{article_text}
`.trim();
