# OSINT Entity Extractor 

<img width="1911" height="697" alt="image" src="https://github.com/user-attachments/assets/fe2cbeeb-bd7d-4908-ba7f-c62cf5c5e33b" />



Import any readable web article into your vault, run it through OpenAI's Responses API for structured Markdown with YAML frontmatter, and save it as a clean Obsidian note. This tool is designed to streamline investigation and allows for quick ingest of articles to establish a clear foundation of information pertaining to a particular topic. Entity extraction allows the identification of commonalities between articles and ensures that key nodes are identified quickly. 

It currently uses the OpenAI API; however, I intend to continue developing it to optimise efficiency and reduce resource requirements. Help and suggestions are very welcome! 

<img width="1262" height="332" alt="image" src="https://github.com/user-attachments/assets/3549b649-40d7-49d6-8e32-5a88dc7cff4e" />

## Quick start
1. Install the plugin via **Settings → Community plugins** (search **OSINT Entity Extractor**), then **Enable** it.
2. Open **Settings → OSINT Entity Extractor** and paste your **OpenAI API key**.
3. Run **Import article from URL (OpenAI → note)** from the Command Palette (or click the ribbon icon).
4. Paste a URL → the plugin creates a formatted note in your chosen output folder.

> Tip: If an article is paywalled or heavily scripted, extraction may be thin. In those cases, use the “Append raw article” option or paste content manually.

---

> **Important (LLM output):** LLM-generated content can be inaccurate, incomplete, or misleading. Treat outputs as a drafting aid and always verify key facts against the original article text and other sources.

---

> **Human Required:** LLM-generated content is amazing for gathering, processing, and organising information. It does not replace the analyst. This tool is designed for rapid familiarisation, background research, and building the foundations of an investigation. 

---


## 🍃 Note: This tool relies on Open AI API and uses LLM analysis. LLMs use a lot of power and water so please consider donating to:

