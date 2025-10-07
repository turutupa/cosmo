import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "rollup-plugin-typescript2";

export default [
  {
    input: "index.ts",
    external: [],
    plugins: [
      nodeResolve({ preferBuiltins: true }),
      commonjs(),
      typescript({
        tsconfig: "tsconfig.json",
        useTsconfigDeclarationDir: true,
        clean: true,
        tsconfigOverride: {
          compilerOptions: { declaration: true, declarationDir: "dist/types" },
        },
      }),
    ],
    output: {
      file: "dist/index.js",
      format: "esm",
      sourcemap: true,
    },
  },
  {
    input: "index.ts",
    external: [],
    plugins: [
      nodeResolve({ preferBuiltins: true }),
      commonjs(),
      typescript({
        tsconfig: "tsconfig.json",
        clean: true,
        tsconfigOverride: { compilerOptions: { declaration: false } },
      }),
    ],
    output: {
      file: "dist/index.cjs",
      format: "cjs",
      sourcemap: true,
    },
  },
  {
    input: "bin/cli.ts",
    external: [],
    plugins: [
      nodeResolve({ preferBuiltins: true }),
      commonjs(),
      typescript({
        tsconfig: "tsconfig.json",
        clean: true,
        tsconfigOverride: { compilerOptions: { declaration: false } },
      }),
    ],
    output: {
      file: "dist/cjs/cli.cjs", // Renamed to .cjs
      format: "cjs",
      sourcemap: true,
      // removed banner to avoid duplicate shebang lines
    },
  },
];
