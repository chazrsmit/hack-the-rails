import QRCode from "qrcode";
import { useEffect, useMemo, useState } from "react";
import { journeys, stations } from "./data.js";

const STORAGE_KEY = "routa-demo-bookings";
const readBookings = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch { return []; }
};
const money = (value) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR" }).format(value);
const durationLabel = (minutes) => `${Math.floor(minutes / 60)}h ${minutes % 60 ? `${minutes % 60}m` : ""}`.trim();
const todayISO = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
};

function TrainMark() {
  return <img className="brand-mark" src="/train-mark.svg" alt="" width="36" height="36" />;
}

function RouteLine({ stops }) {
  return (
    <div className="route-line" aria-label={`Stops: ${stops.join(", ")}`}>
      <div className="route-track" />
      {stops.map((stop, index) => (
        <div className={`route-stop ${index === 0 || index === stops.length - 1 ? "endpoint" : ""}`} key={`${stop}-${index}`}>
          <span className="route-dot" />
          <span className="route-stop-label">{stop.replace("-Central", "").replace("-Centraal", "")}</span>
        </div>
      ))}
    </div>
  );
}

function App() {
  const [page, setPage] = useState("search");
  const [from, setFrom] = useState("Brussels");
  const [to, setTo] = useState("Amsterdam");
  const [date, setDate] = useState(todayISO());
  const [passengers, setPassengers] = useState("1");
  const [searched, setSearched] = useState(false);
  const [sort, setSort] = useState("recommended");
  const [visibleCount, setVisibleCount] = useState(5);
  const [selected, setSelected] = useState(null);
  const [passengerName, setPassengerName] = useState("");
  const [bookings, setBookings] = useState(readBookings);
  const [activeBooking, setActiveBooking] = useState(null);
  const [online, setOnline] = useState(navigator.onLine);
  const [notice, setNotice] = useState("");
  const [stripeLoading, setStripeLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("stripe_session_id");
    if (params.has("checkout_cancelled")) {
      setNotice("Stripe checkout was cancelled. No payment was taken.");
      window.history.replaceState({}, "", window.location.pathname);
    }
    if (!sessionId) return;
    let cancelled = false;
    async function verifyPayment() {
      try {
        const response = await fetch(`/api/checkout-status?session_id=${encodeURIComponent(sessionId)}`);
        const result = await response.json();
        if (!response.ok || !result.paid) throw new Error("Payment not verified. No booking was saved.");
        const journey = journeys.find((item) => item.id === result.journeyId);
        if (!journey) throw new Error("The paid itinerary was not found.");
        if (cancelled) return;
        const existing = readBookings();
        const existingBooking = existing.find((item) => item.stripeSessionId === sessionId);
        const booking = existingBooking || {
          id: `RT-${sessionId.slice(-8).toUpperCase()}`,
          stripeSessionId: sessionId,
          journey,
          date: result.date,
          passengers: result.passengers,
          passengerName: sessionStorage.getItem("routa-pending-name") || "Demo passenger",
          createdAt: new Date().toISOString(),
          status: "confirmed",
          paymentStatus: "paid_test"
        };
        if (!existingBooking) setBookings([booking, ...existing]);
        setActiveBooking(booking);
        setPage("confirmation");
        sessionStorage.removeItem("routa-pending-name");
      } catch (error) {
        if (!cancelled) setNotice(error.message);
      } finally {
        window.history.replaceState({}, "", window.location.pathname);
      }
    }
    verifyPayment();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
  }, [bookings]);

  const results = useMemo(() => {
    let list = journeys.filter((journey) => journey.from === from && journey.to === to);
    if (sort === "cheapest") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "fastest") list = [...list].sort((a, b) => a.duration - b.duration);
    if (sort === "recommended") {
      list = [...list].sort((a, b) => {
        const score = (item) => item.price / 60 + item.duration / 120;
        return score(a) - score(b);
      });
    }
    return list;
  }, [from, to, sort]);

  const recommendedId = useMemo(() => {
    if (!results.length) return null;
    return [...results].sort((a, b) =>
      (a.price / 60 + a.duration / 120) - (b.price / 60 + b.duration / 120)
    )[0].id;
  }, [results]);

  function runSearch(event) {
    event.preventDefault();
    if (from === to) {
      setNotice("Choose two different stations to search.");
      return;
    }
    setNotice("");
    setSearched(true);
    setVisibleCount(5);
    setPage("results");
    setSelected(null);
  }

  function startBooking(journey) {
    setSelected(journey);
    setPassengerName("");
    setPage("checkout");
  }

  async function payWithStripe() {
    if (!selected || !online) return;
    setStripeLoading(true);
    try {
      const response = await fetch("/api/checkout", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({journeyId:selected.id,passengers:Number(passengers),date})});
      const data = await response.json();
      if (!response.ok || !data.url) throw new Error(data.error || "Checkout unavailable");
      sessionStorage.setItem("routa-pending-name", passengerName.trim() || "Demo passenger");
      window.location.assign(data.url);
    } catch (error) {setNotice(error.message);} finally {setStripeLoading(false);}
  }

  function confirmBooking(event) {
    event.preventDefault();
    if (!selected || !passengerName.trim()) return;
    const booking = {
      id: `RT-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      journey: selected,
      date,
      passengers: Number(passengers),
      passengerName: passengerName.trim(),
      createdAt: new Date().toISOString(),
      status: "confirmed"
    };
    const updated = [booking, ...bookings];
    setBookings(updated);
    setActiveBooking(booking);
    setPage("confirmation");
  }

  function cancelBooking(id) {
    const updated = bookings.map((booking) =>
      booking.id === id ? { ...booking, status: "cancelled" } : booking
    );
    setBookings(updated);
    setActiveBooking(null);
    setPage("tickets");
  }

  function openBooking(booking) {
    setActiveBooking(booking);
    setPage("ticket");
  }

  function nav(nextPage) {
    setPage(nextPage);
    setNotice("");
  }

  const navItems = [
    { id: "search", label: "Search", symbol: "⌕" },
    { id: "tickets", label: "My journeys", symbol: "▤" }
  ];

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => nav("search")} aria-label="Routa home">
          <TrainMark />
          <span>routa<span className="brand-period">.</span></span>
        </button>
        <nav className="desktop-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <button key={item.id} className={page === item.id || (item.id === "tickets" && ["ticket", "confirmation"].includes(page)) ? "nav-link active" : "nav-link"} onClick={() => nav(item.id)}>
              {item.label}
              {item.id === "tickets" && bookings.filter((b) => b.status === "confirmed").length > 0 && <span className="nav-count">{bookings.filter((b) => b.status === "confirmed").length}</span>}
            </button>
          ))}
        </nav>
        <div className={`connection ${online ? "" : "offline"}`}><span className="connection-dot" />{online ? "Online" : "Offline mode"}</div>
      </header>

      {!online && <div className="offline-banner">You're offline. Saved journeys are available; live information and new bookings are paused.</div>}

      <main className="main-content">
        {page === "search" && (
          <section className="hero">
            <div className="eyebrow"><span className="eyebrow-line" /> A simpler way to travel</div>
            <h1>Good journeys<br /><span>start here.</span></h1>
            <p className="hero-copy">Find the train that works for you. Compare routes, keep your tickets close, and travel with less friction.</p>
            <form className="search-panel" onSubmit={runSearch}>
              <div className="field-grid">
                <label className="field">
                  <span>From</span>
                  <select value={from} onChange={(e) => setFrom(e.target.value)}>
                    {stations.map((station) => <option key={station}>{station}</option>)}
                  </select>
                </label>
                <button type="button" className="swap-button" aria-label="Swap departure and arrival" onClick={() => { setFrom(to); setTo(from); }}>⇄</button>
                <label className="field">
                  <span>To</span>
                  <select value={to} onChange={(e) => setTo(e.target.value)}>
                    {stations.map((station) => <option key={station}>{station}</option>)}
                  </select>
                </label>
                <label className="field">
                  <span>Departure</span>
                  <input type="date" value={date} min={todayISO()} onChange={(e) => setDate(e.target.value)} required />
                </label>
                <label className="field">
                  <span>Passengers</span>
                  <select value={passengers} onChange={(e) => setPassengers(e.target.value)}>
                    {[1,2,3,4,5].map((n) => <option key={n} value={n}>{n} {n === 1 ? "passenger" : "passengers"}</option>)}
                  </select>
                </label>
              </div>
              <button className="primary-button search-button" type="submit">Find trains <span aria-hidden="true">→</span></button>
              {notice && <p className="form-error" role="alert">{notice}</p>}
              <p className="demo-note">Demo timetable · Sample prices · No payment or real ticket issued</p>
            </form>
            <div className="trust-row">
              <span><span className="tiny-check">✓</span> Clear journey options</span>
              <span><span className="tiny-check">✓</span> Tickets saved offline</span>
              <span><span className="tiny-check">✓</span> Less digital clutter</span>
            </div>
          </section>
        )}

        {page === "results" && (
          <section className="content-section">
            <button className="back-link" onClick={() => nav("search")}>← Edit search</button>
            <div className="section-heading">
              <div>
                <div className="eyebrow">Your journey</div>
                <h1 className="page-title">{from} <span className="heading-arrow">→</span> {to}</h1>
                <p className="muted">{new Date(`${date}T12:00:00`).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })} · {passengers} {Number(passengers) === 1 ? "passenger" : "passengers"}</p>
              </div>
              <div className="result-count">{results.length} options</div>
            </div>
            <div className="results-toolbar">
              <span className="muted small">Sort by</span>
              <div className="sort-control">
                {[["recommended","Recommended"],["cheapest","Cheapest"],["fastest","Fastest"]].map(([value,label]) => <button key={value} className={sort === value ? "sort-option selected" : "sort-option"} onClick={() => { setSort(value); setVisibleCount(5); }}>{label}</button>)}
              </div>
            </div>
            {results.length === 0 ? (
              <div className="empty-state"><h2>No demo journeys found</h2><p>Try Brussels–Amsterdam, Brussels–Paris, Brussels–Antwerp or the reverse routes.</p><button className="secondary-button" onClick={() => nav("search")}>Change search</button></div>
            ) : (
              <div className="journey-list">
                {results.slice(0, visibleCount).map((journey) => (
                  <article className="journey-card" key={journey.id}>
                    <div className="journey-main">
                      <div className="journey-times">
                        <div><strong>{journey.depart}</strong><span>{journey.from}</span></div>
                        <div className="journey-duration"><span>{durationLabel(journey.duration)}</span><div className="duration-line"><i /></div><span>{journey.changes === 0 ? "Direct" : `${journey.changes} change`}</span></div>
                        <div className="arrival"><strong>{journey.arrive}</strong><span>{journey.to}</span></div>
                      </div>
                      <div className="journey-meta"><span>{journey.operator} · {journey.code}</span><span>{journey.stops.length} stops / stations</span></div>
                      <RouteLine stops={journey.stops} />
                    </div>
                    <div className="journey-action">
                      <div className="price">{money(journey.price)}<small> / person</small></div>
                      {journey.id === recommendedId && <span className="recommendation">Best balance of price & time</span>}
                      <button className="primary-button choose-button" onClick={() => startBooking(journey)} disabled={!online}>Select journey</button>
                    </div>
                  </article>
                ))}
                {visibleCount < results.length && <button className="load-more" onClick={() => setVisibleCount((n) => n + 5)}>Load more journeys</button>}
              </div>
            )}
            <p className="disclaimer">Illustrative journey data only. Times, operators and fares are not live or bookable.</p>
          </section>
        )}

        {page === "checkout" && selected && (
          <section className="content-section narrow-section">
            <button className="back-link" onClick={() => nav("results")}>← Back to results</button>
            <div className="eyebrow">Almost there</div>
            <h1 className="page-title">Passenger details</h1>
            <p className="muted">Review your selected journey and add a demo passenger name.</p>
            <div className="summary-card">
              <div className="summary-route"><strong>{selected.from}</strong><span>→</span><strong>{selected.to}</strong></div>
              <div className="summary-details">{selected.depart} – {selected.arrive} · {durationLabel(selected.duration)} · {new Date(`${date}T12:00:00`).toLocaleDateString("en-GB")}</div>
              <div className="summary-price">{money(selected.price * Number(passengers))}</div>
            </div>
            <form className="checkout-form" onSubmit={confirmBooking}>
              <label className="field"><span>Passenger name (demo only)</span><input value={passengerName} onChange={(e) => setPassengerName(e.target.value)} maxLength="70" autoComplete="off" placeholder="e.g. Alex Morgan" required /></label>
              <div className="notice-box"><strong>Demo checkout</strong><p>You can save an itinerary without paying, or open Stripe test checkout. Neither option issues a real railway ticket. Do not enter real personal information.</p></div>
              <button className="primary-button full-button" type="submit" disabled={!online}>Save demo itinerary without payment <span>→</span></button>
              <button className="secondary-button full-button" type="button" disabled={!online || stripeLoading} onClick={payWithStripe}>{stripeLoading ? "Opening Stripe…" : "Pay with Stripe (test mode) →"}</button>
              {notice && <p className="form-error" role="alert">{notice}</p>}
              {notice && <p role="alert" className="form-error">{notice}</p>}
            </form>
          </section>
        )}

        {page === "confirmation" && activeBooking && (
          <section className="content-section narrow-section confirmation-section">
            <div className="success-icon">✓</div>
            <div className="eyebrow centered">Booking saved</div>
            <h1 className="page-title centered-title">You're all set.</h1>
            <p className="muted centered-text">Your demo journey is saved on this device and available offline.</p>
            <Ticket booking={activeBooking} />
            <BookingQR booking={activeBooking} />
            <div className="notice-box warning-box"><strong>Not a valid travel ticket</strong><p>This is a hackathon demonstration. No railway reservation has been made. Stripe payments, when used, are in test mode only.</p></div>
            <button className="primary-button full-button" onClick={() => openBooking(activeBooking)}>View my journey</button>
            <button className="text-button full-button" onClick={() => nav("search")}>Search another journey</button>
          </section>
        )}

        {page === "tickets" && (
          <section className="content-section">
            <div className="eyebrow">Your travel space</div>
            <h1 className="page-title">My journeys</h1>
            <p className="muted">Your saved bookings, together in one place.</p>
            {bookings.length === 0 ? (
              <div className="empty-state"><div className="empty-icon">▤</div><h2>No journeys yet</h2><p>Your confirmed demo bookings will appear here.</p><button className="primary-button" onClick={() => nav("search")}>Find a train</button></div>
            ) : (
              <div className="journey-list tickets-list">
                {bookings.map((booking) => (
                  <article className={`saved-card ${booking.status === "cancelled" ? "cancelled-card" : ""}`} key={booking.id}>
                    <div className="saved-card-top"><span className="booking-ref">{booking.id}</span><span className={booking.status === "confirmed" ? "status-pill" : "status-pill cancelled"}>{booking.status === "confirmed" ? "Saved" : "Cancelled"}</span></div>
                    <div className="summary-route"><strong>{booking.journey.from}</strong><span>→</span><strong>{booking.journey.to}</strong></div>
                    <div className="summary-details">{booking.journey.depart} – {booking.journey.arrive} · {new Date(`${booking.date}T12:00:00`).toLocaleDateString("en-GB")}</div>
                    <button className="secondary-button" onClick={() => openBooking(booking)}>View journey details →</button>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {page === "ticket" && activeBooking && (
          <section className="content-section narrow-section">
            <button className="back-link" onClick={() => nav("tickets")}>← My journeys</button>
            <div className="eyebrow">Journey details</div>
            <h1 className="page-title">Your itinerary</h1>
            <Ticket booking={activeBooking} />
            <BookingQR booking={activeBooking} />
            <div className="timeline-card">
              <h2>Journey timeline</h2>
              <div className="timeline">
                {activeBooking.journey.stops.map((stop, index) => <div className="timeline-stop" key={`${stop}-${index}`}><span className="timeline-dot" /><div><strong>{stop}</strong><small>{index === 0 ? activeBooking.journey.depart : index === activeBooking.journey.stops.length - 1 ? activeBooking.journey.arrive : "Scheduled stop"}</small></div></div>)}
              </div>
            </div>
            <OnDemandMap key={activeBooking.id} journey={activeBooking.journey} />
            <div className="notice-box"><strong>Offline access</strong><p>This itinerary is saved on this device. Live disruption information is unavailable in this demo.</p></div>
            {activeBooking.status === "confirmed" && <button className="danger-button full-button" onClick={() => cancelBooking(activeBooking.id)}>Remove demo booking</button>}
            <p className="disclaimer">Removing this demo booking does not cancel a real railway ticket.</p>
          </section>
        )}
      </main>

      <footer className="footer">
        <span>© 2026 Routa</span>
        <span>Designed for lighter digital journeys.</span>
        <span className="footer-demo">Hackathon prototype · Not for travel</span>
      </footer>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        {navItems.map((item) => <button key={item.id} className={page === item.id || (item.id === "tickets" && ["ticket", "confirmation"].includes(page)) ? "mobile-nav-item active" : "mobile-nav-item"} onClick={() => nav(item.id)}><span>{item.symbol}</span>{item.label}</button>)}
      </nav>
    </div>
  );
}

function BookingQR({ booking }) {
  const [dataUrl, setDataUrl] = useState("");
  useEffect(() => {
    let active = true;
    // Encode only an opaque demo reference, never passenger details or Stripe identifiers.
    QRCode.toDataURL(`ROUTA-DEMO:${booking.id}`, { width: 280, margin: 4, errorCorrectionLevel: "H", color: { dark: "#172c26", light: "#ffffff" } })
      .then(url => { if (active) setDataUrl(url); })
      .catch(() => { if (active) setDataUrl(""); });
    return () => { active = false; };
  }, [booking.id]);
  return <section className="qr-panel" aria-label="Demo booking QR code">
    <div><h2>Booking QR</h2><p>Scannable demo reference · Not a valid railway ticket</p></div>
    {dataUrl ? <img src={dataUrl} alt={`QR code containing demo booking reference ${booking.id}`} width="200" height="200" /> : <p>Generating QR code…</p>}
    <strong>{booking.id}</strong>
  </section>;
}

const CITY_COORDS = {
  Brussels:[50.8503,4.3517], Antwerp:[51.2194,4.4025], Amsterdam:[52.3676,4.9041],
  Rotterdam:[51.9244,4.4777], Paris:[48.8566,2.3522], Lille:[50.6292,3.0573],
  Berlin:[52.52,13.405], Prague:[50.0755,14.4378], Cologne:[50.9375,6.9603],
  Hamburg:[53.5511,9.9937], Milan:[45.4642,9.19], Zurich:[47.3769,8.5417]
};
function OnDemandMap({ journey }) {
  const [show, setShow] = useState(false);
  const stops = [journey.from, ...(journey.stops || []), journey.to];
  const coords = stops.map(name => CITY_COORDS[Object.keys(CITY_COORDS).find(city => name.toLowerCase().includes(city.toLowerCase()))]).filter(Boolean);
  const lats = coords.map(p => p[0]); const lons = coords.map(p => p[1]);
  const bbox = coords.length ? [Math.min(...lons)-0.65,Math.min(...lats)-0.4,Math.max(...lons)+0.65,Math.max(...lats)+0.4].join(",") : null;
  return <section className="map-panel">
    <div className="map-heading"><div><h2>Explore the route</h2><p>Optional map · Loaded only when requested</p></div>
      <button className="secondary-button" type="button" aria-expanded={show} onClick={() => setShow(v => !v)}>{show ? "Hide interactive map" : "Show interactive map ↗"}</button>
    </div>
    {show && (bbox ? <><iframe title={`OpenStreetMap overview of ${journey.from} to ${journey.to}`} loading="lazy" referrerPolicy="no-referrer" src={`https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik`} />
      <p className="map-caption">Geographic overview only, not a verified rail track or live route. Map data © OpenStreetMap contributors. Requires internet access.</p></> : <p className="map-caption">A map preview is not available for this demonstration itinerary.</p>)}
  </section>;
}

function Ticket({ booking }) {
  return (
    <div className="ticket-card">
      <div className="ticket-top"><div className="ticket-brand"><img src="/train-mark.svg" alt="" width="26" height="26" /> routa.</div><span className="demo-ticket">DEMO TICKET</span></div>
      <div className="ticket-cities"><div><small>FROM</small><strong>{booking.journey.from}</strong><b>{booking.journey.depart}</b></div><div className="ticket-arrow">→</div><div><small>TO</small><strong>{booking.journey.to}</strong><b>{booking.journey.arrive}</b></div></div>
      <div className="ticket-rule"><span /><span /></div>
      <div className="ticket-info"><div><small>PASSENGER</small><strong>{booking.passengerName}</strong></div><div><small>DATE</small><strong>{new Date(`${booking.date}T12:00:00`).toLocaleDateString("en-GB")}</strong></div><div><small>REFERENCE</small><strong>{booking.id}</strong></div><div><small>STATUS</small><strong>{booking.status === "confirmed" ? "Saved locally" : "Cancelled"}</strong></div></div>
      <div className="ticket-bottom">Illustrative only · Not valid for travel</div>
    </div>
  );
}

export default App;