| Charity | What it does | Independent / regulator reference |
|---|---|---|
| [Rainforest Trust](https://www.rainforesttrust.org/) | Funds protection of threatened tropical habitats. | [Charity Navigator (EIN 13-3500609)](https://www.charitynavigator.org/ein/133500609) |
| [Cool Earth](https://www.coolearth.org/) | Helps keep rainforest standing via direct support to Indigenous/local communities. | [Giving What We Can review](https://www.givingwhatwecan.org/reports/cool-earth) |
| [Rainforest Foundation UK](https://www.rainforestfoundationuk.org/) | UK-registered rainforest protection charity with governance/accountability and published accounts. | [Charity Commission entry (No. 1138287)](https://register-of-charities.charitycommission.gov.uk/charity-details/?regid=1138287&subid=0) |

# Example

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
- Node.js 18+ and npm to build locally.

## New to Obsidian? (2-minute orientation)

| Term | What it means |
|---|---|
| Vault | The folder on your computer where your notes live. Obsidian reads/writes files inside this folder. |
| Note | A Markdown (`.md`) file in your vault. |
| Community plugins | Optional add-ons you can install in Obsidian to add features. |
| Command Palette | A search box in Obsidian that lets you run commands (like “Import article from URL…”). |

**Where to find things in Obsidian:**
- **Settings:** click the ⚙️ gear icon (usually bottom-left).
- **Community plugins:** Settings → Community plugins.
- **Command Palette:** press `Ctrl + P` (Windows/Linux) or `Cmd + P` (macOS).


## Installation

### Option A: Install via Obsidian Community Plugins (recommended)

| Step | What to do | Where / what you should see |
|---:|---|---|
| 1 | Open **Settings → Community plugins** | In Obsidian |
| 2 | If prompted, turn off **Safe mode** | This allows community plugins |
| 3 | Click **Browse** | Opens the plugin browser |
| 4 | Search for **OSINT Entity Extractor** | Use the search box |
| 5 | Click **Install**, then **Enable** | Plugin is now active |

---

### Option B: Manual install (no coding required)

Use this if the plugin isn’t showing up in Community plugins yet.

#### Manual install steps

| Step | What to do | Notes / common mistakes |
|---:|---|---|
| 1 | Open the plugin’s **GitHub Releases** page | Make sure you’re on the correct repo |
| 2 | Click the **latest release** | It’s usually the top one |
| 3 | Under **Assets**, download `main.js` and `manifest.json` | **Do not** download “Source code (zip)” — Obsidian needs the individual files |
| 4 | Open your vault folder in File Explorer / Finder | This is the folder that contains your notes |
| 5 | Find the `.obsidian` folder inside your vault | On Windows/macOS it may be hidden (see below) |
| 6 | Create this folder path (if it doesn’t already exist): `.obsidian/plugins/osint-ner/` | The folder name must be **exactly** `osint-ner` |
| 7 | Copy `main.js` and `manifest.json` into `.obsidian/plugins/osint-ner/` | Optional: copy `styles.css` too, **only if** it exists in Assets |
| 8 | Restart Obsidian | Fully close and reopen if needed |
| 9 | Go to **Settings → Community plugins** and enable **OSINT Entity Extractor** | It will appear under **Installed plugins** |

#### What the final folder should look like

| Location | Should contain |
|---|---|
| `YourVault/.obsidian/plugins/osint-ner/` | `main.js`, `manifest.json` (and optionally `styles.css`) |

#### If you can’t see the `.obsidian` folder (hidden folders)

| Platform | What to do |
|---|---|
| Windows | File Explorer → **View** → tick **Hidden items** |
| macOS | In Finder press **Cmd + Shift + .** (toggles hidden files) |

#### Troubleshooting

| Problem | Fix |
|---|---|
| Plugin doesn’t appear in **Installed plugins** | Check the folder is **exactly** `.obsidian/plugins/osint-ner/` and the files are directly inside it (not nested one folder deeper). |
| You downloaded “Source code (zip)” | Go back to the release and download from **Assets** instead. |
| `.obsidian` folder still missing | Confirm you’re in the correct vault folder (the one Obsidian is using). |





## Setting up your OpenAI API key

### What is an API key?

| Item | Meaning |
|---|---|
| OpenAI API key | A secret code that lets this plugin securely talk to OpenAI’s servers to format notes and extract entities. |
| Why you need it | Without a key, the plugin can’t run the OpenAI step (so it can’t generate the structured note). |
| Keep it private | Treat it like a password — don’t share it in screenshots, notes, GitHub issues, or messages. |
| Costs | OpenAI API usage can incur cost. The plugin trims long articles to reduce usage. |

---

### Create an OpenAI API key

| Step | What to do | What to look for |
|---:|---|---|
| 1 | Sign in to your OpenAI account on the OpenAI platform | Use the account you want billed |
| 2 | Go to **API keys** in your account settings | You should see a list of keys (or an empty list) |
| 3 | Click **Create new secret key** | A new key will be generated |
| 4 | Copy the key and store it somewhere safe | You may only be shown the full key once |

---

### Add the key to the plugin in Obsidian

| Step | What to do | Where / what you should see |
|---:|---|---|
| 1 | In Obsidian, open **Settings** | Obsidian Settings panel |
| 2 | Go to **OSINT Entity Extractor** | Plugin settings section |
| 3 | Paste the key into **OpenAI API key** | Input field for the key |
| 4 | Click **Test OpenAI key** (if available) | Confirms your key works before importing an article |

---

### Troubleshooting

| Problem | Fix |
|---|---|
| “Invalid key” / test fails | Re-copy the key from OpenAI (watch for missing characters/spaces). Make sure you pasted the full key. |
| Works in ChatGPT but not here | ChatGPT app access is separate — you need an **OpenAI API key** from the OpenAI platform. |
| Rate limit / temporary errors | Try again later or reduce the article length limit in plugin settings. |
| You think the key was exposed | Revoke it in OpenAI API keys and create a new one. |




## Usage
<img width="561" height="149" alt="image" src="https://github.com/user-attachments/assets/b76d4a38-26c2-41de-9329-6cbe5a7d29bd" />

- Command Palette: run **Import article from URL (OpenAI -> Obsidian note)**.  
- Ribbon: click the link icon added by the plugin.  
- Paste a URL (the dialog now has a **Paste** button and will auto-prepend `https://` if you omit the scheme). The plugin fetches the page, trims the extracted text to the configured max characters, sends it to OpenAI, then saves the resulting note to your chosen folder. The raw extracted text is appended under its own heading (toggle-able in settings). A notice shows the saved path, and the note opens automatically if enabled.

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
- **Max OpenAI retries**: how many times to retry on transient OpenAI errors (rate limits/5xx).  
- **Verbose logging**: print extra debug info to the console (never includes your API key).  
- **Test OpenAI key**: lightweight check that the saved key can access OpenAI before running an import.  
- **Prompt (advanced)**: toggle to use a custom prompt. You can insert the built-in prompt into the text box to edit a copy, clear to start fresh, and revert to the shipped prompt at any time.

## Notes and safety
- Avoid committing `data.json` (contains stored settings/key); it is already in `.gitignore`.  
- If extraction yields little text (paywalls, blocked sites), the prompt warns the model not to invent details; you may still want to paste content manually.  
- OpenAI usage incurs cost; long articles are truncated at your configured limit before being sent.

## Data & network usage (privacy)

This plugin makes network requests to do its job:

- **Fetches article content**: when you import a URL, the plugin downloads the page to extract readable text (via Readability).
- **Sends text to OpenAI**: the extracted article text (trimmed to your configured character limit), your prompt, and any related metadata required by the request are sent to OpenAI to generate the formatted Markdown note and entity links.
- **No analytics/telemetry**: the plugin does not include tracking or analytics. It only contacts the URL you provide and OpenAI (for processing).

### Data stored locally
- **OpenAI API key**: stored using Obsidian SecretStorage when available; otherwise stored in the plugin’s local data store.
- **Plugin settings**: stored locally in the plugin data file (CONTRIBUTORS: do not commit this to source control).
- **Generated notes**: saved into your chosen output folder inside the vault, plus (optionally) the raw extracted article text appended beneath the AI-formatted note.


## Development
- `npm run dev` - watch mode build with esbuild.  
- `npm run build` - single build.  
- `npm run lint` - run ESLint (configure `.eslintrc` if you want linting rules).  
- Source entry point: `src/main.ts`; build config: `esbuild.config.mjs`.

## License
GNU General Public License v3.0
