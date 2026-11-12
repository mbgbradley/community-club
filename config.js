// ====== EASY SETTINGS: edit this file to fine-tune the prototype ======
window.CONFIG = {
  brand: "Porchlight",                       // working name - change to any of your 33 ideas
  tagline: "The private club for locals, weekenders and visitors. Ask, find, share, ride.",
  trialText: "Free 30-day trial, then membership fee (not enabled in this prototype).",
  // Demo invite codes. In the live version, members generate codes for friends.
  inviteCodes: ["HUDSON2026", "BERKSHIRES", "WELCOME"],
  communities: [
    { slug: "hudson", name: "Hudson, NY" },
    { slug: "great-barrington", name: "Great Barrington, MA" }
  ],
  roles: [
    { v: "local", l: "Full-time local" },
    { v: "weekender", l: "Weekender" },
    { v: "visitor", l: "Visitor" },
    { v: "business_owner", l: "Local business owner" }
  ],
  categories: ["Food & Drink", "Home Services", "Shops", "Health & Wellness", "Arts & Culture", "Lodging", "Other"]
};
