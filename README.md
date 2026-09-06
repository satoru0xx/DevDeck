# DevDeck

DevDeck is a minimalist, single-page browser workstation dashboard built to serve as a primary productivity hub. It consolidates search queries, essential documentation links, quick bookmarks, and a persistent scratchpad into a clean interface.

---

## Key Features

* **Multi-Engine Search Router:** Instantly execute search queries across Google, StackOverflow, MDN Web Docs, GitHub, and Figma using drop-down selection or prefix triggers (`gh:`, `so:`, `mdn:`, `fg:`).
* **Keyboard Shortcut:** Quick search focus triggered via `Cmd + K` or `Ctrl + K`.
* **Persistent Scratchpad:** Auto-saving textarea using `localStorage` for temporary notes, endpoints, or commands.
* **Dynamic Bookmarks:** Add, view, and delete custom bookmarks with automated favicon rendering.
* **Frequent Hubs:** Quick navigation links for primary developer platforms.
* **Dual Time Display:** Real-time side-by-side display of local system time and UTC.
* **Data Portability:** Complete workspace backup and restoration via JSON export and import tools.
* **Responsive Design:** Mobile-adapted interface using CSS Grid and Flexbox for mobile and desktop screens.

---

## Tech Stack

* **HTML5:** Semantic structure and document layout.
* **CSS3:** Modern design system using CSS Variables, Flexbox, Grid, and media queries.
* **JavaScript (ES6+):** Pure vanilla JS handling `localStorage`, DOM manipulations, clock updates, and event routing without external dependencies.

---

## File Structure

```text
devdeck/
├── codehub.html    # Core layout and component markup
├── style.css     # Aesthetic design system, typography, and responsive rules
└── script.js    # Data state logic, storage management, and input routing
