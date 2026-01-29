# OSINT Entity Extractor

A tool for open source intelligence analysts to extract structured data from web articles.

<img width="1911" height="697" alt="image" src="https://github.com/user-attachments/assets/fe2cbeeb-bd7d-4908-ba7f-c62cf5c5e33b" />

Import a web article into your Obsidian vault and turn it into a clean note with:

- YAML frontmatter (properties)
- Headings and structured summary
- Linked named entities like [[People]], [[Orgs]], [[Places]]

You paste a URL -> it fetches the article text -> OpenAI formats it -> the note is saved into your vault.

<img width="1262" height="332" alt="image" src="https://github.com/user-attachments/assets/3549b649-40d7-49d6-8e32-5a88dc7cff4e" />

## Contents
- [Quick start](#quick-start-first-import)
- [New to Obsidian?](#new-to-obsidian-2-minute-orientation)
- [Examples](#examples)
- [What it does](#what-it-does)
- [Requirements](#requirements)
- [Installation](#installation)
- [Setting up your OpenAI API key](#setting-up-your-openai-api-key)
- [Usage](#usage)
- [Settings](#settings-settings---osint-entity-extractor)
- [Common problems](#common-problems-fast-fixes)
- [Data & privacy](#data--privacy)
- [Environmental note (optional)](#environmental-note-optional)
- [Development](#development)
- [License](#license)

## Quick start (first import)

| Step | What to do | What you should see |
|---:|---|---|
| 1 | Install + enable the plugin | Listed under **Installed plugins** as "OSINT Entity Extractor" |
| 2 | Settings -> **OSINT Entity Extractor** -> paste **OpenAI API key** | "Test key" succeeds |
| 3 | Open Command Palette (`Ctrl/Cmd + P`) | Command search box |
| 4 | Run **Import article from URL** | URL input box |
| 5 | Paste a URL and confirm | Notice shows save path + a new note in your output folder |

> Tip: If an article is paywalled or heavily scripted, extraction may be thin. Enable **Append raw article** or paste content manually.

> Verification required: AI-generated text can be inaccurate or misleading. Use this for rapid familiarisation and drafting�always verify important facts against the original article and other sources.

## New to Obsidian? (2-minute orientation)

| Term | What it means |
|---|---|
| Vault | The folder on your computer where your notes live. Obsidian reads/writes files inside this folder. |
| Note | A Markdown (`.md`) file in your vault. |
| Community plugins | Optional add-ons you can install in Obsidian to add features. |
| Command Palette | A search box in Obsidian that lets you run commands (like "Import article from URL..."). |

Where to find things in Obsidian:
- Settings: click the gear icon (usually bottom-left).
- Community plugins: Settings -> Community plugins.
- Command Palette: press `Ctrl + P` (Windows/Linux) or `Cmd + P` (macOS).

## Examples

<img width="1069" height="435" alt="image" src="https://github.com/user-attachments/assets/857a7b00-a9ce-4476-b72a-d77cc86f0e5a" />

*User enters link to article in the box*

<img width="1908" height="1034" alt="image" src="https://github.com/user-attachments/assets/14fcfb7e-0bff-40f0-868b-133076416fc3" />

*Article is processed with properties, details, and analysis, with the key entities linked, and the article appended at the bottom*

<img width="1917" height="1037" alt="image" src="https://github.com/user-attachments/assets/4f177982-0319-4d52-a673-da39d9d74097" />

*Focus on rapid information extraction*

## What it does
- Prompts you for a URL (command palette or ribbon button), fetches the page, and extracts article text with Mozilla Readability.
- Builds a strict prompt that enforces YAML frontmatter, required headings, and entity [[wikilinks]] in the body.
- Calls OpenAI (default model: `gpt-5-mini`) via the Responses API, then validates that the model returned well-formed frontmatter.
- Saves the note into your chosen folder, ensures a safe filename, and auto-opens it if you want.
- Appends the raw extracted article text below the AI-formatted note so you always have the original content.
- Stores your API key via Obsidian SecretStorage when available; otherwise it falls back to plugin data.

<img width="1917" height="1000" alt="image" src="https://github.com/user-attachments/assets/53fd9a98-df2e-4aab-b341-2333dbf7f7cb" />

*For example, this Obsidian Vault was created by gathering a selection of articles about the band Metallica*

## Requirements
- Obsidian 1.5.0 or newer.
- An OpenAI API key with access to the Responses API.
- Node.js 18+ and npm only if you want to build from source.

## Installation

### Option A: Community plugins (recommended)

| Step | What to do | Where / what you should see |
|---:|---|---|
| 1 | Open Settings -> Community plugins | In Obsidian |
| 2 | If prompted, turn off Safe mode | Allows community plugins |
| 3 | Click Browse | Opens the plugin browser |
| 4 | Search for **OSINT Entity Extractor** | Use the search box |
| 5 | Click Install, then Enable | Plugin becomes active |

### Option B: Manual install (no coding required)

GitHub tip: On the Release page, scroll to **Assets**. Download `main.js` and `manifest.json` from Assets. Ignore "Source code (zip)" � Obsidian needs the individual files.

| Step | What to do | Notes / common mistakes |
|---:|---|---|
| 1 | Open the plugin's GitHub Releases page | Make sure it's the `obsidian-osint-ner` repo |
| 2 | Click the latest release | Usually the top entry |
| 3 | Under Assets, download `main.js` and `manifest.json` | Do not use "Source code (zip)" |
| 4 | Open your vault folder in Explorer/Finder | This is where your notes live |
| 5 | Create `.obsidian/plugins/osint-ner/` | Folder name must be exactly `osint-ner` |
| 6 | Copy the files into that folder (plus `styles.css` if present) | Files must not be nested deeper |
| 7 | Restart Obsidian | Fully close/reopen if needed |
| 8 | Settings -> Community plugins -> Enable **OSINT Entity Extractor** | Shows under Installed plugins |

Example vault path (Windows):
`C:\Users\Tom\Documents\MyVault\.obsidian\plugins\osint-ner\`

If you cannot see the `.obsidian` folder, enable hidden files (Windows: View -> Hidden items; macOS: Cmd + Shift + . in Finder).

## Setting up your OpenAI API key

> Important: This plugin needs an OpenAI API key (not your ChatGPT login).

If you do not add a key, the plugin can fetch/extract article text, but it cannot generate the formatted note with entity links.

| Step | What to do | What to look for |
|---:|---|---|
| 1 | Sign in to your OpenAI account (platform) | Use the account you want billed |
| 2 | Go to API keys and click Create new secret key | A new key appears |
| 3 | Copy the key immediately | You may only see it once |
| 4 | In Obsidian: Settings -> OSINT Entity Extractor -> paste the key | Use Test key to confirm |

Troubleshooting:
- "Invalid key" -> re-copy, ensure no spaces.
- Works in ChatGPT but not here -> you need an **OpenAI API key**, not the ChatGPT app login.
- Rate limit errors -> try again or lower the max article length in settings.
- Key leaked -> revoke it in OpenAI and create a new one.

## Usage
<img width="561" height="149" alt="image" src="https://github.com/user-attachments/assets/b76d4a38-26c2-41de-9329-6cbe5a7d29bd" />

- Command Palette: run **Import article from URL**.
- Ribbon: click the link icon added by the plugin.
- Paste a URL (Paste button available; scheme auto-prepends `https://` if missing). The plugin fetches the page, trims the extracted text to the configured max characters, sends it to OpenAI, then saves the resulting note to your chosen folder. The raw extracted text is appended under its own heading (toggle-able in settings). A notice shows the saved path, and the note opens automatically if enabled.

## Settings (Settings -> OSINT Entity Extractor)
- **OpenAI API key**: stored in SecretStorage when available; otherwise saved with plugin data.
- **Model**: OpenAI model name used for formatting (default `gpt-5-mini`).
- **Output folder**: relative path inside your vault; created if missing.
- **Default tags**: comma-separated tags injected into the YAML `tags` list (cleaned to lowercase slugs, `#` removed).
- **Append hyperlinks**: add a list of extracted links to the saved note.
- **Append images**: add a list of hotlinked images to the saved note.
- **Append raw article**: include the extracted plaintext article beneath the formatted note (on by default).
- **Trim article text at**: character limit sent to OpenAI to avoid large prompts (default 12,000).
- **Open created note**: open the note after it is written to disk.
- **Max OpenAI retries**: retries on transient OpenAI errors (rate limits/5xx).
- **Verbose logging**: log extra details to the console (never includes your API key).
- **Test OpenAI key**: lightweight check that the saved key can access OpenAI before running an import.
- **Prompt (advanced)**: toggle to use a custom prompt. You can insert the built-in prompt into the text box to edit a copy, clear to start fresh, and revert to the shipped prompt at any time.

## Common problems (fast fixes)

| Problem | Fix |
|---|---|
| I can't find Community plugins | Settings -> Community plugins -> turn off Safe mode. |
| Plugin not listed in Browse | Use Manual install (may be awaiting directory approval). |
| Plugin doesn't appear after manual install | Folder must be `.obsidian/plugins/osint-ner/` with files directly inside. Restart Obsidian. |
| "Invalid key" / Test fails | Re-copy the OpenAI API key (no spaces). Make sure it is an API key, not ChatGPT login. |
| Output looks wrong / too short | Article may be paywalled/blocked. Enable **Append raw article** or paste text manually. |
| Entities aren't linking | Ensure the prompt uses `[[double brackets]]` and you didn't remove them in a custom prompt. |

## Data & privacy

This plugin makes network requests to do its job:
- Fetches article content from the URL you provide (Readability extraction).
- Sends extracted text (trimmed to your limit), prompt, and metadata to OpenAI to generate the formatted note and entity links.
- No analytics/telemetry: only the target URL and OpenAI are contacted.

Stored locally:
- OpenAI API key (SecretStorage when available; otherwise plugin data).
- Plugin settings in plugin data (do not commit `data.json`).
- Generated notes in your chosen output folder, plus optional raw article text.

## Environmental note 
This tool relies on the OpenAI API and uses LLM analysis. LLMs consume compute and energy; please consider donating to conservation groups:

| Charity | What it does | Independent / regulator reference |
|---|---|---|
| [Rainforest Trust](https://www.rainforesttrust.org/) | Funds protection of threatened tropical habitats. | [Charity Navigator (EIN 13-3500609)](https://www.charitynavigator.org/ein/133500609) |
| [Cool Earth](https://www.coolearth.org/) | Supports rainforest protection with local communities. | [Giving What We Can review](https://www.givingwhatwecan.org/reports/cool-earth) |
| [Rainforest Foundation UK](https://www.rainforestfoundationuk.org/) | UK-registered rainforest protection charity. | [Charity Commission entry (No. 1138287)](https://register-of-charities.charitycommission.gov.uk/charity-details/?regid=1138287&subid=0) |

## Development
- `npm run dev` - watch mode build with esbuild.
- `npm run build` - single build.
- `npm run lint` - run ESLint.
- Source entry point: `src/main.ts`; build config: `esbuild.config.mjs`.

## License
GNU General Public License v3.0
