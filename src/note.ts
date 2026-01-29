import { normalizePath, Vault, TFile } from "obsidian";

export function sanitizeFilename(name: string, maxLen = 120): string {
  let safe = name.trim();
  safe = safe.replace(/[<>:"/\\|?*]/g, "");
  safe = safe.replace(/\s+/g, " ").trim();
  safe = safe.replace(/[. ]+$/, "");
  if (!safe) safe = "untitled";
  if (safe.length > maxLen) safe = safe.slice(0, maxLen);
  return safe;
}

export function ensureFrontmatterPresent(note: string): string {
  if (!note.startsWith("---")) {
    throw new Error("Model output did not start with YAML frontmatter ('---').");
  }
  const second = note.indexOf("\n---", 3);
  if (second === -1) {
    throw new Error("Model output did not include a closing YAML frontmatter delimiter ('---').");
  }
  // Validate YAML parses to catch malformed frontmatter (bad indentation, scalars, etc.).
  try {
    const { parseYaml } = require("obsidian") as typeof import("obsidian");
    const yamlBlock = note.slice(3, second).trim();
    const parsed = parseYaml(yamlBlock);
    if (parsed === null || typeof parsed !== "object") {
      throw new Error("Frontmatter YAML is not an object.");
    }
  } catch (err: any) {
    const msg = err?.message || "Invalid YAML frontmatter.";
    throw new Error(`Invalid YAML frontmatter: ${msg}`);
  }
  return note;
}

async function ensureFolderExists(vault: Vault, folder: string): Promise<string> {
  const normalized = folder ? normalizePath(folder) : "";
  if (!normalized) return "";

  const adapter = vault.adapter;
  if (!(await adapter.exists(normalized))) {
    await vault.createFolder(normalized);
  }
  return normalized;
}

async function nextAvailablePath(vault: Vault, basePath: string): Promise<string> {
  const adapter = vault.adapter;
  if (!(await adapter.exists(basePath))) return basePath;

  const extIndex = basePath.lastIndexOf(".");
  const base = extIndex === -1 ? basePath : basePath.slice(0, extIndex);
  const ext = extIndex === -1 ? "" : basePath.slice(extIndex);
  let counter = 2;
  let candidate = `${base} (${counter})${ext}`;
  while (await adapter.exists(candidate)) {
    counter += 1;
    candidate = `${base} (${counter})${ext}`;
  }
  return candidate;
}

export async function saveNoteToVault(vault: Vault, folder: string, title: string, content: string): Promise<TFile> {
  const normalizedFolder = await ensureFolderExists(vault, folder);
  const filename = sanitizeFilename(title || "article") + ".md";
  const fullPath = normalizedFolder ? `${normalizedFolder}/${filename}` : filename;
  const uniquePath = await nextAvailablePath(vault, fullPath);
  const normalizedContent = content.endsWith("\n") ? content : `${content}\n`;
  return vault.create(normalizePath(uniquePath), normalizedContent);
}
