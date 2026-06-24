# SigwaPH

> _Sigwa_ (Filipino) — a storm, squall, or violent gale

A dual-layer typhoon analytics dashboard focused on the Philippine Area of Responsibility (PAR). SigwaPH combines a historical storm database going back decades with a live advisory feed for active typhoons — both unified under a single analytical lens: **Accumulated Cyclone Energy (ACE)**.

The Philippines sits within the **Western Pacific basin** — the ocean region where all Philippine typhoons form and travel through, monitored by the Japan Meteorological Agency (JMA). PAGASA defines the PAR as a fixed geographic boundary within that basin specifically for Philippine weather responsibility. SigwaPH uses JMA's basin-wide data as its source, then filters everything down to PAR — so only storms that actually entered Philippine waters are analyzed.

While PAGASA Signal numbers tell you how dangerous a storm is right now, ACE tells you how much total destructive energy a typhoon delivered over its entire lifetime inside Philippine waters. These are two completely different questions. SigwaPH answers both.

> ⚠️ This README is initial and subject to change as the project develops.

---

## The Problem

Every typhoon app does the same thing — show where the storm is on a map, display the current Signal number, list wind speed. That framing reduces a typhoon to its peak moment. It tells you nothing about a storm's cumulative destructive output.

Typhoon Ondoy (Ketsana) in 2009 was never above Signal 2. By peak intensity metrics it looks unremarkable. But it sat over Luzon for days, delivering sustained wind energy that caused catastrophic flooding. ACE captures this. Peak wind speed does not.

SigwaPH surfaces this hidden dimension across both historical records and live storms.

---

## What Is ACE

Accumulated Cyclone Energy is a real meteorological metric recognized by the World Meteorological Organization (WMO). It is computed as:

```
ACE = Σ (V²)   where V = maximum sustained wind speed in knots, sampled every 6 hours
```

Wind damage scales roughly with the square of wind speed — meaning a storm at 120 knots is not twice as destructive as one at 60 knots, it is approximately four times as destructive. Squaring the wind speed and summing across a storm's entire active lifetime gives a single number representing total energy output.

This is why a slow-moving moderate typhoon can have a higher ACE than a fast-moving intense one. The duration matters as much as the peak.

> Values produced by this app are computed from observed wind speed records and are analytical estimates. They are not official WMO or PAGASA energy assessments.

**Reference:** Bell, G. D., et al. (2000). _Climate Assessment for 1999._ Bulletin of the American Meteorological Society, 81(6), S1–S50.

---

## The Two Data Layers

### Layer 1 — IBTrACS Historical Database

The International Best Track Archive for Climate Stewardship (IBTrACS), maintained by NOAA, contains every recorded tropical cyclone globally with 6-hourly track points, wind speeds, and pressure readings. SigwaPH filters this dataset to storms whose tracks intersected the Philippine Area of Responsibility (PAR) and computes ACE for each storm's PAR lifetime.

This powers the historical analytics — rankings, decade comparisons, season summaries.

**Source:** `https://www.ncei.noaa.gov/data/international-best-track-archive-for-climate-stewardship-ibtracs/v04r00/access/csv/`  
License: Public domain, no authentication required

### Layer 2 — JMA Real-Time Feed (Filtered to PAR)

The Japan Meteorological Agency is the designated meteorological authority for the Western Pacific basin — the ocean region where all Philippine typhoons originate. JMA publishes live 6-hourly advisories for every active storm in that basin in RSMC Best Track format.

This is not a Western Pacific tracker. SigwaPH pulls JMA's basin-wide feed and immediately filters it to PAR coordinates. A storm forming near Japan or the Marianas is ignored unless its track enters the PAR boundary. When a PAR-relevant storm is active, SigwaPH computes its running ACE from available track points and compares it against the historical PAR database in real time.

This powers the live tracker — current ACE, PAR entry status, historical percentile ranking.

**Source:** `https://www.jma.go.jp/jma/jma-eng/jma-center/rsmc-hp-pub-eg/trackreal.html`  
License: Public domain

---

## The PAR Boundary

Typhoons form and travel across the broader Western Pacific basin — JMA's jurisdiction covers this entire ocean region. The Philippine Area of Responsibility is PAGASA's defined slice of that basin, within which PAGASA assumes responsibility for tracking and warning.

```
Western Pacific Basin (JMA monitors all of this)
        └── PAR — PAGASA's jurisdiction (SigwaPH filters to this)
                  North: 25°N  |  South: 5°N
                  East: 135°E  |  West: 115°E
                        └── Philippine landmass
```

Only track points falling within the PAR bounding box contribute to ACE calculations. A storm that formed near Guam but tracked north into Japan without entering PAR is excluded entirely.

