# SigwaPH — Feature Checklist

Track by feature. A feature is done when every box under it is checked. No days — work at your own pace.

---

## Project Setup

- [x] Next.js 16 scaffolded with TypeScript and Tailwind, no src directory
- [x] shadcn/ui initialized
- [x] Recharts installed
- [x] Folder structure in place: `app/`, `components/`, `lib/`, `types/`
- [x] Git repo initialized, first commit pushed

---

## TypeScript Types — types/storms.ts

- [ ] `IBTraCSRecord` interface — raw CSV row fields (sid, name, season, lat, lon, wind, pres, time)
- [ ] `StormTrackPoint` interface — parsed 6-hour point (lat, lon, windKnots, timestamp)
- [ ] `TyphoonStorm` interface — full storm object (name, season, trackPoints inside PAR, totalACE, peakWind, durationInPAR)
- [ ] `SeasonSummary` interface — (year, totalACE, stormCount, mostEnergeticStorm)
- [ ] `LiveAdvisory` interface — (stormName, currentWind, currentLat, currentLon, runningACE, isInsidePAR)
- [ ] `HistoricalMetrics` interface — (allTimeTopStorm, mostActiveSeason, avgACEPerStorm)

---

## Utility — utils/parFilter.ts

- [ ] `PAR_BOUNDS` constant defined (north: 25, south: 5, east: 135, west: 115)
- [ ] `isInsidePAR(lat, lon)` — returns boolean, checks coordinate against bounding box
- [ ] `filterTrackToPAR(trackPoints)` — returns only the track points inside PAR
- [ ] Verified with known typhoon coordinates (e.g. Yolanda made landfall at ~11°N, 125°E — inside PAR)

---

## Utility — utils/aceCalc.ts

- [ ] `calcACEPoint(windKnots)` — returns `windKnots²` for a single 6-hour reading
- [ ] `calcStormACE(parTrackPoints)` — sums ACE across all PAR track points for one storm
- [ ] `calcSeasonACE(storms)` — sums total ACE across all storms in a given season year
- [ ] `calcHistoricalPercentile(stormACE, allStorms)` — returns what percentage of historical storms this ACE exceeds
- [ ] Formula verified: a storm at 100 knots for one interval contributes 10,000 ACE units

---

## Utility — utils/stormAnalytics.ts

- [ ] `rankStormsByACE(storms)` — returns storms sorted descending by totalACE
- [ ] `groupBySeason(storms)` — returns `SeasonSummary[]` aggregated by year
- [ ] `getHistoricalMetrics(storms)` — returns all-time top storm, most active season, average ACE
- [ ] `getACEDistribution(storms)` — returns bucketed ACE ranges for distribution chart

---

## Data Layer — app/services/ibtracs.ts

- [ ] Fetch IBTrACS Western Pacific CSV from NOAA endpoint
- [ ] Parse CSV rows into typed `IBTraCSRecord[]`
- [ ] Filter rows to PAR coordinates using `parFilter.ts`
- [ ] Group rows by storm ID into `TyphoonStorm[]`
- [ ] Compute ACE per storm using `aceCalc.ts`
- [ ] Cache with appropriate revalidation (historical data does not change often)
- [ ] Error handling for failed fetch or malformed CSV rows
- [ ] Verified: known storms appear with correct ACE values

---

## Data Layer — app/services/liveFeed.ts

- [ ] Fetch JMA latest Western Pacific advisory
- [ ] Parse active storm track points from advisory format
- [ ] Check if any active storm is inside or approaching PAR using `parFilter.ts`
- [ ] Compute running ACE for active storm from available track points
- [ ] Return `LiveAdvisory | null` — null when no active storms exist
- [ ] Revalidate every 6 hours (matches JMA advisory update frequency)
- [ ] Graceful handling when no active storm exists (null state, not an error)

---

## Server Pipeline — app/page.tsx

- [ ] Page is a server component
- [ ] Calls both `getHistoricalStorms()` and `getLiveAdvisory()` in parallel
- [ ] Runs all analytics utilities on historical data
- [ ] Passes typed props to all child components
- [ ] Confirmed: both data layers flowing correctly in terminal logs

---

## Feature: Metric Strips (Historical)

- [ ] 3 KPI cards in responsive row
- [ ] Card 1: Most energetic typhoon ever in PAR — name + ACE value
- [ ] Card 2: Most active season — year + total seasonal ACE
- [ ] Card 3: Average ACE per typhoon entering PAR (all-time)
- [ ] Wired to real historical data

---

## Feature: ACE Rankings Table

- [ ] Table columns: Rank | Storm Name | Season | Peak Wind (knots) | Duration in PAR | Total ACE
- [ ] Sorted by ACE descending by default
- [ ] Filter dropdown by decade (e.g. 1990s, 2000s, 2010s, 2020s)
- [ ] Filter dropdown by season year
- [ ] Footnote citing ACE formula and Bell et al. (2000) reference
- [ ] Wired to real historical data

---

## Feature: Season Summary Chart

- [ ] Bar chart — X axis: season year, Y axis: total seasonal ACE
- [ ] Hover tooltip showing year, total ACE, number of storms that season
- [ ] Responsive container
- [ ] Wired to real historical data

---

## Feature: ACE Distribution Chart

- [ ] Chart showing how ACE values are spread across all historical PH storms
- [ ] Buckets: 0–10k, 10k–25k, 25k–50k, 50k–100k, 100k+
- [ ] Shows where most storms cluster and how far outliers sit
- [ ] Hover tooltip showing count per bucket
- [ ] Wired to real historical data

---

## Feature: Live ACE Tracker

- [ ] Conditionally renders only when `LiveAdvisory` is not null
- [ ] When no active storm: clean empty state — "No active typhoon in or approaching PAR"
- [ ] When active storm exists:
  - [ ] Storm name and current wind speed displayed
  - [ ] Running ACE counter displayed
  - [ ] Historical percentile shown — "Exceeds X% of all typhoons on record in PAR"
  - [ ] PAR entry status — inside PAR, approaching PAR, or tracking away
- [ ] Wired to live JMA data

---

## Polish

- [ ] Loading skeletons on all components
- [ ] Empty states handled cleanly (no active storm, no historical data)
- [ ] Mobile layout verified — all components stack correctly
- [ ] No console errors or hydration warnings

---

## Docker

- [ ] `output: 'standalone'` added to `next.config.ts`
- [ ] Multi-stage Dockerfile written (builder → runner)
- [ ] `.dockerignore` created
- [ ] `docker-compose.yml` created
- [ ] App builds successfully inside container
- [ ] App confirmed working at `localhost:3000` from container
- [ ] Image size checked

---

## AWS EC2 Deployment

- [ ] EC2 t2.micro launched, Security Group ports 22 and 80 open
- [ ] SSH access confirmed
- [ ] Docker installed on instance
- [ ] Image built and running on instance
- [ ] App accessible at public EC2 IP from external network

---

## Final Wrap-Up

- [ ] EC2 public IP added to README
- [ ] Screenshot of live dashboard added to README
- [ ] `DEPLOYMENT.md` written with exact steps
- [ ] Final commit pushed to GitHub
