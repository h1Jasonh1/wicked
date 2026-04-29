export type ProductBadge = "New" | "Best Seller" | "Limited" | "Signature" | "Sale";

export type ProductForm = "pump" | "dropper" | "jar" | "tube" | "set";

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  collection: string;
  tag: string;
  badge: ProductBadge;
  price: number;
  compareAt?: number;
  rating: number;
  reviews: number;
  stock: number;
  stockNote: string;
  image: string;
  imageAlt: string;
  gallery: string[];
  variants?: string[];
  sizes?: string[];
  visual: {
    form: ProductForm;
    accent: string;
    texture: string;
  };
  description: string;
  longDescription: string;
  benefits: string[];
  details: string[];
  specs: string[];
  care: string;
  delivery: string;
  returns: string;
  filters: Array<"New" | "Popular" | "Premium" | "Sale">;
  releaseRank: number;
};

export type Collection = {
  name: string;
  slug: string;
  description: string;
  image: string;
  visualDirection: string;
};

export const brand = {
  name: "WICKED",
  mark: "WICKED",
  tagline: "Skincare with an edge.",
  description:
    "High-performance skincare for modern routines: clean formulas, bold results, and a black luxury point of view.",
};

export const heroImage =
  "https://images.unsplash.com/photo-1701056035595-58d01e6e50f1?auto=format&fit=crop&w=2400&q=88";

export const collections: Collection[] = [
  {
    name: "Daily Reset",
    slug: "daily-reset",
    description:
      "Cleansers and toners that leave skin fresh, balanced, and ready for the rest of the routine.",
    visualDirection: "Cleanse",
    image:
      "https://images.unsplash.com/photo-1764694071454-fa9417be04a7?auto=format&fit=crop&w=1400&q=84",
  },
  {
    name: "Targeted Actives",
    slug: "targeted-actives",
    description:
      "Serums built around visible glow, smooth texture, hydration, and clarity without complicated layering.",
    visualDirection: "Treat",
    image:
      "https://images.unsplash.com/photo-1751131964776-57e3cbca0a14?auto=format&fit=crop&w=1400&q=84",
  },
  {
    name: "Barrier Support",
    slug: "barrier-support",
    description:
      "Moisturisers, eye care, and calm daily support for skin that needs comfort and resilience.",
    visualDirection: "Repair",
    image:
      "https://images.unsplash.com/photo-1768235146417-4ccc5befad83?auto=format&fit=crop&w=1400&q=84",
  },
  {
    name: "Glow Sets",
    slug: "glow-sets",
    description:
      "Curated skincare bundles for simple morning, evening, and travel routines.",
    visualDirection: "Bundle",
    image:
      "https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=1400&q=84",
  },
];

const galleryScenes = ["studio", "texture", "routine"];

