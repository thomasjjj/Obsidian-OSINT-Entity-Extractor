export interface ExtractedArticle {
  title: string;
  authors: string[];
  published: string;
  text: string;
  sourceGuess: string;
}

export interface PluginSettings {
  model: string;
  outputFolder: string;
  defaultTags: string;
  openAfterCreate: boolean;
  maxChars: number;
  apiKey?: string; // fallback storage when SecretStorage is unavailable
}

export const DEFAULT_SETTINGS: PluginSettings = {
  model: "gpt-5-mini",
  outputFolder: "articles",
  defaultTags: "news",
  openAfterCreate: true,
  maxChars: 12000,
  apiKey: ""
};
