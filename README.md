# Deadline edition: multi-leg + Stripe test checkout

This version adds **illustrative combined journeys** and a small **Express server for Stripe-hosted Checkout in test mode**. The server recalculates prices from its own catalogue, never trusting a price sent by the browser. **No real railway ticket is issued**.

## Start (two terminals)

```bash
npm install
cp .env.example .env
# Edit .env and insert your Stripe TEST secret key (sk_test_...)
npm run server
```

In another terminal:

```bash
npm run dev
```

Visit http://localhost:5173. Search Brussels → Amsterdam or Brussels → Paris. Choose the combined option and press **Pay with Stripe (test mode)**. Use a Stripe test card from the official Stripe testing docs.

**Important:** A Stripe-hosted success redirect alone is not proof of payment. `/api/checkout-status` can verify a session server-side, but this deadline build does not yet reconcile a completed Stripe payment into a durable booking record. For production, add a verified Stripe webhook, an idempotent order record and authorised ticket issuance. The existing **Save demo itinerary** flow remains available for an end-to-end offline-friendly booking simulation.

Do not commit `.env` or secret keys. This project is a hackathon prototype, not production-ready.

---

# Routa — train booking demo

A mobile-first React/Vite hackathon prototype for searching, comparing and managing train journeys.

## What works

- Search journeys across a small set of illustrative routes.
- Sort by recommended balance, cheapest or fastest.
- Show a recommendation based on a transparent price/duration score.
- Select a journey and complete a simulated checkout.
- Save and view demo bookings on the current device.
- Remove a demo booking.
- View a lightweight journey timeline.
- Cache the app shell for offline opening (PWA/service worker).
- Keep saved demo itinerary data in localStorage so it can be viewed offline.

## Important limitations

This is a demonstration, not a railway booking service:
- Timetables, operators and prices are illustrative, not live.
- No ticket inventory is checked.
- No payment is collected.
- No real ticket is issued.
- No railway reservation is made.
- Demo bookings are stored locally in the browser and are not synchronised between devices.
- Do not enter real personal information.

## Run locally

Requires Node.js 20.19+ or 22.12+.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

To test the production build:

```bash
npm run build
npm run preview
```

Service workers and offline behaviour are best tested on `localhost` or an HTTPS deployment. After the first successful load, disconnect the network and reload the app. The app shell and locally saved demo journeys should remain available. Searching the small local sample dataset still works offline; live timetable/availability checks and new booking actions are unavailable.

## Ecodesign choices

- No external images, map tiles, web fonts or tracking scripts.
- One small local SVG logo.
- System font stack.
- CSS-only route diagrams and journey timeline.
- Small demonstration dataset; no search request is sent to a remote service.
- Results are limited, with an explicit "Load more" action.
- No infinite scroll, autoplay, video or decorative animation.
- Booking data is only written when a user confirms a demo booking.
- Offline cache is limited to the app shell and same-origin assets.
- Reduced-motion preference is respected.
- Mobile-first responsive CSS.

## API integration plan

The demo deliberately uses `src/data.js` rather than claiming to access live rail inventory.

Potential future data sources:
- SNCB public GTFS scheduled and real-time datasets (Belgium only; check the current licence and usage conditions).
- Belgian Mobility Open Data SIRI feeds for real-time Belgian transport information (developer access/key may be required for production polling).
- Navitia for journey planning where coverage and access rights are available.

These sources provide journey/timetable information; they do not automatically provide commercial ticket inventory, prices, payment or ticket issuance. A real booking product needs commercial agreements/integrations with operators or an authorised distributor.

Never expose provider credentials in frontend code. Put API calls behind a server-side endpoint and use environment variables for secrets.

## Security boundary

This prototype has no backend, authentication, payment processing or server-side personal-data storage. `localStorage` is not a secure database. The local demo storage is suitable only for non-sensitive hackathon demonstration data. A production implementation needs server-side identity and authorisation, secure session management, validated APIs, rate limiting, HTTPS, appropriate CSRF protections, secure headers, data minimisation, retention rules, audit logging and a security review.

## Brand

"Routa" is a temporary working name. Check trademark, company-name and domain availability before public/commercial use.
