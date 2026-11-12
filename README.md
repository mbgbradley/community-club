# Community Club - Prototype (GitHub Pages)

A static, no-build prototype of a private local-community club for Hudson, NY and Great Barrington, MA.
It runs entirely in the browser with fictional demo data (saved in each visitor's browser only), so you can design, click through and fine-tune everything before building the real database-backed version.

## What the prototype includes
- Invite-code join gate with roles (local, weekender, visitor, business owner) and a "vouched by" field
- Two communities with a switcher (add more in `config.js`)
- Business directory with search, categories, ratings and reviews, follow button
- Business deals + "From businesses you follow" feed (business-owner role posts deals)
- Community Q&A, events, classifieds and garage sales
- Rentals with landlord reviews and landlord-reviews-tenant
- Ride board: requests, offers, accept/decline, driver reviews, "willing to give rides in my area"
- Public teaser (events + directory names); everything else members-only

## Step-by-step: put it on GitHub Pages
1. Go to https://github.com and sign up (or sign in).
2. Click the **+** (top right) > **New repository**.
3. Name it, e.g. `community-club`. Choose **Public** (free GitHub Pages needs a public repo). Tick **Add a README file**. Click **Create repository**.
4. In the repo, click **Add file > Upload files**.
5. Drag in these files from this folder: `index.html`, `styles.css`, `app.js`, `data.js`, `config.js`. (Optional: the `supabase` folder and this README; GitHub will overwrite the placeholder README.) Click **Commit changes**.
6. Go to **Settings > Pages**. Under **Build and deployment**, set Source to **Deploy from a branch**, Branch **main**, folder **/ (root)**, then **Save**.
7. Wait 1-2 minutes. Your site appears at `https://YOUR-USERNAME.github.io/community-club/`. Refresh Settings > Pages to see the link.

## Fine-tuning workflow
- Open any file in the repo, click the pencil icon, edit, then **Commit changes**. The site redeploys in about a minute (hard-refresh with Ctrl/Cmd+Shift+R).
- `config.js`: brand name, tagline, invite codes, towns, roles, categories.
- `data.js`: demo businesses, events, rentals, rides. Replace with real data when ready.
- `styles.css`: colors (see `:root` variables at the top) and layout.
- `app.js`: features and screens.
- To test as a brand-new visitor: click "Reset demo data" in the footer, or use a private window.
- Demo invite codes: `HUDSON2026`, `BERKSHIRES`, `WELCOME`.

## Important limits of the prototype
- GitHub Pages is public. Anyone with the link can view the site and read `config.js` (including invite codes), so the member gate is only a demo. Do not enter real personal data, addresses or phone numbers.
- Nothing is shared between users: each browser has its own data. Real accounts, shared data, and true privacy need the database phase below.
- Payments and the free trial are not implemented yet.

## Phase 2: real accounts and shared data
`supabase/schema.sql` is a starter PostgreSQL schema (communities, memberships, businesses, posts, rentals, reviews, rides) with Row-Level Security so only approved members can read private content. Steps:
1. Create a free project at https://supabase.com.
2. Open **SQL Editor**, paste `supabase/schema.sql`, run it.
3. Next build step: replace the localStorage calls in `app.js` with Supabase client calls (or move to Next.js as in your blueprint), add Supabase Auth, and add Stripe for membership fees after the trial.
Ask me for that next step whenever you're ready.
