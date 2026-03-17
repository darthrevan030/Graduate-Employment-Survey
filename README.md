# Singapore Autonomous University Graduate Employment Survey Dashboard

An interactive data dashboard visualising Graduate Employment Survey (GES) data across Singapore's autonomous universities — exploring salary trends, full-time employment rates, and graduate outcomes by degree programme and institution.

🔗 **Live:** [ges.samarthbhatia.dev](https://ges.samarthbhatia.dev)

---

## Overview

The GES is conducted annually by NTU, NUS, SMU, SUSS, SUTD, and SIT in collaboration with the Ministry of Education. This dashboard makes that data explorable — letting you filter by university, school, and degree to compare outcomes across cohorts.

---

## Features

- **Interactive filtering** by university, school, and degree programme
- **Salary visualisations** — median gross monthly salary comparisons across programmes
- **Employment rate tracking** — full-time permanent employment rates by cohort
- **Multi-university comparison** across NTU, NUS, SMU, SUTD, SUSS, and SIT
- **Responsive design** — works across desktop and mobile

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Data pipeline | Python (`ges_data.py`) |
| Build tool | Vite |
| Deployment | Vercel |

---

## Project Structure

```
Graduate-Employment-Survey/
├── src/                  # Frontend source files
├── index.html            # Main entry point
├── ges_data.js           # Processed GES data (JS)
├── ges_data.py           # Data processing script (Python)
├── vite.config.js        # Vite configuration
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.8+

### Installation

```bash
git clone https://github.com/darthrevan030/Graduate-Employment-Survey.git
cd Graduate-Employment-Survey
npm install
```

### Running locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Building for production

```bash
npm run build
```

### Data pipeline

To regenerate the data from source:

```bash
python ges_data.py
```

---

## Data Source

Ministry of Education. (2022). *Graduate Employment Survey - NTU, NUS, SIT, SMU, SUSS & SUTD* (2026) [Dataset]. data.gov.sg. Retrieved March 6, 2026 from [https://data.gov.sg/datasets/d_3c55210de27fcccda2ed0c63fdd2b352/view](https://data.gov.sg/datasets/d_3c55210de27fcccda2ed0c63fdd2b352/view)

---

## Deployment

The project is deployed on Vercel with automatic deployments on push to `main`.

```bash
vercel --prod
```

---

## License

MIT
