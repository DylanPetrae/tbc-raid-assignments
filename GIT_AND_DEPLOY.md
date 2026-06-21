# Pushing to GitHub and deploying to Vercel

Your project files are already in this folder, synced and verified (lint + build both pass). These are the steps to get it into your GitHub repo and live on Vercel. Run all commands from a terminal opened in this folder (`C:\Users\Timmone\Documents\Claude\tbc-raid-assignments`).

## 1. One-time setup (if you don't have these yet)

- Install [Node.js](https://nodejs.org) (LTS version) if you don't have it.
- Install [Git for Windows](https://git-scm.com/download/win) if you don't have it.

## 2. Install dependencies and test locally

```
npm install
npm run dev
```

Open `http://localhost:3000` in your browser. Click around — homepage, SSC, TK, and the Lady Vashj page should all work. Press `Ctrl+C` in the terminal to stop the dev server when done.

## 3. Initialize git and make your first commit

First, check this folder for a `.git` folder (it's hidden — enable "Show hidden items" in File Explorer, or just run the delete command below; it's harmless if nothing's there) and delete it if present:

```
rmdir /s /q .git
```

Then initialize fresh:

```
git init
git add .
git commit -m "Initial commit: Next.js scaffold with Lady Vashj boss template"
```

## 4. Connect to your GitHub repo and push

Your repo already exists at `https://github.com/DylanPetrae/tbc-raid-assignments`.

```
git branch -M main
git remote add origin https://github.com/DylanPetrae/tbc-raid-assignments.git
git push -u origin main
```

If it asks you to sign in, use your GitHub credentials (or it'll open a browser window to authenticate — follow the prompts).

If the push is rejected because the remote repo already has content (e.g. a README created on github.com), run this first, then push again:

```
git pull origin main --allow-unrelated-histories
```

You may need to resolve a conflict if both sides have a `README.md` — just keep whichever version you prefer and run `git add README.md && git commit` to finish the merge.

## 5. Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and sign in (use "Continue with GitHub").
2. Click **Import** next to your `tbc-raid-assignments` repo. If you don't see it, click "Adjust GitHub App Permissions" and grant Vercel access to the repo.
3. Leave all settings as default — Vercel auto-detects Next.js. Click **Deploy**.
4. After a minute or two, you'll get a live URL like `tbc-raid-assignments.vercel.app`.

From then on, every time you `git push` to the `main` branch, Vercel automatically rebuilds and redeploys the live site. No extra steps needed.

## Future updates

Whenever you want to publish changes (e.g. after we add a new boss):

```
git add .
git commit -m "Add <boss name> position template"
git push
```

Vercel picks it up automatically within a minute or two.