export const products: Product[] = [
  {
    id: "hydrating-gel-cleanser",
    slug: "hydrating-gel-cleanser",
    name: "Hydrating Gel Cleanser",
    category: "Cleansers",
    collection: "Daily Reset",
    tag: "pH-balanced cleanse",
    badge: "Best Seller",
    price: 420,
    rating: 4.9,
    reviews: 214,
    stock: 34,
    stockNote: "Ready to dispatch",
    image: heroImage,
    imageAlt: "WICKED Hydrating Gel Cleanser in a black pump bottle",
    gallery: galleryScenes,
    variants: ["Fragrance-free", "Fresh mineral"],
    sizes: ["150ml"],
    visual: { form: "pump", accent: "#8fd3c7", texture: "water" },
    description:
      "A cushiony daily gel cleanser that lifts sunscreen, oil, and city residue without leaving skin tight.",
    longDescription:
      "Hydrating Gel Cleanser is the first step in the WICKED routine: clean enough for a fresh start, gentle enough for twice-daily use, and balanced so the rest of your skincare lands better.",
    benefits: [
      "Removes daily buildup without a stripped finish",
      "Leaves skin soft, fresh, and comfortable",
      "Works as a morning cleanse or second cleanse at night",
    ],
    details: ["Amino-acid cleansing system", "Glycerin and panthenol support", "pH-balanced daily formula"],
    specs: ["Skin feel: fresh and soft", "Best for: normal, dry, combination, and oily skin", "Vegan formula", "Dermatologist-tested"],
    care: "Massage onto damp skin for 30 to 60 seconds, rinse well, then follow with toner or serum.",
    delivery: "Fast South Africa delivery with protective recyclable packaging.",
    returns: "Unopened skincare can be returned within 14 days. Contact support if anything arrives damaged.",
    filters: ["Popular"],
    releaseRank: 12,
  },
  {
    id: "vitamin-c-brightening-serum",
    slug: "vitamin-c-brightening-serum",
    name: "Vitamin C Brightening Serum",
    category: "Serums",
    collection: "Targeted Actives",
    tag: "Glow support",
    badge: "Signature",
    price: 760,
    rating: 4.9,
    reviews: 188,
    stock: 18,
    stockNote: "Fresh batch",
    image: heroImage,
    imageAlt: "WICKED Vitamin C Brightening Serum in an amber dropper bottle",
    gallery: galleryScenes,
    variants: ["Original", "Sensitive"],
    sizes: ["30ml"],
    visual: { form: "dropper", accent: "#f0b35b", texture: "citrus" },
    description:
      "A lightweight vitamin C serum designed to brighten dull-looking skin and support a more even glow.",
    longDescription:
      "This daily brightening serum gives the routine a sharp, polished finish without sticky residue. It layers cleanly under moisturiser and SPF, making it easy to use every morning.",
    benefits: [
      "Helps dull-looking skin appear brighter",
      "Layers smoothly under moisturiser and SPF",
      "Adds a fresh, refined finish without heaviness",
    ],
    details: ["Vitamin C derivative", "Ferulic-inspired antioxidant support", "Hyaluronic acid hydration"],
    specs: ["Skin feel: light serum", "Best for: uneven tone and dullness", "Use: morning", "Always finish with SPF"],
    care: "Apply two to three drops after cleansing. Use SPF every morning while using brightening actives.",
    delivery: "Ships in light-protective packaging with tracked delivery.",
    returns: "Unopened skincare can be returned within 14 days. Used actives are final sale for hygiene reasons.",
    filters: ["Popular", "Premium"],
    releaseRank: 11,
  },
  {
    id: "barrier-repair-moisturiser",
    slug: "barrier-repair-moisturiser",
    name: "Barrier Repair Moisturiser",
    category: "Moisturisers",
    collection: "Barrier Support",
    tag: "Ceramide comfort",
    badge: "Best Seller",
    price: 640,
    rating: 4.8,
    reviews: 246,
    stock: 22,
    stockNote: "Core stock",
    image: heroImage,
    imageAlt: "WICKED Barrier Repair Moisturiser in a low black cream jar",
    gallery: galleryScenes,
    variants: ["Original", "Rich"],
    sizes: ["50ml"],
    visual: { form: "jar", accent: "#d6bf8d", texture: "cream" },
    description:
      "A plush ceramide moisturiser that seals in hydration and leaves skin calm, cushioned, and ready for the day.",
    longDescription:
      "Barrier Repair Moisturiser is the comfort layer in the WICKED lineup. It supports skin that feels dry, overworked, or reactive, while keeping the finish clean enough for morning use.",
    benefits: [
      "Supports a stronger-feeling skin barrier",
      "Comforts dryness without a greasy film",
      "Pairs well with retinoids, acids, and brightening serums",
    ],
    details: ["Ceramide complex", "Squalane and glycerin", "Soft-touch cream texture"],
    specs: ["Skin feel: cushioned", "Best for: dry, normal, and combination skin", "Use: morning or night", "Fragrance-free option"],
    care: "Apply after serum. Use a generous layer at night when skin needs extra comfort.",
    delivery: "Ships with tamper-evident packaging and tracked delivery.",
    returns: "Unopened moisturisers can be returned within 14 days. Damaged items are replaced quickly.",
    filters: ["Popular", "Premium"],
    releaseRank: 10,
  },
  {
    id: "niacinamide-refining-serum",
    slug: "niacinamide-refining-serum",
    name: "Niacinamide Refining Serum",
    category: "Serums",
    collection: "Targeted Actives",
    tag: "Texture reset",
    badge: "New",
    price: 690,
    rating: 4.8,
    reviews: 137,
    stock: 20,
    stockNote: "New release",
    image: heroImage,
    imageAlt: "WICKED Niacinamide Refining Serum in a black glass bottle",
    gallery: galleryScenes,
    variants: ["Original"],
    sizes: ["30ml"],
    visual: { form: "dropper", accent: "#b9c7ff", texture: "silk" },
    description:
      "A refining serum for visible pores, uneven texture, and excess shine that still respects the skin barrier.",
    longDescription:
      "Niacinamide Refining Serum is built for skin that wants clarity without harshness. The texture is fast-absorbing, easy to layer, and designed for consistent use.",
    benefits: [
      "Helps skin look smoother and more refined",
      "Supports balanced-looking shine",
      "Comfortable under moisturiser, SPF, and makeup",
    ],
    details: ["Niacinamide-led formula", "Zinc PCA support", "Hydrating base"],
    specs: ["Skin feel: fast-absorbing gel serum", "Best for: combination and oily skin", "Use: morning or night", "Avoid layering with too many actives at once"],
    care: "Apply one to two pumps after toner. Follow with moisturiser.",
    delivery: "Fast South Africa delivery with recyclable protective wrap.",
    returns: "Unopened serums can be returned within 14 days.",
    filters: ["New", "Premium"],
    releaseRank: 9,
  },
  {
    id: "mineral-daily-spf",
    slug: "mineral-daily-spf",
    name: "Mineral Daily SPF",
    category: "Sunscreen / SPF",
    collection: "Barrier Support",
    tag: "Daily protection",
    badge: "Signature",
    price: 520,
    rating: 4.7,
    reviews: 171,
    stock: 27,
    stockNote: "Daily essential",
    image: heroImage,
    imageAlt: "WICKED Mineral Daily SPF in a matte black tube",
    gallery: galleryScenes,
    variants: ["Sheer", "Tinted"],
    sizes: ["50ml"],
    visual: { form: "tube", accent: "#f4de7d", texture: "sun" },
    description:
      "A mineral daily SPF with a soft, breathable finish for the final step of every morning routine.",
    longDescription:
      "Mineral Daily SPF keeps protection clear and practical. The finish is modern, the feel is comfortable, and the formula is made to sit cleanly over serums and moisturiser.",
    benefits: [
      "Daily broad-spectrum mineral protection",
      "Soft finish that works under makeup",
      "Designed to layer over active skincare",
    ],
    details: ["Mineral UV filters", "Hydrating emollient base", "Sheer and tinted options"],
    specs: ["Skin feel: soft cream", "Best for: daily morning use", "Reapply during prolonged sun exposure", "SPF is the last step before makeup"],
    care: "Apply generously every morning. Reapply every two hours with direct sun exposure.",
    delivery: "Ships with heat-conscious handling during warm weather.",
    returns: "Unopened SPF can be returned within 14 days.",
    filters: ["Popular"],
    releaseRank: 8,
  },
  {
    id: "overnight-recovery-mask",
    slug: "overnight-recovery-mask",
    name: "Overnight Recovery Mask",
    category: "Masks",
    collection: "Barrier Support",
    tag: "Night repair",
    badge: "Limited",
    price: 580,
    rating: 4.9,
    reviews: 122,
    stock: 12,
    stockNote: "Limited batch",
    image: heroImage,
    imageAlt: "WICKED Overnight Recovery Mask in a black treatment jar",
    gallery: galleryScenes,
    variants: ["Original"],
    sizes: ["60ml"],
    visual: { form: "jar", accent: "#8fb7a2", texture: "night" },
    description:
      "A leave-on night mask for skin that needs a calm, replenished look by morning.",
    longDescription:
      "Overnight Recovery Mask is a low-effort reset for tired-looking skin. Use it as the final evening step when your routine needs extra comfort and visible softness.",
    benefits: [
      "Locks in hydration overnight",
      "Helps tired-looking skin appear smoother by morning",
      "Comforts skin after active-heavy routines",
    ],
    details: ["Beta-glucan support", "Ceramide-rich feel", "Cushion gel-cream texture"],
    specs: ["Skin feel: cocooning gel cream", "Best for: dry, stressed, or dull-looking skin", "Use: two to four nights weekly", "Leave-on formula"],
    care: "Apply a thin layer as the final evening step. Rinse in the morning if desired.",
    delivery: "Ships with protective packaging and tracking.",
    returns: "Unopened masks can be returned within 14 days.",
    filters: ["Premium"],
    releaseRank: 7,
  },
  {
    id: "peptide-eye-cream",
    slug: "peptide-eye-cream",
    name: "Peptide Eye Cream",
    category: "Eye Care",
    collection: "Barrier Support",
    tag: "Smooth focus",
    badge: "New",
    price: 720,
    rating: 4.8,
    reviews: 94,
    stock: 15,
    stockNote: "Fresh arrival",
    image: heroImage,
    imageAlt: "WICKED Peptide Eye Cream in a compact black airless pump",
    gallery: galleryScenes,
    variants: ["Original"],
    sizes: ["15ml"],
    visual: { form: "pump", accent: "#c4b7ff", texture: "peptide" },
    description:
      "A focused eye cream for a smoother, more awake look without heavy slip or sparkle.",
    longDescription:
      "Peptide Eye Cream keeps the eye step efficient: a small airless pump, a clean texture, and support for dryness and fine-looking lines around the eye area.",
    benefits: [
      "Hydrates the delicate eye area",
      "Helps the eye area look smoother and less tired",
      "Airless pump keeps the formula clean and controlled",
    ],
    details: ["Peptide complex", "Caffeine support", "Light-refining hydration"],
    specs: ["Skin feel: lightweight cream", "Best for: tired-looking eye area", "Use: morning or night", "Ophthalmologist-tested"],
    care: "Tap a rice-grain amount around the orbital bone. Avoid direct contact with eyes.",
    delivery: "Ships in protective packaging sized for small-format skincare.",
    returns: "Unopened eye care can be returned within 14 days.",
    filters: ["New", "Premium"],
    releaseRank: 6,
  },
  {
    id: "gentle-exfoliating-toner",
    slug: "gentle-exfoliating-toner",
    name: "Gentle Exfoliating Toner",
    category: "Toners",
    collection: "Daily Reset",
    tag: "Smooth tone",
    badge: "Signature",
    price: 480,
    rating: 4.7,
    reviews: 152,
    stock: 24,
    stockNote: "Weekly staple",
    image: heroImage,
    imageAlt: "WICKED Gentle Exfoliating Toner in a tall black bottle",
    gallery: galleryScenes,
    variants: ["Original", "Sensitive"],
    sizes: ["120ml"],
    visual: { form: "pump", accent: "#f7a98b", texture: "acid" },
    description:
      "A gentle resurfacing toner that keeps texture polished without making the routine feel aggressive.",
    longDescription:
      "Gentle Exfoliating Toner is built for controlled clarity. It gives skin a smoother look over time while leaving room for hydration and barrier support.",
    benefits: [
      "Helps refine uneven-looking texture",
      "Preps skin for serum without harsh scrubbing",
      "Designed for two to four uses per week",
    ],
    details: ["PHA and lactic acid blend", "Aloe and glycerin base", "No physical scrub particles"],
    specs: ["Skin feel: fresh liquid", "Best for: dullness and texture", "Use: evening", "Do not use on broken or irritated skin"],
    care: "Apply after cleansing at night. Start slowly, then follow with moisturiser.",
    delivery: "Ships with leak-conscious closure and tracking.",
    returns: "Unopened toners can be returned within 14 days.",
    filters: ["Popular"],
    releaseRank: 5,
  },
  {
    id: "clarifying-clay-mask",
    slug: "clarifying-clay-mask",
    name: "Clarifying Clay Mask",
    category: "Masks",
    collection: "Daily Reset",
    tag: "Oil control",
    badge: "Best Seller",
    price: 560,
    rating: 4.8,
    reviews: 163,
    stock: 19,
    stockNote: "In stock",
    image: heroImage,
    imageAlt: "WICKED Clarifying Clay Mask in a black cream jar",
    gallery: galleryScenes,
    variants: ["Original"],
    sizes: ["75ml"],
    visual: { form: "jar", accent: "#b7c0a6", texture: "clay" },
    description:
      "A creamy clay mask that helps absorb excess oil while keeping skin comfortable and balanced.",
    longDescription:
      "Clarifying Clay Mask is a reset for congested-looking skin. It uses a creamy base so the mask feels polished, not chalky or punishing.",
    benefits: [
      "Helps skin look clearer and less shiny",
      "Creamy texture avoids a tight, cracked finish",
      "Ideal for T-zone use or a full-face weekly reset",
    ],
    details: ["Kaolin and bentonite clay", "Zinc support", "Comfort-focused cream base"],
    specs: ["Skin feel: creamy clay", "Best for: oily and combination skin", "Use: one to three times weekly", "Rinse-off formula"],
    care: "Apply a thin layer for 8 to 10 minutes, then rinse before the mask fully dries.",
    delivery: "Ships in reinforced packaging to protect jars in transit.",
    returns: "Unopened masks can be returned within 14 days.",
    filters: ["Popular"],
    releaseRank: 4,
  },
  {
    id: "glow-renewal-skincare-set",
    slug: "glow-renewal-skincare-set",
    name: "Glow Renewal Skincare Set",
    category: "Sets / Bundles",
    collection: "Glow Sets",
    tag: "Complete routine",
    badge: "Sale",
    price: 1490,
    compareAt: 1690,
    rating: 4.9,
    reviews: 201,
    stock: 10,
    stockNote: "Bundle saving",
    image: heroImage,
    imageAlt: "WICKED Glow Renewal Skincare Set with cleanser, serum, and moisturiser",
    gallery: galleryScenes,
    variants: ["Morning glow", "Night repair"],
    sizes: ["3-piece set"],
    visual: { form: "set", accent: "#d6bf8d", texture: "set" },
    description:
      "A three-step WICKED routine with cleanser, brightening serum, and barrier moisturiser.",
    longDescription:
      "Glow Renewal Skincare Set takes the guesswork out of starting WICKED. Cleanse, treat, and seal with three formulas that work together and look sharp on the shelf.",
    benefits: [
      "Simple three-step routine",
      "Includes bestselling daily essentials",
      "Premium gift-ready presentation",
    ],
    details: ["Hydrating Gel Cleanser", "Vitamin C Brightening Serum", "Barrier Repair Moisturiser"],
    specs: ["Routine: cleanse, treat, moisturise", "Best for: dullness and dehydration", "Value set", "Gift-ready black carton"],
    care: "Use the cleanser morning and night, vitamin C in the morning, and moisturiser as the final comfort step.",
    delivery: "Free delivery applies automatically to this set.",
    returns: "Sets may be returned unopened within 14 days. Partial set returns are not accepted.",
    filters: ["Premium", "Sale", "Popular"],
    releaseRank: 3,
  },
  {
    id: "hyaluronic-acid-serum",
    slug: "hyaluronic-acid-serum",
    name: "Hyaluronic Acid Serum",
    category: "Serums",
    collection: "Targeted Actives",
    tag: "Hydration layer",
    badge: "Limited",
    price: 620,
    rating: 4.7,
    reviews: 118,
    stock: 13,
    stockNote: "Limited batch",
    image: heroImage,
    imageAlt: "WICKED Hyaluronic Acid Serum in a black dropper bottle",
    gallery: galleryScenes,
    variants: ["Original"],
    sizes: ["30ml"],
    visual: { form: "dropper", accent: "#85c7ff", texture: "hydration" },
    description:
      "A hydration serum that gives skin a plump, fresh look and makes the rest of the routine feel smoother.",
    longDescription:
      "Hyaluronic Acid Serum is the quiet workhorse in the WICKED lineup. It layers under any moisturiser, adds slip without stickiness, and helps skin look freshly hydrated.",
    benefits: [
      "Boosts visible hydration",
      "Softens the look of dehydration lines",
      "Pairs easily with vitamin C, niacinamide, and moisturiser",
    ],
    details: ["Multi-weight hyaluronic acid", "Glycerin hydration", "Panthenol comfort"],
    specs: ["Skin feel: dewy serum", "Best for: all skin types", "Use: morning or night", "Apply to slightly damp skin"],
    care: "Apply to slightly damp skin, then seal with moisturiser.",
    delivery: "Fast South Africa delivery with tracking.",
    returns: "Unopened serums can be returned within 14 days.",
    filters: ["Premium"],
    releaseRank: 2,
  },
  {
    id: "daily-reset-toner",
    slug: "daily-reset-toner",
    name: "Daily Reset Toner",
    category: "Toners",
    collection: "Daily Reset",
    tag: "Balance step",
    badge: "New",
    price: 450,
    rating: 4.6,
    reviews: 86,
    stock: 28,
    stockNote: "New daily step",
    image: heroImage,
    imageAlt: "WICKED Daily Reset Toner in a black balancing bottle",
    gallery: galleryScenes,
    variants: ["Original"],
    sizes: ["120ml"],
    visual: { form: "pump", accent: "#a8dcc8", texture: "balance" },
    description:
      "A no-sting daily toner that refreshes skin after cleansing and prepares it for serum.",
    longDescription:
      "Daily Reset Toner keeps the routine calm and clean. It is the simple bridge between cleansing and treatment, built for skin that wants hydration without extra noise.",
    benefits: [
      "Refreshes skin after cleansing",
      "Preps skin for better serum glide",
      "Comfortable enough for daily use",
    ],
    details: ["Centella-inspired calm", "Betaine hydration", "Alcohol-free feel"],
    specs: ["Skin feel: fresh liquid", "Best for: all skin types", "Use: morning or night", "No added fragrance"],
    care: "Press into clean skin with hands or apply with a reusable cotton pad.",
    delivery: "Ships with secure closure and tracking.",
    returns: "Unopened toners can be returned within 14 days.",
    filters: ["New"],
    releaseRank: 1,
  },
];

