import { App, PluginSettingTab, Setting, debounce, TextAreaComponent, Notice } from "obsidian";
import type UrlToVaultPlugin from "./main";
import { PROMPT_TEMPLATE } from "./prompt";
import { normalizeTags } from "./tags";

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

    try {
      containerEl.createEl("h2", { text: "OSINT Entity Extractor" });

      const repoDesc = (() => {
        const frag = document.createDocumentFragment();
        const link = document.createElement("a");
        link.href = "https://github.com/thomasjjj/osint-ner";
        link.textContent = "thomasjjj/osint-ner (issues)";
        link.target = "_blank";
        link.rel = "noopener";
        frag.append("GitHub: ");
        frag.appendChild(link);
        return frag;
      })();

      new Setting(containerEl)
        .setName("Report a bug / view source")
        .setDesc(repoDesc)
        .addExtraButton((btn) =>
          btn
            .setIcon("bug")
            .setTooltip("Open GitHub repository")
            .onClick(() => window.open("https://github.com/thomasjjj/osint-ner", "_blank"))
        );

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
      .setName("Test OpenAI key")
      .setDesc("Checks the saved key against OpenAI without sending article content.")
      .addButton((btn) =>
        btn
          .setButtonText("Test")
          .setTooltip("Send a lightweight request to confirm the key works.")
          .onClick(async () => {
            btn.setDisabled(true).setButtonText("Testing...");
            try {
              await this.plugin.testApiKey();
              new Notice("OpenAI key looks good.");
            } catch (err: any) {
              const msg = err?.message || "OpenAI key test failed.";
              new Notice(msg, 6000);
            } finally {
              btn.setDisabled(false).setButtonText("Test");
            }
          })
      );

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
            const tags = normalizeTags(value);
            const sanitized = tags.join(", ");
            this.plugin.settings.defaultTags = sanitized;
            if (sanitized !== value.trim()) {
              text.setValue(sanitized);
            }
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
            const valid = !Number.isNaN(parsed) && parsed > 500 && parsed <= 50000;
            text.inputEl.classList.toggle("osint-ner-invalid", !valid);
            text.inputEl.style.borderColor = valid ? "" : "var(--text-error, #d9534f)";
            if (valid) {
              this.plugin.settings.maxChars = parsed;
              this.saveSettingsDebounced();
            }
          })
      );
    const maxCharsInput = containerEl.querySelector("input[placeholder='12000']");
    if (maxCharsInput) {
      maxCharsInput.setAttribute("type", "number");
      maxCharsInput.setAttribute("min", "500");
      maxCharsInput.setAttribute("max", "50000");
      maxCharsInput.setAttribute("step", "500");
      maxCharsInput.classList.add("osint-ner-number");
    }

    new Setting(containerEl)
      .setName("Max OpenAI retries")
      .setDesc("Retries on transient OpenAI errors (rate limits, 5xx).")
      .addSlider((slider) =>
        slider
          .setLimits(0, 3, 1)
          .setValue(this.plugin.settings.maxRetries)
          .setDynamicTooltip()
          .onChange(async (value) => {
            this.plugin.settings.maxRetries = value;
            this.saveSettingsDebounced();
          })
      );

    new Setting(containerEl)
      .setName("Verbose logging")
      .setDesc("Log extra details to the console for troubleshooting (no API keys).")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.verboseLogging)
          .onChange(async (value) => {
            this.plugin.settings.verboseLogging = value;
            this.saveSettingsDebounced();
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

    containerEl.createEl("h3", { text: "Content options" });

    new Setting(containerEl)
      .setName("Append raw article")
      .setDesc("Attach the extracted plaintext article below the AI-formatted note.")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.includeRaw)
          .onChange(async (value) => {
            this.plugin.settings.includeRaw = value;
            this.saveSettingsDebounced();
          })
      );

    new Setting(containerEl)
      .setName("Append hyperlinks")
      .setDesc("Include a list of extracted links at the end of the note.")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.includeLinks)
          .onChange(async (value) => {
            this.plugin.settings.includeLinks = value;
            this.saveSettingsDebounced();
          })
      );

    new Setting(containerEl)
      .setName("Append images")
      .setDesc("Include a list of image embeds (hotlinked) at the end of the note.")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.includeImages)
          .onChange(async (value) => {
            this.plugin.settings.includeImages = value;
            this.saveSettingsDebounced();
          })
      );

    containerEl.createEl("h3", { text: "Prompt (advanced)" });

    new Setting(containerEl)
      .setName("Use custom prompt")
      .setDesc("When on, the prompt below overrides the built-in prompt.")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.useCustomPrompt)
          .onChange(async (value) => {
            this.plugin.settings.useCustomPrompt = value;
            this.saveSettingsDebounced();
          })
      );

    new Setting(containerEl)
      .setName("Custom prompt")
      .setDesc(
        "Leave blank to keep using the built-in prompt. Insert the default to edit a copy, or clear to start fresh."
      )
      .addButton((btn) =>
        btn
          .setButtonText("Insert default prompt")
          .setTooltip("Copy the shipped prompt into the box so you can edit it.")
          .onClick(() => {
            this.plugin.settings.customPrompt = PROMPT_TEMPLATE;
            if (promptArea) promptArea.setValue(PROMPT_TEMPLATE);
            this.saveSettingsDebounced();
          })
      )
      .addButton((btn) =>
        btn
          .setButtonText("Clear")
          .setTooltip("Empty the custom prompt box.")
          .onClick(() => {
            this.plugin.settings.customPrompt = "";
            if (promptArea) promptArea.setValue("");
            this.saveSettingsDebounced();
          })
      )
      .addButton((btn) =>
        btn
          .setButtonText("Revert to default")
          .setTooltip("Stop using a custom prompt and discard it.")
          .onClick(() => {
            const confirmed = window.confirm("Revert to the built-in prompt and discard the custom one?");
            if (!confirmed) return;
            this.plugin.settings.useCustomPrompt = false;
            this.plugin.settings.customPrompt = "";
            this.saveSettingsDebounced();
            // Also refresh the toggle state visually
            this.display();
          })
      );

    let promptArea: TextAreaComponent | null = null;
    new Setting(containerEl)
      .setName("Prompt text")
      .setDesc("Only used when 'Use custom prompt' is ON.")
      .addTextArea((text) => {
        promptArea = text;
        text
          .setPlaceholder("Custom prompt (optional)")
          .setValue(this.plugin.settings.customPrompt)
          .onChange(async (value) => {
            this.plugin.settings.customPrompt = value;
            this.saveSettingsDebounced();
          });
      });

    // Adjust rows and class if the textarea exists
    if (promptArea) {
      promptArea.inputEl.rows = 14;
      promptArea.inputEl.addClass("osint-ner-prompt-area");
    }
    } catch (err) {
      console.error("Failed to render OSINT Entity Extractor settings", err);
      containerEl.createEl("p", {
        text: "Settings failed to load. See console for details."
      });
    }
  }
}
