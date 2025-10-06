#!/usr/bin/env node

// @ts-ignore
import meow from "meow";

import fs from "fs";
import path from "path";
import Cosmo from "../src/app";

const AVAILABLE_THEMES = ["aura", "dracula", "atomOne", "catppuccin"] as const;

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
      colorscheme: { type: "string", default: "aura" },
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
  }

  const colorscheme = cli.flags.colorscheme as string;

  if (!AVAILABLE_THEMES.includes(colorscheme as any)) {
    console.error(`\n❌ Invalid theme: "${colorscheme}"`);
    console.error(`Available themes: ${AVAILABLE_THEMES.join(", ")}`);
    process.exit(1);
  }

  // Run the app with optional file and selected theme
  await Cosmo({ file: filePath, colorscheme: colorscheme });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