export const categories = [
  "All",
  ...Array.from(new Set(products.map((product) => product.category))),
];

export const shopFilters = ["All", "New", "Popular", "Premium", "Sale"] as const;

export const reviews = [
  {
    name: "Mila Jacobs",
    role: "Sensitive-skin customer",
    quote:
      "WICKED feels elevated but practical. The cleanser and moisturiser made my routine simpler within a week.",
    initials: "MJ",
  },
  {
    name: "Thando Meyer",
    role: "Beauty editor",
    quote:
      "The brand knows exactly what it is: sharp black packaging, clear formulas, and product copy that does not overpromise.",
    initials: "TM",
  },
  {
    name: "Nadia Petersen",
    role: "Makeup artist",
    quote:
      "The SPF and serums sit beautifully under makeup. Everything feels considered without being precious.",
    initials: "NP",
  },
  {
    name: "Lara Singh",
    role: "Repeat customer",
    quote:
      "Fast delivery, secure packaging, and the checkout totals were easy to trust. The bundle was gift-ready.",
    initials: "LS",
  },
];

export const formatPrice = (value: number) =>
  new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(value);

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getRelatedProducts(product: Product, limit = 4) {
  return products
    .filter(
      (item) =>
        item.id !== product.id &&
        (item.category === product.category ||
          item.collection === product.collection ||
          item.filters.some((filter) => product.filters.includes(filter))),
    )
    .slice(0, limit);
}
