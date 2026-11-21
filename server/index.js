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
const itineraries = new Map([
 ["combo-1", { id: "combo-1", from: "Brussels", to: "Amsterdam", price: 34.90, duration: 168, legs: ["br-an-1", "an-ro-1", "ro-am-1"] }],
 ["combo-2", { id: "combo-2", from: "Brussels", to: "Paris", price: 45.50, duration: 210, legs: ["br-li-1", "li-pa-1"] }]
]);
for (const [id, itinerary] of itineraries) catalogue.set(id, itinerary);
app.post("/api/checkout", async (req, res) => {
 try {
  if (!stripe) return res.status(503).json({error:"Stripe test key missing. Configure STRIPE_SECRET_KEY in .env"});
  const { journeyId, passengers, date } = req.body || {};
  const item = catalogue.get(journeyId);
  if (!item || !Number.isInteger(passengers) || passengers < 1 || passengers > 5 || !/^\d{4}-\d{2}-\d{2}$/.test(date || "")) return res.status(400).json({error:"Invalid journey details"});
  const session = await stripe.checkout.sessions.create({
   mode: "payment", payment_method_types: ["card"],
   line_items: [{price_data: {currency:"eur", unit_amount:Math.round(item.price*100),product_data:{name:`DEMO itinerary: ${item.from} → ${item.to}`,description:"Hackathon simulation — no valid train ticket issued"}},quantity:passengers}],
   success_url:`${origin}/?stripe_session_id={CHECKOUT_SESSION_ID}`,
   cancel_url:`${origin}/?checkout_cancelled=1`,
   metadata:{journeyId, date, passengers:String(passengers), demo:"true"}
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
  res.json({paid, journeyId:paid ? item.id : null, date:paid ? s.metadata.date : null, passengers:paid ? quantity : null});
 } catch { res.status(400).json({error:"Unable to verify checkout"}); }
});
app.listen(process.env.PORT || 4242, () => console.log("Routa demo API running on port", process.env.PORT || 4242));
