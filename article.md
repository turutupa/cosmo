![Cosmo banner](https://raw.githubusercontent.com/turutupa/cosmo/refs/heads/main/images/banner.png)

# Meet Cosmo: A Graph Visualizer That Lives in Your Terminal

Visualize and explore complex data structures — right from your terminal. **Cosmo** is a fast, interactive graph visualizer that makes graphs and trees easy to understand, beautifully arranged, and fully explorable without ever leaving your command line.

![Preview](https://raw.githubusercontent.com/turutupa/cosmo/refs/heads/main/images/preview.png)

---

## Why Build Cosmo?

When working with complex data structures — trees, dependency maps, object graphs — it’s too easy to get lost. Most visualizers need a GUI, a canvas, or complex positioning logic. But what if all that could just _appear_ in your terminal?

That’s what Cosmo does. You feed it nodes and edges — and it automatically computes a clear, readable layout.

No coordinates. No configuration. Just render and explore.

Pan or search across your data. Every interaction is optimized for terminal fluidity — it feels like a minimal, responsive GUI built on ASCII art.

---

## Render Graphs Programmatically

Cosmo works seamlessly as part of your workflow. Pass your data structures directly from code and see them come to life:

```ts
import { cosmo } from "cosmo-flow";

const nodes = [
  { id: "1", value: "Root" },
  { id: "2", value: "Child" },
  { id: "3", value: "Leaf" },
];
const edges = [
  { id: "1-2", source: "1", target: "2" },
  { id: "2-3", source: "2", target: "3" },
];

cosmo({ nodes, edges });
```

No need to predefine coordinates or specify layout rules — Cosmo handles positioning automatically, ensuring a clean, balanced visual every time.

---

## Graphs from Files

Cosmo can also visualize graphs from JSON or YAML files with zero setup. Just run:

```bash
$ cosmo --file path/to/graph.json
```

Alternatively, Cosmo has a built-in file explorer lets you browse and search your filesystem for graph files — so you can open and switch files without leaving the terminal.

![Preview](https://raw.githubusercontent.com/turutupa/cosmo/refs/heads/main/images/file_explorer.png)

## Explore, Search, Navigate

Once running, navigation is effortless:

- **Pan:** Use arrow keys or `h`, `j`, `k`, `l` for navigation. Hold `Shift` while using these keys to pan faster.
- **Search:** Press `/` to find nodes by ID or value
- **Menu:** Access themes, keybindings, and commands with `Space` or `Escape`

With built-in color themes like `aura`, `dracula`, `atom`, and `catppuccin`, you can adapt the visualization to your preferred terminal look.

---

## Behind the Scenes

Cosmo uses a modern rendering layer built on [`react-curse`](https://github.com/infely/react-curse), enabling smooth interactivity in a purely terminal environment. This makes it fast enough to handle large data sets while maintaining clarity and aesthetics.

---

## Upcoming features include:

- Better edge paths
- In-place editing and edge rewiring.
- Live reload support.
- Layout customization.
- Export to SVG/PNG.

---

## Why You’ll Love It

If you’ve ever wanted to **see your data structures instead of imagining them**, Cosmo gives you that instant clarity — directly in your terminal session. It’s simple, elegant, and fits naturally into any developer workflow.

Explore the full project on GitHub:  
[https://github.com/turutupa/cosmo](https://github.com/turutupa/cosmo)
