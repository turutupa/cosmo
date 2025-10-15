#!/usr/bin/env node

// @ts-ignore
import meow from "meow";

import fs from "fs";
import path from "path";
import { cosmo } from "../index"; // use package entry so built CLI uses compiled code
import { Colorscheme } from "../src/hooks/useTheme";

const AVAILABLE_THEMES = ["aura", "dracula", "atom", "catppuccin"] as const;

const cli = meow(
  `
  Usage
    $ cosmo [--file FILE] [--colorscheme THEME]

  Options
    --file         Path to JSON file to load (optional)
    --colorscheme  Select a theme (${AVAILABLE_THEMES.join(", ")})

  Examples
    $ cosmo --file flow.json --colorscheme dracula
    $ cosmo --colorscheme atomOne
`,
  {
    importMeta: import.meta,
    flags: {
      file: { type: "string" },
      colorscheme: { type: "string" },
    },
  }
);

async function main() {
  let filePath: string | undefined;

  // Resolve file path if provided
  if (cli.flags.file) {
    filePath = path.resolve(process.cwd(), cli.flags.file);

    if (!fs.existsSync(filePath)) {
      console.error(`\n❌ File not found: ${filePath}\n`);
      process.exit(1);
    }

    const fileExtension = path.extname(filePath);
    if (![".json", ".yaml", ".yml"].includes(fileExtension)) {
      console.error(`\n❌ Invalid file type: ${fileExtension}\n`);
      console.error(`Please provide a .json, .yaml, or .yml file.`);
      process.exit(1);
    }
  }

  const colorscheme = cli.flags.colorscheme as Colorscheme;

  if (colorscheme && !AVAILABLE_THEMES.includes(colorscheme as any)) {
    console.error(`\n❌ Invalid theme: "${colorscheme}"`);
    console.error(`Available themes: ${AVAILABLE_THEMES.join(", ")}`);
    process.exit(1);
  }

  // Run the app with optional file and selected theme
  await cosmo({ file: filePath, colorscheme: colorscheme });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
