# ObsidiaNER - OSINT entity extraction plugin 

Import any readable web article into your vault, run it through OpenAI's Responses API for structured Markdown with YAML frontmatter, and save it as a clean Obsidian note.

## What it does
- Prompts you for a URL (command palette or ribbon button), fetches the page, and extracts article text with Mozilla Readability.
- Builds a strict prompt that enforces YAML frontmatter, required headings, and entity [[wikilinks]] in the body.
- Calls OpenAI (default model: `gpt-5-mini`) via the Responses API, then validates that the model returned well-formed frontmatter.
- Saves the note into your chosen folder, ensures a safe filename, and auto-opens it if you want.
- Appends the raw extracted article text below the AI-formatted note so you always have the original content.
- Stores your API key via Obsidian SecretStorage when available; otherwise it falls back to plugin data.

## Requirements
- Obsidian 1.5.0 or newer.
- An OpenAI API key with access to the Responses API.
- Node.js 18+ and npm to build locally.

## Install / build
1) Install dependencies: `npm install`  
2) Build the plugin: `npm run build` (outputs `main.js` and `main.js.map` at the repo root and copies `manifest.json`).  
3) Create a folder in your vault: `<vault>/.obsidian/plugins/ObsidiaNER/`.  
4) Copy `manifest.json`, `main.js`, and `main.js.map` into that folder (include `styles.css` if you add one).  
5) Reload Obsidian's plugins list and enable **URL to Vault**.

## Usage
- Command Palette: run **Import article from URL (OpenAI -> Obsidian note)**.  
- Ribbon: click the link icon added by the plugin.  
- Paste a URL; the plugin fetches the page, trims the extracted text to the configured max characters, sends it to OpenAI, then saves the resulting note to your chosen folder. The raw extracted text is appended under its own heading. A notice shows the saved path, and the note opens automatically if enabled.

## Settings (Settings -> URL to Vault)
- **OpenAI API key**: stored in SecretStorage when available; otherwise saved with plugin data.  
- **Model**: OpenAI model name used for formatting (default `gpt-5-mini`).  
- **Output folder**: relative path inside your vault; created if missing.  
- **Default tags**: comma-separated tags injected into the YAML `tags` list.  
- **Append hyperlinks**: add a list of extracted links to the saved note.  
- **Append images**: add a list of hotlinked images to the saved note.  
- **Trim article text at**: character limit sent to OpenAI to avoid large prompts (default 12,000).  
- **Open created note**: open the note after it is written to disk.  
- **Max OpenAI retries**: how many times to retry on transient OpenAI errors (rate limits/5xx).  
- **Verbose logging**: print extra debug info to the console (never includes your API key).  
- **Prompt (advanced)**: toggle to use a custom prompt. You can insert the built-in prompt into the text box to edit a copy, clear to start fresh, and revert to the shipped prompt at any time.

## Notes and safety
- Avoid committing `data.json` (contains stored settings/key); it is already in `.gitignore`.  
- If extraction yields little text (paywalls, blocked sites), the prompt warns the model not to invent details; you may still want to paste content manually.  
- OpenAI usage incurs cost; long articles are truncated at your configured limit before being sent.

## Development
- `npm run dev` - watch mode build with esbuild.  
- `npm run build` - single build.  
- `npm run lint` - run ESLint (configure `.eslintrc` if you want linting rules).  
- Source entry point: `src/main.ts`; build config: `esbuild.config.mjs`.

## License
MIT
