import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import express from "express";
import Stripe from "stripe";
import "dotenv/config";
import { journeys } from "../src/data.js";
const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "8kb" }));
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const origin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const catalogue = new Map(journeys.map(j => [j.id, j]));
app.post("/api/checkout", async (req, res) => {
 try {
  if (!stripe) return res.status(503).json({error:"Stripe test key missing. Configure STRIPE_SECRET_KEY in .env"});
  const { journeyId, passengers, date, email } = req.body || {};
  const item = catalogue.get(journeyId);
  if (typeof email !== "string" || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return res.status(400).json({error:"Valid email address required"});
  if (!item || !Number.isInteger(passengers) || passengers < 1 || passengers > 5 || !/^\d{4}-\d{2}-\d{2}$/.test(date || "")) return res.status(400).json({error:"Invalid journey details"});
  const session = await stripe.checkout.sessions.create({
   mode: "payment", payment_method_types: ["card"],
   customer_email: email.trim(),
   line_items: [{price_data: {currency:"eur", unit_amount:Math.round(item.price*100),product_data:{name:`Itinerary: ${item.from} → ${item.to}`,description:"Stripe test payment — no train reservation issued"}},quantity:passengers}],
   success_url:`${origin}/?stripe_session_id={CHECKOUT_SESSION_ID}`,
   cancel_url:`${origin}/?checkout_cancelled=1`,
   metadata:{journeyId, date, passengers:String(passengers), testMode:"true"}
  });
  res.json({url:session.url});
 } catch (e) { console.error("Checkout error", e.message); res.status(500).json({error:"Could not start test checkout"}); }
});
app.get("/api/checkout-status", async (req,res) => {
 try {
  if (!stripe || typeof req.query.session_id !== "string" || !/^cs_test_[a-zA-Z0-9]+$/.test(req.query.session_id)) return res.status(400).json({error:"Invalid test session"});
  const s=await stripe.checkout.sessions.retrieve(req.query.session_id);
  const item = catalogue.get(s.metadata?.journeyId);
  const quantity = Number(s.metadata?.passengers || 0);
  const paid = s.mode === "payment" && s.livemode === false && s.payment_status === "paid" && s.currency === "eur" && !!item && Number.isInteger(quantity) && s.amount_total === Math.round(item.price * 100) * quantity;
  res.json({paid, journeyId:paid ? item.id : null, date:paid ? s.metadata.date : null, passengers:paid ? quantity : null, email:paid ? (s.customer_details?.email || s.customer_email || "") : null});
 } catch { res.status(400).json({error:"Unable to verify checkout"}); }
});
// Production: serve Vite's built frontend from the same origin as the Stripe API.
const distDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../dist");
if (fs.existsSync(path.join(distDir, "index.html"))) {
  app.use(express.static(distDir, { index: false }));
  app.get(/^(?!\/api(?:\/|$)).*/, (req, res) => res.sendFile(path.join(distDir, "index.html")));
}
app.listen(process.env.PORT || 4242, () => console.log("Routa API running on port", process.env.PORT || 4242));
