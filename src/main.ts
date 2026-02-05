import { App, Modal, Notice, Plugin, PluginManifest, Setting } from "obsidian";
import { UrlToVaultSettingTab } from "./settings";
import { DEFAULT_SETTINGS, PluginSettings } from "./types";
import { fetchAndExtract } from "./extract";
import { formatWithOpenAI, getOpenAIClient } from "./openai";
import { ensureFrontmatterPresent, saveNoteToVault } from "./note";
import type { ExtractedArticle } from "./types";
import { normalizeTags } from "./tags";

const SECRET_KEY_ID = "osint-ner-openai-key";

function ensureHttpScheme(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function renderTwoStepProgress(step: 1 | 2, label: string): string {
  // ASCII-safe progress indicator to avoid mojibake on some platforms.
  const bar = step === 1 ? "[# ]" : "[##]";
  return `Progress ${bar} (${step}/2) ${label}`;
}

class UrlInputModal extends Modal {
  onSubmit: (url: string) => void;
  value = "";

  constructor(app: App, onSubmit: (url: string) => void) {
    super(app);
    this.onSubmit = onSubmit;
  }

  override onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Import article from URL" });

    const urlSetting = new Setting(contentEl).setName("Article URL");
    urlSetting.addText((text) => {
      text.inputEl.placeholder = "https://example.com/article";
      text.onChange((value) => (this.value = value.trim()));
      text.inputEl.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          this.close();
          this.onSubmit(this.value);
        }
      });
      text.inputEl.addEventListener("focus", () => text.inputEl.select());
      text.inputEl.focus();
    });
    urlSetting.addButton((btn) =>
      btn
        .setButtonText("Paste")
        .setTooltip("Paste URL from clipboard")
        .onClick(() => {
          void (async () => {
            try {
              if (!navigator.clipboard?.readText) {
                new Notice("Clipboard unavailable in this context.");
                return;
              }
              const clip = await navigator.clipboard.readText();
              if (!clip) {
                new Notice("Clipboard is empty.");
                return;
              }
              this.value = clip.trim();
              const input = urlSetting.controlEl.querySelector("input");
              if (input) {
                input.value = this.value;
                input.focus();
                input.select();
              }
            } catch (err) {
              console.warn("Clipboard read failed", err);
              new Notice("Couldn't read clipboard in this context.");
            }
          })();
        })
    );

    new Setting(contentEl).addButton((btn) =>
      btn
        .setButtonText("Import")
        .setCta()
        .onClick(() => {
          this.close();
          void this.onSubmit(this.value);
        })
    );
  }

  override onClose() {
    this.contentEl.empty();
  }
}

export default class UrlToVaultPlugin extends Plugin {
  settings: PluginSettings = { ...DEFAULT_SETTINGS };

  constructor(app: App, manifest: PluginManifest) {
    super(app, manifest);
  }

  private logVerbose(...args: unknown[]) {
    if (this.settings.verboseLogging) {
      console.debug("[OSINT-Entity-Extractor]", ...args);
    }
  }

  override async onload() {
    await this.loadSettings();

    const openImportModal = () => new UrlInputModal(this.app, (url) => void this.runImport(url)).open();

    this.addCommand({
      id: "import-article-from-url",
      name: "Import article from URL",
      callback: () => {
        openImportModal();
      }
    });

    this.addRibbonIcon("link", "Import article from URL", () => {
      openImportModal();
    });

    this.addSettingTab(new UrlToVaultSettingTab(this.app, this));
  }

