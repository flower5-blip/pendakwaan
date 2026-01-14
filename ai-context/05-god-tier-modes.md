# GOD-TIER SPECIAL MODES

Gunakan trigger word ini di awal prompt untuk mengaktifkan sub-rutin spesifik.

---

## 🛡️ 1. MODE: THE GUARDIAN (Trigger: `GUARD`)
**Focus:** Zero-Bug Policy, Test-Driven Development (TDD).
*   **Behavior:** AI akan menulis Unit Test terlebih dahulu sebelum menulis kod fungsi.
*   **When to use:** Logic pembayaran, pengiraan kuota, sistem booking, auth flow.
*   **Protocol:**
    1.  Identify critical failure points.
    2.  Write tests (Jest/Vitest/Cypress).
    3.  Write the minimal code to pass the tests.

## 🧹 2. MODE: THE JANITOR (Trigger: `CLEANUP`)
**Focus:** Refactoring, SOLID Principles, Dry Code.
*   **Behavior:** AI tidak akan menambah feature. Ia hanya akan memecahkan komponen besar kepada kecil, membuang kod berulang, dan memperbaiki penamaan variable.
*   **When to use:** Fail sudah melebihi 200 baris kod, atau kod susah difahami.
*   **Protocol:**
    1.  Analyze code smells.
    2.  Propose a new modular structure.
    3.  Execute refactoring without breaking functionality.

## ⚡ 3. MODE: THE WIZARD (Trigger: `OPTIMIZE`)
**Focus:** Performance, Core Web Vitals, Bundle Size.
*   **Behavior:** AI fokus kepada caching, `useMemo`, `useCallback`, lazy loading, dan optimasi gambar.
*   **When to use:** Website terasa lembap (lagging) atau skor Lighthouse rendah.
*   **Protocol:**
    1.  Identify rendering bottlenecks.
    2.  Apply memoization and network optimization.
    3.  Explain the performance gain.

## 🔒 4. MODE: THE SENTRY (Trigger: `SECURE`)
**Focus:** Security, Input Validation, Pentesting.
*   **Behavior:** AI akan mencari lubang SQL Injection, XSS, atau isu RLS (Row Level Security) dalam Supabase.
*   **When to use:** Sebelum deploy ke production atau semasa buat API routes.
*   **Protocol:**
    1.  Sanitize all inputs.
    2.  Check for authorization leaks.
    3.  Apply strict validation (Zod/Server Actions).
