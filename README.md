# Dreamer's Construction — portfolio site

Static company portfolio (Home, Projects, Services, About, Contact, and the interactive project map), published with GitHub Pages at
**https://zabulanakakil.github.io/Dreamers-Construction/**.

Everything the site shows lives in this repository:

| Folder | What it holds |
| --- | --- |
| `data/projects.csv` | One row per project — open and edit it in Excel |
| `data/services.json`, `partners.json`, `buildings.json`, `plots.json`, `sector-plots.json` | Services, client names, and map items |
| `public/images/` | Logo, photos, and map tiles |

## One-time GitHub setup

1. Push this folder as the root of the `Dreamers-Construction` repository (branch `main`).
2. On GitHub open **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Every push to `main` now builds and publishes the site (see the **Actions** tab).

### Contact form

The form sends mail through [Web3Forms](https://web3forms.com) (free):

1. Create an access key on web3forms.com using `dreamersconstr20@gmail.com`.
2. On GitHub open **Settings → Secrets and variables → Actions → Variables** and add a variable named `WEB3FORMS_KEY` with the key.
3. Re-run the deploy workflow.

Until a key is set, the Send button opens the visitor's email app with the message filled in.

## Updating projects

### From the local admin app (recommended)

The local XAMPP app in `web/` rewrites `web/portfolio-export/` every time project data is saved in the admin panel.
That folder has the same layout as this repo (`data/` and `public/images/`), so publishing an update is:

1. Save your changes in the local admin.
2. Copy the contents of `web/portfolio-export/` into this folder, replacing files when asked.
3. Commit and push.

To refresh the export by hand, run `npm run portfolio:export` inside `web/`.

> Close `projects.csv` in Excel before saving in the admin — Windows locks open files and the refresh is skipped (a warning is logged in the dev server).

### Editing the CSV directly

Open `data/projects.csv` in Excel, edit, and save it as **CSV UTF-8**.

| Column | Format |
| --- | --- |
| `slug` | Unique URL name, lowercase with dashes, e.g. `bup-interior-decoration` |
| `status` | `completed`, `ongoing`, or `upcoming` |
| `services` | Service ids separated by `\|`, e.g. `building-construction\|sports-complex` (ids are in `data/services.json`) |
| `featured`, `published` | `yes` or `no` — featured projects appear in the home page carousel |
| `images` | Image paths separated by `\|`, e.g. `/images/projects/site-1.jpg\|/images/projects/site-2.jpg` |
| `specs` | `Label: Value` pairs separated by `\|`, e.g. `Type: Sports Facility\|Surface: Synthetic turf` |
| `lat`, `lng` | Map coordinates (right-click a spot in Google Maps to copy them) |
| `map_kind` | Pin colour: `sports`, `canal`, `bridge`, `institutional`, `hq`, or `infrastructure` |
| `map_regions` | Optional. Map regions separated by `\|`, e.g. `dhaka\|bangladesh` — when blank, regions are worked out from `lat`/`lng` |
| `portfolio` | `construction` or `residences` |
| `parent`, `related` | Linked projects: a parent slug, and `slug:role` pairs (`interior_of`, `exterior_of`, `landscaping_of`, `design_for`, `commercial_of`, `other`) |
| `sector_x` … `sector_height` | Position on the Jolshiri Sector 14 master plan, in percent |

A project appears on the site when `published` is `yes`, it has a `location`, and it has either `lat`/`lng` or a sector position.

**Adding photos:** put the files in `public/images/projects/` and list their paths in the `images` column.
Large photos are converted to WebP automatically during the build, so the original `.jpg` name in the CSV keeps working.

## Running locally

```bash
npm install
npm run dev        # http://localhost:3001/Dreamers-Construction/
npm run build      # checks the data, optimises images, and writes out/
npm run preview    # serves out/ exactly as GitHub Pages will
```

`npm run data` only re-checks the data files; it prints the CSV line number for any mistake (missing slug, bad status, duplicate project, missing image).
