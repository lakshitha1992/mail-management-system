# DocuFlow — Mail & Document Management

DocuFlow is a lightweight, local-first mail and document management dashboard built with React and Tailwind CSS. It helps small teams draft, send, organize, and track simple mailbox and document workflows without a backend — everything runs in your browser using `localStorage` for demo data and persistence.

This repository contains the UI and components for composing messages, managing drafts, viewing sent items, handling password-reset requests, and administering users/permissions.

---

**Quick Overview**

- Modern, responsive dashboard UI with quick links and inline component rendering.
- Local-first demo data: `localStorage` is used for drafts, sent messages, and reset requests.
- Admin area includes user creation, permission management, company setup, and theme selector.

---

**Getting Started (Windows / PowerShell)**

Open PowerShell in the repository root and run:

```powershell
npm install
npm start
```

The dev server will start (usually on `http://localhost:3000`).

Build for production:

```powershell
npm run build
```

---

**Where to look**

- `src/pages/Dashboard.js` — Main layout, header, and sidebar.
- `src/pages/dashboard-components/` — All dashboard sections (Inbox, Compose, Sent, PasswordResetRequests, etc.).
- `public/` — Static assets.

---

**LocalStorage Keys & Demo Data**

You can inspect or seed the app with demo data using the browser DevTools → Application → Local Storage. Useful keys:

- `draft_mails_v1` — Draft messages (array)
- `sent_mails_v1` — Sent messages / outside mailbox (array)
- `password_reset_requests` — Password reset requests (array)
- `permissions_map` — Optional permission mapping
- `user` / `users` — Demo users
- `dashboard_last_inbox_seen` — Timestamp used to compute "new" messages on the Dashboard

The `Inbox` and other components include lightweight seeding logic so a fresh install will show sample items.

---

**How the Dashboard determines "New" messages**

The Dashboard compares message timestamps to the `dashboard_last_inbox_seen` value in `localStorage`. Clicking **Mark seen** sets that timestamp to now and clears the "new" count.

---

**Contributing**

Contributions are welcome. For best results:

- Open an issue to discuss larger changes first.
- Keep changes small and focused; one feature or bug per PR.
- Preserve the `localStorage` keys unless you add migration logic.

If you'd like, I can add templates for PRs and issues or a `CONTRIBUTING.md` file.

---

**Extras I can add for you**

- `LICENSE` (e.g., MIT) and `CONTRIBUTING.md`.
- A GitHub Actions workflow to build the app and publish the `build/` artifact.
- A short screenshot or GIF in this README showing the Dashboard overview and Inbox flows.

Tell me which one and I'll add it.

---

**Author / Contact**

- Pawan Anuruddha
- Facebook: https://web.facebook.com/pawan.anuruddha/

---

Thanks for building with DocuFlow — let me know if you want a polished README banner, badges, or screenshots added next!
