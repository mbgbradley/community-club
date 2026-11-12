// Placeholder demo data (fictional names). Replace with real listings later.
const d = n => { const t = new Date(); t.setDate(t.getDate() + n); return t.toISOString().slice(0, 10); };
window.SEED = {
  user: null,
  follows: [],
  businesses: [
    { id: "b1", c: "hudson", name: "Riverside Roasters", cat: "Food & Drink", addr: "Warren St, Hudson", desc: "Small-batch coffee and pastries. Locals' morning stop." },
    { id: "b2", c: "hudson", name: "Hudson Handyman Co.", cat: "Home Services", addr: "Serving Columbia County", desc: "Repairs, painting, seasonal opening/closing of weekend homes." },
    { id: "b3", c: "hudson", name: "Second Story Books", cat: "Shops", addr: "Union St, Hudson", desc: "Used and rare books, community bulletin wall." },
    { id: "b4", c: "hudson", name: "Lotus Yoga Loft", cat: "Health & Wellness", addr: "Columbia St, Hudson", desc: "Drop-in classes for locals and weekenders." },
    { id: "b5", c: "great-barrington", name: "Berkshire Bread Works", cat: "Food & Drink", addr: "Main St, Great Barrington", desc: "Sourdough, sandwiches, weekend farm market stall." },
    { id: "b6", c: "great-barrington", name: "Housatonic Home Care", cat: "Home Services", addr: "Serving South Berkshire", desc: "Caretaking, plowing and house checks for second homes." },
    { id: "b7", c: "great-barrington", name: "Barrington Gallery Shop", cat: "Arts & Culture", addr: "Railroad St, Great Barrington", desc: "Local artists, prints and gifts." },
    { id: "b8", c: "great-barrington", name: "Stone Wall Inn", cat: "Lodging", addr: "Route 7, Great Barrington", desc: "Cozy inn for visitors and overflow guests." }
  ],
  reviews: [
    { id: "r1", key: "biz:b1", rating: 5, comment: "Best latte in town and friendly staff.", by: "Sample Member", date: d(-20) },
    { id: "r2", key: "biz:b2", rating: 4, comment: "Fixed our porch rail quickly. Fair price.", by: "Sample Member", date: d(-12) },
    { id: "r3", key: "biz:b5", rating: 5, comment: "Get there early on Saturdays!", by: "Sample Member", date: d(-8) },
    { id: "r4", key: "landlord:Pat Landlord", rating: 4, comment: "Responsive and fair about repairs.", by: "Sample Tenant", date: d(-40) }
  ],
  posts: [
    { id: "p1", c: "hudson", type: "qa", title: "Best place for a plumber on short notice?", body: "Pipe issue at our weekend house.", by: "Sample Weekender", date: d(-2), answers: [{ by: "Sample Local", text: "Ask Hudson Handyman Co. - they know a good plumber." }] },
    { id: "p2", c: "great-barrington", type: "qa", title: "Is there a winter farmers market?", body: "", by: "Sample Local", date: d(-1), answers: [] },
    { id: "p3", c: "hudson", type: "event", title: "Warren Street Gallery Walk", body: "Free, all ages.", where: "Warren St", when: d(6), by: "Sample Local", date: d(-3) },
    { id: "p4", c: "great-barrington", type: "event", title: "Holiday Market", body: "Local makers and cider.", where: "Town Hall lawn", when: d(10), by: "Sample Local", date: d(-3) },
    { id: "p5", c: "hudson", type: "classified", title: "Oak dining table with 6 chairs", body: "Good condition, pickup only.", price: "$250", by: "Sample Local", date: d(-4), sold: false },
    { id: "p6", c: "great-barrington", type: "garage_sale", title: "Moving sale - furniture, tools, books", body: "Saturday 9-2. Cash only.", price: "", where: "12 Elm St", by: "Sample Local", date: d(-1), sold: false },
    { id: "p7", c: "hudson", type: "deal", biz: "b1", title: "10% off for members", body: "Show your member badge at the counter.", code: "PORCH10", expires: d(30), by: "Riverside Roasters", date: d(-1) },
    { id: "p8", c: "great-barrington", type: "deal", biz: "b5", title: "Free cookie with any loaf", body: "Weekends only.", code: "LOAF", expires: d(20), by: "Berkshire Bread Works", date: d(-1) }
  ],
  rentals: [
    { id: "h1", c: "hudson", landlord: "Pat Landlord", title: "Sunny 2BR near Warren St", addr: "Near downtown Hudson", rent: 2200, beds: 2, desc: "Year-round lease, pets considered.", tenants: ["Sam Tenant"] },
    { id: "h2", c: "great-barrington", landlord: "Casey Owner", title: "Cottage, winter rental", addr: "South of downtown GB", rent: 1800, beds: 1, desc: "Oct-Apr, furnished.", tenants: [] }
  ],
  rides: [
    { id: "d1", c: "hudson", mode: "offer", from: "Hudson", to: "Great Barrington", when: d(2), seats: 3, notes: "Leaving ~9am via Route 23", by: "Sample Local", date: d(-1), responses: [] },
    { id: "d2", c: "great-barrington", mode: "request", from: "Great Barrington", to: "Hudson train station", when: d(3), seats: 1, notes: "Catching the noon train", by: "Sample Visitor", date: d(-1), responses: [] }
  ],
  drivers: [
    { c: "hudson", name: "Sample Local", area: "Hudson / Claverack", note: "Happy to give rides to the train" }
  ]
};
