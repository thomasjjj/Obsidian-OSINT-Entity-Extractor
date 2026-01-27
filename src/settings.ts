import { App, PluginSettingTab, Setting, debounce } from "obsidian";
import type UrlToVaultPlugin from "./main";

export class UrlToVaultSettingTab extends PluginSettingTab {
  plugin: UrlToVaultPlugin;
  private saveSettingsDebounced = debounce(() => this.plugin.saveSettings(), 500, true);

  constructor(app: App, plugin: UrlToVaultPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h2", { text: "URL to Vault" });

    new Setting(containerEl)
      .setName("OpenAI API key")
      .setDesc("Stored via Obsidian SecretStorage when available; otherwise saved in plugin data.")
      .addText((text) => {
        text.inputEl.type = "password";
        text.inputEl.placeholder = "sk-...";
        this.plugin.getApiKey().then((key) => {
          if (key) text.setValue(key);
        });
        text.onChange(async (value) => {
          await this.plugin.setApiKey(value.trim());
        });
      });

    new Setting(containerEl)
      .setName("Model")
      .setDesc("OpenAI model used for formatting (Responses API).")
      .addText((text) =>
        text
          .setPlaceholder("gpt-5-mini")
          .setValue(this.plugin.settings.model)
          .onChange(async (value) => {
            this.plugin.settings.model = value.trim() || "gpt-5-mini";
            this.saveSettingsDebounced();
          })
      );

    new Setting(containerEl)
      .setName("Output folder")
      .setDesc("Relative to your vault. Will be created if it doesn't exist.")
      .addText((text) =>
        text
          .setPlaceholder("articles")
          .setValue(this.plugin.settings.outputFolder)
          .onChange(async (value) => {
            this.plugin.settings.outputFolder = value.trim();
            this.saveSettingsDebounced();
          })
      );

    new Setting(containerEl)
      .setName("Default tags")
      .setDesc("Comma-separated tags to inject into the YAML tags list.")
      .addText((text) =>
        text
          .setPlaceholder("news,reading")
          .setValue(this.plugin.settings.defaultTags)
          .onChange(async (value) => {
            this.plugin.settings.defaultTags = value.trim();
            this.saveSettingsDebounced();
          })
      );

    new Setting(containerEl)
      .setName("Trim article text at")
      .setDesc("Maximum number of characters sent to OpenAI (to avoid token blowups).")
      .addText((text) =>
        text
          .setPlaceholder("12000")
          .setValue(String(this.plugin.settings.maxChars))
          .onChange(async (value) => {
            const parsed = Number(value);
            if (!Number.isNaN(parsed) && parsed > 0) {
              this.plugin.settings.maxChars = parsed;
              this.saveSettingsDebounced();
            }
          })
      );

    new Setting(containerEl)
      .setName("Open created note")
      .setDesc("Open the note after creation.")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.openAfterCreate)
          .onChange(async (value) => {
            this.plugin.settings.openAfterCreate = value;
            this.saveSettingsDebounced();
          })
      );
  }
}