  async loadSettings(): Promise<void> {
    const saved = await this.loadData();
    this.settings = { ...DEFAULT_SETTINGS, ...(saved ?? {}) };
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  async getApiKey(): Promise<string> {
    if (this.app.secretStorage?.getSecret) {
      try {
        const secret = await Promise.resolve(this.app.secretStorage.getSecret(SECRET_KEY_ID));
        if (secret) return secret;
      } catch (err) {
        console.warn("SecretStorage getSecret failed", err);
      }
    }
    if (this.settings.apiKey) return this.settings.apiKey;
    if (typeof process !== "undefined" && process.env.OPENAI_API_KEY) {
      return process.env.OPENAI_API_KEY;
    }
    return "";
  }

  async setApiKey(value: string): Promise<void> {
    if (this.app.secretStorage?.setSecret) {
      try {
        this.app.secretStorage.setSecret(SECRET_KEY_ID, value);
      } catch (err) {
        console.warn("SecretStorage setSecret failed", err);
      }
    }
    this.settings.apiKey = value;
    await this.saveSettings();
  }

  async testApiKey(): Promise<void> {
    const apiKey = await this.getApiKey();
    if (!apiKey) {
      throw new Error("No API key saved.");
    }
    try {
      const client = getOpenAIClient(apiKey);
      // Prefer a lightweight retrieve to avoid model-listing permission issues.
      const modelToCheck = this.settings.model || "gpt-5-mini";
      await client.models.retrieve(modelToCheck);
      this.logVerbose("OpenAI key test succeeded", { modelChecked: modelToCheck });
    } catch (err: unknown) {
      const status =
        (err as { status?: number })?.status ?? (err as { response?: { status?: number } })?.response?.status;
      if (status === 401) {
        throw new Error("OpenAI rejected the API key (401). Re-enter your key in settings.");
      }
      throw err;
    }
  }

  async runImport(url: string) {
    const normalizedUrl = ensureHttpScheme(url);
    if (!normalizedUrl) {
      new Notice("Please enter a URL.");
      return;
    }
    try {
      new URL(normalizedUrl);
    } catch {
      new Notice("Please enter a valid URL.");
      return;
    }

    const apiKey = await this.getApiKey();
    if (!apiKey) {
      new Notice("Save your API key in the plugin settings first.", 6000);
      return;
    }

    const progress = new Notice(renderTwoStepProgress(1, "Fetching article..."), 0);

    try {
      const meta = await fetchAndExtract(normalizedUrl, this.settings.maxChars);
      this.logVerbose("Fetched metadata", meta);
      if (!meta.text) {
        new Notice("No article text extracted; sending minimal content to the model.", 6000);
      }

      progress.setMessage(renderTwoStepProgress(2, "Formatting with OpenAI..."));

      const promptTemplate =
        this.settings.useCustomPrompt && this.settings.customPrompt.trim()
          ? this.settings.customPrompt
          : undefined;
      if (this.settings.useCustomPrompt && !promptTemplate) {
        new Notice("Custom prompt is empty; using default prompt instead.", 5000);
      }

      const defaultTags = normalizeTags(this.settings.defaultTags);
      const note = await this.callOpenAIWithRetries(apiKey, normalizedUrl, meta, promptTemplate, defaultTags);
      const validated = ensureFrontmatterPresent(note);
      const parts: string[] = [];
      parts.push(validated);

      if (this.settings.includeRaw) {
        const rawHeader = "## Extracted article (plaintext)";
        const rawBody = meta.text?.trim() ? meta.text.trim() : "_No article text extracted._";
        parts.push("", rawHeader, "", rawBody);
      }

      if (this.settings.includeLinks && meta.links.length) {
        parts.push("", "## Extracted links");
        const linkLines = meta.links.map((l) => {
          const text = l.text || l.href;
          return `- [${text}](${l.href})`;
        });
        parts.push(...linkLines);
      }

      if (this.settings.includeImages && meta.images.length) {
        parts.push("", "## Extracted images");
        const imageLines = meta.images.map((img) => {
          const alt = img.alt || "image";
          return `- ![${alt}](${img.src})`;
        });
        parts.push(...imageLines);
      }

      const finalNote = parts.join("\n");

      const file = await saveNoteToVault(
        this.app.vault,
        this.settings.outputFolder,
        meta.title || "article",
        finalNote
      );

      if (this.settings.openAfterCreate) {
        await this.app.workspace.getLeaf(true).openFile(file);
      }

      progress.setMessage("Done");
      new Notice(`Saved: ${file.path}`);
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : String(err);
      new Notice(`Import failed: ${message}`, 8000);
    } finally {
      progress.hide();
    }
  }

  private async callOpenAIWithRetries(
    apiKey: string,
    url: string,
    meta: ExtractedArticle,
    promptTemplate?: string,
    defaultTags?: string[]
  ): Promise<string> {
    const maxRetries = this.settings.maxRetries ?? 0;
    let attempt = 0;
    let lastError: unknown;

    while (attempt <= maxRetries) {
      try {
        return await formatWithOpenAI(apiKey, this.settings.model, url, meta, defaultTags, promptTemplate);
      } catch (err: unknown) {
        lastError = err;
        const status =
          (err as { status?: number })?.status ?? (err as { response?: { status?: number } })?.response?.status;
        const code =
          (err as { code?: string })?.code ??
          (err as { response?: { data?: { error?: { code?: string } } } })?.response?.data?.error?.code;
        const msg: string = err instanceof Error ? err.message : String(err);
        this.logVerbose("OpenAI error", { attempt, status, code, msg });

        // Non-retriable: bad key or quota
        if (status === 401) {
          throw new Error("OpenAI rejected the API key (401). Re-enter your key in settings.");
        }
        if (code === "insufficient_quota") {
          throw new Error("OpenAI quota exhausted. Check billing/usage.");
        }

        // Retriable: 429 (rate limit), 5xx
        const retriable = status === 429 || (status && status >= 500);
        if (!retriable || attempt === maxRetries) {
          break;
        }

        // Backoff: 0.5s, 2s, 4s...
        const delayMs = 500 * Math.pow(2, attempt);
        await new Promise((res) => setTimeout(res, delayMs));
        attempt += 1;
      }
    }

    throw lastError instanceof Error ? lastError : new Error(String(lastError));
  }
}


