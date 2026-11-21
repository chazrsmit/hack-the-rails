// Demonstration timetable only. These are illustrative journeys, not live schedules,
// prices, inventory or valid railway tickets.
export const journeys = [
  { id: "combo-1", from: "Brussels", to: "Amsterdam", operator: "SNCB + NS · combined", code: "MULTI-LEG", depart: "09:03", arrive: "11:51", duration: 168, changes: 2, price: 34.90, stops: ["Brussels-Central", "Antwerp-Central", "Rotterdam-Centraal", "Amsterdam-Centraal"] },
  { id: "combo-2", from: "Brussels", to: "Paris", operator: "Regional + TGV · combined", code: "MULTI-LEG", depart: "08:30", arrive: "12:00", duration: 210, changes: 1, price: 45.50, stops: ["Brussels-Midi", "Lille-Europe", "Paris-Nord"] },
  { id: "br-am-1", from: "Brussels", to: "Amsterdam", operator: "EuroCity", code: "EC  sable", depart: "08:52", arrive: "11:08", duration: 136, changes: 0, price: 29.90, stops: ["Brussels-Midi", "Antwerp-Central", "Rotterdam-Centraal", "Amsterdam-Centraal"] },
  { id: "br-am-2", from: "Brussels", to: "Amsterdam", operator: "Eurostar", code: "ES 9322", depart: "09:13", arrive: "11:05", duration: 112, changes: 0, price: 49.00, stops: ["Brussels-Midi", "Amsterdam-Centraal"] },
  { id: "br-am-3", from: "Brussels", to: "Amsterdam", operator: "EuroCity", code: "EC  sable", depart: "10:52", arrive: "13:08", duration: 136, changes: 0, price: 24.90, stops: ["Brussels-Midi", "Antwerp-Central", "Rotterdam-Centraal", "Amsterdam-Centraal"] },
  { id: "br-am-extra-1", from: "Brussels", to: "Amsterdam", operator: "EuroCity", code: "SAMPLE-EC-01", depart: "06:52", arrive: "09:08", duration: 136, changes: 0, price: 32.90, stops: ["Brussels-Midi", "Antwerp-Central", "Rotterdam-Centraal", "Amsterdam-Centraal"] },
  { id: "br-am-extra-2", from: "Brussels", to: "Amsterdam", operator: "Eurostar", code: "SAMPLE-ES-02", depart: "07:13", arrive: "09:05", duration: 112, changes: 0, price: 58.00, stops: ["Brussels-Midi", "Amsterdam-Centraal"] },
  { id: "br-am-extra-3", from: "Brussels", to: "Amsterdam", operator: "EuroCity", code: "SAMPLE-EC-03", depart: "07:52", arrive: "10:08", duration: 136, changes: 0, price: 28.90, stops: ["Brussels-Midi", "Antwerp-Central", "Rotterdam-Centraal", "Amsterdam-Centraal"] },
  { id: "br-am-extra-4", from: "Brussels", to: "Amsterdam", operator: "Eurostar", code: "SAMPLE-ES-04", depart: "11:13", arrive: "13:05", duration: 112, changes: 0, price: 69.00, stops: ["Brussels-Midi", "Amsterdam-Centraal"] },
  { id: "br-am-extra-5", from: "Brussels", to: "Amsterdam", operator: "EuroCity", code: "SAMPLE-EC-05", depart: "11:52", arrive: "14:08", duration: 136, changes: 0, price: 26.90, stops: ["Brussels-Midi", "Antwerp-Central", "Rotterdam-Centraal", "Amsterdam-Centraal"] },
  { id: "br-am-extra-6", from: "Brussels", to: "Amsterdam", operator: "EuroCity", code: "SAMPLE-EC-06", depart: "12:52", arrive: "15:08", duration: 136, changes: 0, price: 31.90, stops: ["Brussels-Midi", "Antwerp-Central", "Rotterdam-Centraal", "Amsterdam-Centraal"] },
  { id: "br-am-extra-7", from: "Brussels", to: "Amsterdam", operator: "Eurostar", code: "SAMPLE-ES-07", depart: "13:13", arrive: "15:05", duration: 112, changes: 0, price: 74.00, stops: ["Brussels-Midi", "Amsterdam-Centraal"] },
  { id: "br-am-extra-8", from: "Brussels", to: "Amsterdam", operator: "EuroCity", code: "SAMPLE-EC-08", depart: "14:52", arrive: "17:08", duration: 136, changes: 0, price: 27.90, stops: ["Brussels-Midi", "Antwerp-Central", "Rotterdam-Centraal", "Amsterdam-Centraal"] },
  { id: "br-am-extra-9", from: "Brussels", to: "Amsterdam", operator: "EuroCity", code: "SAMPLE-EC-09", depart: "15:52", arrive: "18:08", duration: 136, changes: 0, price: 33.90, stops: ["Brussels-Midi", "Antwerp-Central", "Rotterdam-Centraal", "Amsterdam-Centraal"] },
  { id: "br-am-extra-10", from: "Brussels", to: "Amsterdam", operator: "Eurostar", code: "SAMPLE-ES-10", depart: "17:13", arrive: "19:05", duration: 112, changes: 0, price: 64.00, stops: ["Brussels-Midi", "Amsterdam-Centraal"] },
  { id: "br-pa-1", from: "Brussels", to: "Paris", operator: "Eurostar", code: "ES 9315", depart: "08:17", arrive: "09:39", duration: 82, changes: 0, price: 39.00, stops: ["Brussels-Midi", "Paris-Nord"] },
  { id: "br-pa-2", from: "Brussels", to: "Paris", operator: "Eurostar", code: "ES 9327", depart: "10:17", arrive: "11:39", duration: 82, changes: 0, price: 54.00, stops: ["Brussels-Midi", "Paris-Nord"] },
  { id: "br-an-1", from: "Brussels", to: "Antwerp", operator: "SNCB", code: "IC 1831", depart: "09:03", arrive: "09:48", duration: 45, changes: 0, price: 9.80, stops: ["Brussels-Central", "Antwerp-Central"] },
  { id: "am-br-1", from: "Amsterdam", to: "Brussels", operator: "EuroCity", code: "EC  sable", depart: "16:52", arrive: "19:08", duration: 136, changes: 0, price: 29.90, stops: ["Amsterdam-Centraal", "Rotterdam-Centraal", "Antwerp-Central", "Brussels-Midi"] },
  { id: "pa-br-1", from: "Paris", to: "Brussels", operator: "Eurostar", code: "ES 9340", depart: "17:22", arrive: "18:44", duration: 82, changes: 0, price: 42.00, stops: ["Paris-Nord", "Brussels-Midi"] }
];

export const stations = ["Brussels", "Amsterdam", "Paris", "Antwerp"];
