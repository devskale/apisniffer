# Kataster / Grundstücksfläche m² — Austria-Only Sites

Websites where you can look up parcel/property area (m²) by address in Austria (focus on Vienna).

## Official / Government (Free)

| # | Site | URL | Description |
|---|------|-----|-------------|
| 1 | **BEV Kataster** | <https://kataster.bev.gv.at/> | Official Austrian cadastre by the Federal Office of Metrology and Surveying (BEV). Free, no login. Search by address, municipality, cadastral district, or parcel number. Shows parcel boundaries, area (m²), usage type, parcel number, address. Covers all of Austria. **Primary source.** |
| 2 | **Wien Baugrundkataster** | <https://www.wien.gv.at/baugk/public/> | City of Vienna's building-ground cadastre. Shows bore profiles, ground conditions, and parcel-level info for Vienna addresses. Vienna-only. |
| 3 | **Wien Flächenwidmungs- und Bebauungsplan** | <https://www.wien.gv.at/flaechenwidmung/public/> | Vienna zoning map. Enter an address → see zoning category, building height limits, GRZ (ground coverage ratio). Implicitly gives buildable area (m²) via GRZ × plot size. Vienna-only. |
| 4 | **Wien Geodatenviewer (MA 41)** | <https://www.wien.gv.at/stadtplanung/geodatenviewer> | Vienna's geodata viewer with cadastral layers, height benchmarks, and multi-purpose map info. More technical but has parcel/area data. Vienna-only. |
| 5 | **JustizOnline Grundstücksdatenbank** | <https://www.justiz.gv.at/service/datenbanken/grundbuch/> | Austrian judiciary's land register database (GDB). Combines Grundbuch + Kataster. Cost: ~€18 per query. Requires registration via an authorized billing entity. Shows parcel area, ownership, encumbrances. All Austria. |
| 6 | **oesterreich.gv.at – Kataster** | <https://www.oesterreich.gv.at/.syndication?pageId=903b3bbd-8081-4106-80e1-69d33523a422> | Info page (not a tool itself) explaining the Austrian cadastre system, what data it contains (location, area, usage, borders), and links to BEV Kataster and JustizOnline. |

## Maps / GIS Portals (Free, Austria-specific)

| # | Site | URL | Description |
|---|------|-----|-------------|
| 7 | **DORIS interMAP** | <https://www.doris.at/> | Digital map viewer (Upper Austria / Linz focused, but has national base data). Toggle "Kataster (DKM)" layer to see parcel boundaries, numbers, and usage symbols. Click parcels to get details. Free, no login. |
| 8 | **Wohnatlas** | <https://www.wohnatlas.at/en> | Interactive land-registry + cadastre map for Austria. Shows addresses, prices, schools, zoning. Click a parcel to see basic info including area. Free. |
| 9 | **GIS Steiermark – Kataster** | <https://www.landesentwicklung.steiermark.at/cms/beitrag/12549887/142970647/> | Historical cadastre viewer for Styria. Compare old vs new parcel boundaries. Also links to current cadastral data with area figures. Free. |

## Commercial / Paid Services (AT-focused)

| # | Site | URL | Description |
|---|------|-----|-------------|
| 10 | **grundbuch-auszug.at** | <https://grundbuch-auszug.at/> | Order official Grundbuch excerpts online. Search by address, parcel number, or EZ. Includes **Grundstücksfläche(n) und Nutzungen** (parcel areas + usage). No registration needed to search; pay per PDF. |
| 11 | **grundbuch.or.at** | <https://grundbuch.or.at/> | Another service for official Austrian land-register excerpts. Search parcels, get ownership + area data. Per-query fee. |
| 12 | **JUSLINE Grundstücksnummern-Suche** | <https://www.jusline.at/abfrageservices/grundstuecknummer-suchen> | Tool to find your Grundstücksnummer (GSTNR) and Einlagezahl (EZ) needed for online Grundbuch queries. Free search, paid for the actual excerpt. |
| 13 | **MeinGrundstück** | <https://meingrundstueck.at/grundstueck/kataster> | Info/portal explaining how to use BEV Kataster for parcel data (area, borders, address, usage). Links through to kataster.bev.gv.at. Not a standalone tool. |
| 14 | **Grundbuch+** | <https://grundbuchplus.com/produkte> | Paid service for Grundbuch excerpts + valuation estimates based on purchase contract data. |

## Discovered API ✅

**BEV Kataster** is fully open (no auth). API documented at [APIs/kataster-bev/README.md](APIs/kataster-bev/README.md).

| Endpoint | Purpose |
|----------|----------|
| `GET /api/all/?term={query}&layers=...` | Search by address |
| `GET /api/gst/{kg}/{gnr}/` | Parcel detail (area m², usage, EZ) |

Quick test: `curl -s "https://kataster.bev.gv.at/at.gv.bev.kataster/api/gst/01107/2311/" | jq '.properties.nutzungen[].fl'` → `227` (m²)

## Quick-Start Recommendation

**For Vienna address → m² in seconds:**
1. Go to **kataster.bev.gv.at** (free, official)
2. Search by address
3. Click the parcel on the map → see Fläche (m²), GSTNR, usage

**For Vienna zoning + buildable area:**
1. Go to **wien.gv.at/flaechenwidmung/public** (free, city of Vienna)
2. Enter address → get GRZ → multiply by plot m² from Kataster
