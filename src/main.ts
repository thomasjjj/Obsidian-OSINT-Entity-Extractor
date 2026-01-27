import { App, Modal, Notice, Plugin, PluginManifest, Setting } from "obsidian";
import { UrlToVaultSettingTab } from "./settings";
import { DEFAULT_SETTINGS, PluginSettings } from "./types";
import { fetchAndExtract } from "./extract";
import { formatWithOpenAI } from "./openai";
import { ensureFrontmatterPresent, saveNoteToVault } from "./note";

const SECRET_KEY_ID = "url-to-vault-openai-key";

class UrlInputModal extends Modal {
  onSubmit: (url: string) => void;
  value = "";

  constructor(app: App, onSubmit: (url: string) => void) {
    super(app);
    this.onSubmit = onSubmit;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Import article from URL" });

    new Setting(contentEl)
      .setName("Article URL")
      .addText((text) => {
        text.inputEl.placeholder = "https://example.com/article";
        text.onChange((value) => (this.value = value.trim()));
        text.inputEl.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            this.close();
            this.onSubmit(this.value);
          }
        });
        text.inputEl.focus();
      });

    new Setting(contentEl).addButton((btn) =>
      btn
        .setButtonText("Import")
        .setCta()
        .onClick(() => {
          this.close();
          this.onSubmit(this.value);
        })
    );
  }

  onClose() {
    this.contentEl.empty();
  }
}

export default class UrlToVaultPlugin extends Plugin {
  settings: PluginSettings = { ...DEFAULT_SETTINGS };

  constructor(app: App, manifest: PluginManifest) {
    super(app, manifest);
  }

  async onload() {
    await this.loadSettings();

    const openImportModal = () => new UrlInputModal(this.app, (url) => this.runImport(url)).open();

    this.addCommand({
      id: "import-article-from-url",
      name: "Import article from URL (OpenAI -> Obsidian note)",
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
        const secret = await this.app.secretStorage.getSecret(SECRET_KEY_ID);
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
        await this.app.secretStorage.setSecret(SECRET_KEY_ID, value);
      } catch (err) {
        console.warn("SecretStorage setSecret failed", err);
      }
    }
    this.settings.apiKey = value;
    await this.saveSettings();
  }

  async runImport(url: string) {
    if (!url) {
      new Notice("Please enter a URL.");
      return;
    }
    try {
      new URL(url);
    } catch {
      new Notice("Please enter a valid URL.");
      return;
    }

    const apiKey = await this.getApiKey();
    if (!apiKey) {
      new Notice("Set your OpenAI API key in the plugin settings first.", 6000);
      return;
    }

    const progress = new Notice("Importing article...", 0);

    try {
      const meta = await fetchAndExtract(url, this.settings.maxChars);
      if (!meta.text) {
        new Notice("No article text extracted; sending minimal content to OpenAI.", 6000);
      }

      const note = await formatWithOpenAI(
        apiKey,
        this.settings.model,
        url,
        meta,
        this.settings.defaultTags
      );
      const validated = ensureFrontmatterPresent(note);
      const rawHeader = "## Extracted article (plaintext)";
      const rawBody = meta.text?.trim() ? meta.text.trim() : "_No article text extracted._";
      const finalNote = `${validated}\n\n${rawHeader}\n\n${rawBody}`;

      const file = await saveNoteToVault(
        this.app.vault,
        this.settings.outputFolder,
        meta.title || "article",
        finalNote
      );

      if (this.settings.openAfterCreate) {
        await this.app.workspace.getLeaf(true).openFile(file);
      }

      new Notice(`Saved: ${file.path}`);
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : String(err);
      new Notice(`Import failed: ${message}`, 8000);
    } finally {
      progress.hide();
    }
  }
}
