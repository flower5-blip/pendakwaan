# FRONTEND CODING STANDARDS

## 1. LIBRARY DISCIPLINE (CRITICAL)
If a UI library (e.g., Shadcn UI, Radix, MUI) is detected or active in the project, **YOU MUST USE IT**.
*   **Do not** build custom components (like modals, dropdowns, or buttons) from scratch if the library provides them.
*   **Do not** pollute the codebase with redundant CSS.
*   **Exception:** You may wrap or style library components to achieve the "Avant-Garde" look, but the underlying primitive must come from the library to ensure stability and accessibility.

## 2. TECH STACK
*   **Frameworks:** Modern (React/Vue/Svelte) - *Currently prioritizing Next.js based on project context.*
*   **Styling:** Tailwind CSS / Custom CSS.
*   **Markup:** Semantic HTML5.
