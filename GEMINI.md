# GEMINI.md

## Project Overview

`CosmoFlow` is a command-line tool for visualizing and exploring graphs and trees directly in the terminal. It's built with TypeScript and uses React and `react-curse` to render the graph. It can be used as a CLI tool or as a package in a project.

**Main Technologies:**

*   TypeScript
*   React
*   `react-curse`
*   `meow` (for CLI argument parsing)
*   `rollup` (for bundling)

**Architecture:**

The project is a monorepo with the following structure:

*   `bin/cli.ts`: The entry point for the CLI tool.
*   `src/app.tsx`: The main React component that renders the graph.
*   `src/graph.ts`: A class that represents the graph and handles loading and manipulation.
*   `src/components`: A directory with React components used to render the graph.
*   `src/hooks`: A directory with React hooks.

## Building and Running

**Installation:**

```bash
npm install
```

**Running in development mode:**

```bash
npm run dev
```

This will run the CLI tool in development mode.

**Building for production:**

```bash
npm run build
```

This will build the project and create the distributable files in the `dist` directory.

**Running the CLI tool:**

After building the project, you can run the CLI tool with the following command:

```bash
./dist/cjs/cli.cjs --file mock/small_tree.json
```

The `--file` flag only accepts `.json`, `.yaml`, or `.yml` files.

You can also link the package to make the `cosmo` command available globally:

```bash
npm run link
```

Then you can run the tool like this:

```bash
cosmo --file <path-to-json-file>
```

## Development Conventions

*   **Coding Style:** The project uses Prettier for code formatting. You can run `npm run format` to format the code.
*   **Testing:** There are no tests in the project yet. This is something that could be added in the future.
*   **Contribution Guidelines:** There are no contribution guidelines in the project yet. This is something that could be added in the future.