---

## Features

### Historical Analytics

**ACE Rankings Table**
Every typhoon that entered PAR ranked by total ACE. Columns: Storm name, Season, Peak Wind, Duration in PAR, Total ACE. Filterable by decade and season.

**Season Summary Chart**
Total accumulated ACE across all storms per typhoon season. Visualizes which years were historically most energetic for the Philippines.

**ACE Distribution Chart**
Shows how ACE values are distributed across all historical PH storms — where most storms cluster and how far the outliers deviate.

**KPI Metric Strips**

- Most energetic typhoon ever to enter PAR (by ACE)
- Most active season on record (by total seasonal ACE)
- Average ACE per typhoon entering PAR

### Live Tracker (Active Storm Mode)

When JMA reports an active storm whose track intersects or is approaching PAR, the dashboard surfaces a live panel:

**Running ACE Counter**
Updates with each 6-hour advisory. Shows current ACE accumulation for the active storm.

**PAR Entry Projection**
Based on current track, flags whether the storm is projected to enter PAR and at what estimated wind speed.

**Historical Percentile**
"This storm's current ACE already exceeds X% of all typhoons that have entered PAR since records began." Contextualizes live data against the historical database in real time.

---

## Tech Stack

| Layer     | Choice                               | Reason                                   |
| --------- | ------------------------------------ | ---------------------------------------- |
| Framework | Next.js 15 (App Router) + TypeScript | Server-side data processing, ISR caching |
| Styling   | Tailwind CSS + shadcn/ui             | Consistent with LindolPH design system   |
| Charts    | Recharts                             | Bar, line, and distribution charts       |
| Runtime   | Bun (fallback: pnpm)                 | Faster installs and dev server           |
| Container | Docker (multi-stage build)           | Lean production image                    |
| Cloud     | AWS EC2 t2.micro                     | Free tier, consistent deployment pattern |

---

## Architecture

```
[ IBTrACS Historical CSV (NOAA) ]
        │
        ▼ Fetch + parse CSV into typed storm objects
        │ Filter to PAR bounding box coordinates
        │
        ▼ utils/aceCalc.ts
        │ Compute ACE per storm (Σ V² every 6hrs inside PAR)
        │ Rank all storms by total ACE
        │ Aggregate by season
        │
        ▼ Historical UI Layer
        ├── MetricStrips.tsx         (all-time KPIs)
        ├── ACERankingsTable.tsx     (ranked storm table)
        ├── SeasonSummaryChart.tsx   (annual ACE totals)
        └── ACEDistributionChart.tsx (spread of all storm ACE values)

[ JMA Live Feed (filtered to PAR coordinates) ]
        │
        ▼ Poll latest 6-hour advisory (revalidate: 21600)
        │ Check if active storm track intersects PAR
        │ Compute running ACE from available track points
        │
        ▼ Live UI Layer
        └── LiveACETracker.tsx       (running counter + historical percentile)
```

---

## Project Structure

```
sigwaph/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                       # Server component, orchestrates both data layers
│   └── services/
│       ├── ibtracs.ts                 # Historical CSV fetch and parse
│       └── liveFeed.ts                # JMA live advisory fetch
├── components/
│   ├── MetricStrips.tsx               # All-time KPI cards
│   ├── ACERankingsTable.tsx           # Historical rankings by ACE
│   ├── SeasonSummaryChart.tsx         # Annual ACE bar chart
│   ├── ACEDistributionChart.tsx       # ACE spread across all storms
│   └── LiveACETracker.tsx             # Active storm live panel
├── utils/
│   ├── aceCalc.ts                     # ACE formula + per-storm computation
│   ├── parFilter.ts                   # PAR bounding box coordinate filter
│   └── stormAnalytics.ts             # Rankings, season aggregation, percentile calc
├── types/
│   └── storms.ts                      # TypeScript interfaces for storm data
├── Dockerfile
├── .dockerignore
├── docker-compose.yml
└── README.md
```

---

## Running Locally

### With Bun

```bash
bun install
bun dev
```

### With Docker

```bash
docker-compose up --build
```

---

## Deployment

Deployed on AWS EC2 t2.micro via Docker multi-stage build.  
Live URL: `http://<ec2-public-ip>` — added after deployment.

---

## What This Project Demonstrates

- Parsing and processing a large historical CSV dataset server-side
- Applying a real WMO-recognized meteorological formula in TypeScript
- Integrating two data sources (historical + live) into a unified dashboard
- Conditional UI rendering based on live data availability (storm active vs no active storm)
- Multi-stage Docker builds and AWS EC2 deployment

---

## License

MIT — see [LICENSE](LICENSE).
