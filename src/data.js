// Demonstration timetable only. These are illustrative journeys, not live schedules,
// prices, inventory or valid railway tickets.
export const journeys = [
  { id: "combo-1", from: "Brussels", to: "Amsterdam", operator: "SNCB + NS · combined", code: "MULTI-LEG", depart: "09:03", arrive: "11:51", duration: 168, changes: 2, price: 34.90, stops: ["Brussels-Central", "Antwerp-Central", "Rotterdam-Centraal", "Amsterdam-Centraal"] },
  { id: "combo-2", from: "Brussels", to: "Paris", operator: "Regional + TGV · combined", code: "MULTI-LEG", depart: "08:30", arrive: "12:00", duration: 210, changes: 1, price: 45.50, stops: ["Brussels-Midi", "Lille-Europe", "Paris-Nord"] },
  { id: "br-am-1", from: "Brussels", to: "Amsterdam", operator: "EuroCity", code: "EC  sable", depart: "08:52", arrive: "11:08", duration: 136, changes: 0, price: 29.90, stops: ["Brussels-Midi", "Antwerp-Central", "Rotterdam-Centraal", "Amsterdam-Centraal"] },
  { id: "br-am-2", from: "Brussels", to: "Amsterdam", operator: "Eurostar", code: "ES 9322", depart: "09:13", arrive: "11:05", duration: 112, changes: 0, price: 49.00, stops: ["Brussels-Midi", "Amsterdam-Centraal"] },
  { id: "br-am-3", from: "Brussels", to: "Amsterdam", operator: "EuroCity", code: "EC  sable", depart: "10:52", arrive: "13:08", duration: 136, changes: 0, price: 24.90, stops: ["Brussels-Midi", "Antwerp-Central", "Rotterdam-Centraal", "Amsterdam-Centraal"] },
  { id: "br-pa-1", from: "Brussels", to: "Paris", operator: "Eurostar", code: "ES 9315", depart: "08:17", arrive: "09:39", duration: 82, changes: 0, price: 39.00, stops: ["Brussels-Midi", "Paris-Nord"] },
  { id: "br-pa-2", from: "Brussels", to: "Paris", operator: "Eurostar", code: "ES 9327", depart: "10:17", arrive: "11:39", duration: 82, changes: 0, price: 54.00, stops: ["Brussels-Midi", "Paris-Nord"] },
  { id: "br-an-1", from: "Brussels", to: "Antwerp", operator: "SNCB", code: "IC 1831", depart: "09:03", arrive: "09:48", duration: 45, changes: 0, price: 9.80, stops: ["Brussels-Central", "Antwerp-Central"] },
  { id: "am-br-1", from: "Amsterdam", to: "Brussels", operator: "EuroCity", code: "EC  sable", depart: "16:52", arrive: "19:08", duration: 136, changes: 0, price: 29.90, stops: ["Amsterdam-Centraal", "Rotterdam-Centraal", "Antwerp-Central", "Brussels-Midi"] },
  { id: "pa-br-1", from: "Paris", to: "Brussels", operator: "Eurostar", code: "ES 9340", depart: "17:22", arrive: "18:44", duration: 82, changes: 0, price: 42.00, stops: ["Paris-Nord", "Brussels-Midi"] }
];

export const stations = ["Brussels", "Amsterdam", "Paris", "Antwerp"];
