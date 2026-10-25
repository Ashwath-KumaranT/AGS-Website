import { garmentUrl } from '@/lib/garment';
import type {
  Category,
  Coupon,
  GarmentType,
  Gender,
  ProductVariant,
  ProductWithVariants,
  Review,
} from '@/types';

/* ---------------- categories ---------------- */

const cat = (
  id: string,
  name: string,
  parent: string | null,
  type: GarmentType,
  hex: string,
  view = 0,
  description = '',
): Category => ({
  id,
  name,
  slug: id,
  parent_id: parent,
  image_url: garmentUrl(type, hex, view),
  description,
});

export const CATEGORIES: Category[] = [
  cat('men', 'Men', null, 'jacket', '3d4a3a', 0, 'Tailored basics and weekend staples.'),
  cat('women', 'Women', null, 'dress', 'b5714f', 0, 'Fluid silhouettes in natural fibres.'),
  cat('kids', 'Kids', null, 'hoodie', 'd9a441', 0, 'Soft, durable and made to play in.'),
  cat('men-tshirts', 'T-shirts', 'men', 'tee', 'e9e4da'),
  cat('men-shirts', 'Shirts', 'men', 'shirt', '9db2c4'),
  cat('men-knitwear', 'Knitwear', 'men', 'sweater', '6b5b4b'),
  cat('men-jackets', 'Jackets', 'men', 'jacket', '3d4a3a'),
  cat('men-trousers', 'Trousers & Jeans', 'men', 'jeans', '3a5069'),
  cat('women-dresses', 'Dresses', 'women', 'dress', 'b5714f'),
  cat('women-tops', 'Tops & Tees', 'women', 'tee', 'f0e6d8'),
  cat('women-knitwear', 'Knitwear', 'women', 'sweater', 'c9a99a'),
  cat('women-bottoms', 'Skirts & Trousers', 'women', 'skirt', '2f3b4a'),
  cat('women-outerwear', 'Outerwear', 'women', 'jacket', 'c8b6a0'),
  cat('kids-tops', 'Tops & Hoodies', 'kids', 'hoodie', 'd9a441'),
  cat('kids-bottoms', 'Bottoms', 'kids', 'shorts', '5b7a99'),
  cat('kids-dresses', 'Dresses', 'kids', 'dress', 'e3a6a1'),
];

export const GENDER_SLUGS = ['men', 'women', 'kids'] as const;

/* ---------------- products ---------------- */

const ADULT_SIZES = ['XS', 'S', 'M', 'L', 'XL'];
const WAIST_SIZES = ['28', '30', '32', '34', '36'];
const KIDS_SIZES = ['4Y', '6Y', '8Y', '10Y', '12Y'];

type ColorSpec = [name: string, hex: string];

interface ProductSpec {
  slug: string;
  title: string;
  brand: string;
  category: string;
  gender: Gender;
  type: GarmentType;
  price: number; // rupees (retail price ending in 99)
  compare?: number; // rupees, original price for sale items
  colors: ColorSpec[];
  sizes: 'adult' | 'waist' | 'kids';
  material: string;
  description: string;
  rating: number;
  reviews: number;
  isNew?: boolean;
  best?: boolean;
  /** sizes that are fully sold out across colors */
  soldOutSizes?: string[];
  /** every variant sold out */
  soldOut?: boolean;
}

const CARE_COTTON = ['Machine wash cold, inside out', 'Tumble dry low', 'Warm iron if needed'];
const CARE_WOOL = [
  'Hand wash cool or dry clean',
  'Dry flat, reshape while damp',
  'Do not tumble dry',
];
const CARE_LINEN = ['Machine wash cold, gentle cycle', 'Line dry', 'Iron while slightly damp'];
const CARE_DENIM = ['Wash cold, inside out, infrequently', 'Line dry', 'Do not bleach'];
const CARE_OUTER = ['Spot clean or dry clean', 'Do not tumble dry', 'Cool iron on reverse side'];

const C = {
  ivory: ['Ivory', 'f1ece1'],
  black: ['Black', '1f1f1f'],
  navy: ['Navy', '24344d'],
  sage: ['Sage', '9aa88a'],
  sand: ['Sand', 'c8b6a0'],
  rust: ['Rust', 'a4553a'],
  olive: ['Olive', '5f6648'],
  charcoal: ['Charcoal', '3b3d40'],
  sky: ['Sky', '9db8cf'],
  stone: ['Stone', 'b9b3a6'],
  blush: ['Blush', 'e3b8ae'],
  camel: ['Camel', 'b88a5a'],
  indigo: ['Indigo', '34486b'],
  washed: ['Washed Blue', '6f8cab'],
  mustard: ['Mustard', 'd0a23a'],
  forest: ['Forest', '2f4a3d'],
  cream: ['Cream', 'efe6d3'],
  berry: ['Berry', '7d3b4f'],
} satisfies Record<string, ColorSpec>;

const SPECS: ProductSpec[] = [
  // ---- men ----
  {
    slug: 'heavyweight-crew-tee',
    title: 'Heavyweight Crew Tee',
    brand: 'ASG',
    category: 'men-tshirts',
    gender: 'men',
    type: 'tee',
    price: 1299,
    colors: [C.ivory, C.black, C.sage, C.rust],
    sizes: 'adult',
    material: '100% organic cotton, 220gsm',
    description:
      'A dense, drapey tee cut slightly boxy with a ribbed collar that holds its shape wash after wash. Garment-dyed for a lived-in softness from day one.',
    rating: 4.7,
    reviews: 214,
    best: true,
  },
  {
    slug: 'pocket-tee',
    title: 'Everyday Pocket Tee',
    brand: 'ASG',
    category: 'men-tshirts',
    gender: 'men',
    type: 'tee',
    price: 1099,
    compare: 1499,
    colors: [C.sand, C.navy, C.charcoal],
    sizes: 'adult',
    material: '100% combed cotton jersey',
    description:
      'The easy, no-fuss pocket tee. Mid-weight jersey, relaxed through the body, finished with a single chest pocket.',
    rating: 4.4,
    reviews: 96,
  },
  {
    slug: 'oxford-button-down',
    title: 'Oxford Button-Down Shirt',
    brand: 'ASG',
    category: 'men-shirts',
    gender: 'men',
    type: 'shirt',
    price: 2699,
    colors: [C.sky, C.ivory, C.navy],
    sizes: 'adult',
    material: '100% cotton oxford',
    description:
      'A washed oxford with a soft roll collar and a natural, slightly textured hand. Wears well tucked or open over a tee.',
    rating: 4.6,
    reviews: 148,
    best: true,
  },
  {
    slug: 'linen-camp-shirt',
    title: 'Linen Camp-Collar Shirt',
    brand: 'Maison Lin',
    category: 'men-shirts',
    gender: 'men',
    type: 'shirt',
    price: 3199,
    compare: 4199,
    colors: [C.sand, C.sage, C.ivory],
    sizes: 'adult',
    material: '100% European flax linen',
    description:
      'Breezy short-line camp shirt in washed linen. Relaxed shoulders, shell buttons and a gentle drape made for warm days.',
    rating: 4.5,
    reviews: 77,
    isNew: true,
  },
  {
    slug: 'merino-crew-sweater',
    title: 'Merino Crewneck Sweater',
    brand: 'Nordhavn',
    category: 'men-knitwear',
    gender: 'men',
    type: 'sweater',
    price: 4099,
    colors: [C.charcoal, C.camel, C.forest],
    sizes: 'adult',
    material: '100% extra-fine merino wool',
    description:
      'Fine-gauge merino that layers under a jacket yet is warm enough on its own. Naturally temperature regulating and itch-free.',
    rating: 4.8,
    reviews: 189,
    best: true,
    isNew: true,
  },
  {
    slug: 'chunky-cable-knit',
    title: 'Chunky Cable-Knit Sweater',
    brand: 'Nordhavn',
    category: 'men-knitwear',
    gender: 'men',
    type: 'sweater',
    price: 4799,
    compare: 6499,
    colors: [C.cream, C.navy],
    sizes: 'adult',
    material: '70% wool, 30% recycled nylon',
    description:
      'A heritage cable pattern knitted in a generous, cosy gauge. Roomy fit with ribbed trims.',
    rating: 4.3,
    reviews: 52,
    soldOutSizes: ['XL'],
  },
  {
    slug: 'quilted-field-jacket',
    title: 'Quilted Field Jacket',
    brand: 'ASG',
    category: 'men-jackets',
    gender: 'men',
    type: 'jacket',
    price: 6899,
    colors: [C.olive, C.black],
    sizes: 'adult',
    material: 'Recycled nylon shell, recycled polyester fill',
    description:
      'Lightly quilted, water-repellent and packed with four utility pockets. The jacket you reach for from October to March.',
    rating: 4.6,
    reviews: 131,
  },
  {
    slug: 'waxed-cotton-jacket',
    title: 'Waxed Cotton Jacket',
    brand: 'Maison Lin',
    category: 'men-jackets',
    gender: 'men',
    type: 'jacket',
    price: 8599,
    compare: 10799,
    colors: [C.forest, C.sand],
    sizes: 'adult',
    material: 'Waxed 100% cotton canvas',
    description:
      'Weather-ready waxed canvas that ages beautifully. Corduroy collar, storm flap and a full cotton lining.',
    rating: 4.7,
    reviews: 64,
    soldOut: true,
  },
  {
    slug: 'straight-fit-jeans',
    title: 'Straight-Fit Selvedge Jeans',
    brand: 'ASG',
    category: 'men-trousers',
    gender: 'men',
    type: 'jeans',
    price: 4499,
    colors: [C.indigo, C.washed, C.black],
    sizes: 'waist',
    material: '13oz Japanese selvedge denim',
    description:
      'A classic straight leg in rigid selvedge that softens and fades to you. Mid rise, five-pocket, cut to sit just above the ankle.',
    rating: 4.8,
    reviews: 301,
    best: true,
  },
  {
    slug: 'pleated-chino',
    title: 'Pleated Cotton Chino',
    brand: 'Maison Lin',
    category: 'men-trousers',
    gender: 'men',
    type: 'trousers',
    price: 3399,
    colors: [C.stone, C.navy, C.olive],
    sizes: 'waist',
    material: '98% cotton twill, 2% elastane',
    description:
      'A relaxed single-pleat chino with a tapered leg and a touch of stretch for easy movement.',
    rating: 4.4,
    reviews: 88,
    isNew: true,
  },
  {
    slug: 'hybrid-travel-shorts',
    title: 'Hybrid Travel Shorts',
    brand: 'Nordhavn',
    category: 'men-trousers',
    gender: 'men',
    type: 'shorts',
    price: 1999,
    compare: 2499,
    colors: [C.charcoal, C.sage],
    sizes: 'waist',
    material: 'Quick-dry stretch nylon',
    description:
      'Land-to-water shorts that dry in minutes. Drawcord waist, zip pocket and a 7" inseam.',
    rating: 4.2,
    reviews: 43,
  },
  // ---- women ----
  {
    slug: 'wrap-midi-dress',
    title: 'Wrap Midi Dress',
    brand: 'ASG',
    category: 'women-dresses',
    gender: 'women',
    type: 'dress',
    price: 5199,
    colors: [C.rust, C.forest, C.black],
    sizes: 'adult',
    material: '100% viscose crepe',
    description:
      'A fluid wrap silhouette with a defined waist and a swishy midi hem. Easily goes from desk to dinner.',
    rating: 4.7,
    reviews: 176,
    best: true,
  },
  {
    slug: 'linen-slip-dress',
    title: 'Linen Slip Dress',
    brand: 'Maison Lin',
    category: 'women-dresses',
    gender: 'women',
    type: 'dress',
    price: 4499,
    compare: 5799,
    colors: [C.sand, C.blush, C.sage],
    sizes: 'adult',
    material: '100% washed linen',
    description:
      'Minimal, cool and just a little undone. Adjustable straps and a bias-cut skirt that moves.',
    rating: 4.5,
    reviews: 102,
    isNew: true,
  },
  {
    slug: 'knit-column-dress',
    title: 'Ribbed Knit Column Dress',
    brand: 'Nordhavn',
    category: 'women-dresses',
    gender: 'women',
    type: 'dress',
    price: 4799,
    colors: [C.charcoal, C.camel],
    sizes: 'adult',
    material: '55% cotton, 45% viscose',
    description: 'A close but comfortable rib that skims the body, finishing just below the knee.',
    rating: 4.3,
    reviews: 58,
  },
  {
    slug: 'boxy-cotton-tee',
    title: 'Boxy Cotton Tee',
    brand: 'ASG',
    category: 'women-tops',
    gender: 'women',
    type: 'tee',
    price: 1299,
    colors: [C.ivory, C.black, C.blush, C.sky],
    sizes: 'adult',
    material: '100% organic cotton',
    description:
      'A cropped-at-the-hip, boxy tee with a clean neckline. The one you will wear on repeat.',
    rating: 4.6,
    reviews: 252,
    best: true,
  },
  {
    slug: 'poplin-shirt',
    title: 'Relaxed Poplin Shirt',
    brand: 'Maison Lin',
    category: 'women-tops',
    gender: 'women',
    type: 'shirt',
    price: 2899,
    colors: [C.ivory, C.sky],
    sizes: 'adult',
    material: '100% cotton poplin',
    description:
      'Crisp, oversized and endlessly versatile. Drop shoulders and a curved hem for tucking or wearing loose.',
    rating: 4.5,
    reviews: 119,
  },
  {
    slug: 'cashmere-blend-sweater',
    title: 'Cashmere-Blend Sweater',
    brand: 'Nordhavn',
    category: 'women-knitwear',
    gender: 'women',
    type: 'sweater',
    price: 5899,
    compare: 7699,
    colors: [C.blush, C.cream, C.charcoal],
    sizes: 'adult',
    material: '30% cashmere, 70% merino',
    description:
      'Featherlight and luxuriously soft. A slightly cropped fit with a wide funnel neck.',
    rating: 4.8,
    reviews: 143,
  },
  {
    slug: 'oversized-cardigan',
    title: 'Oversized Wool Cardigan',
    brand: 'Nordhavn',
    category: 'women-knitwear',
    gender: 'women',
    type: 'sweater',
    price: 5199,
    colors: [C.camel, C.berry],
    sizes: 'adult',
    material: '80% wool, 20% nylon',
    description: 'A slouchy cardigan with deep pockets and horn-effect buttons.',
    rating: 4.4,
    reviews: 67,
    isNew: true,
    soldOutSizes: ['XS', 'S'],
  },
  {
    slug: 'pleated-midi-skirt',
    title: 'Pleated Midi Skirt',
    brand: 'ASG',
    category: 'women-bottoms',
    gender: 'women',
    type: 'skirt',
    price: 3099,
    colors: [C.navy, C.sage, C.black],
    sizes: 'adult',
    material: 'Recycled polyester satin',
    description:
      'Knife pleats that fall beautifully and travel without creasing. Elasticated back waist.',
    rating: 4.3,
    reviews: 71,
  },
  {
    slug: 'wide-leg-trousers',
    title: 'Wide-Leg Tailored Trousers',
    brand: 'Maison Lin',
    category: 'women-bottoms',
    gender: 'women',
    type: 'trousers',
    price: 3899,
    compare: 4899,
    colors: [C.black, C.stone, C.navy],
    sizes: 'adult',
    material: '64% recycled polyester, 34% viscose, 2% elastane',
    description: 'High-rise, fluid and full-length. Hidden zip, front pleats and slanted pockets.',
    rating: 4.6,
    reviews: 163,
    best: true,
  },
  {
    slug: 'high-rise-straight-jeans',
    title: 'High-Rise Straight Jeans',
    brand: 'ASG',
    category: 'women-bottoms',
    gender: 'women',
    type: 'jeans',
    price: 4099,
    colors: [C.washed, C.indigo],
    sizes: 'waist',
    material: '100% organic cotton denim',
    description: 'Rigid-feel denim in a flattering high-rise with a straight, ankle-skimming leg.',
    rating: 4.6,
    reviews: 204,
  },
  {
    slug: 'belted-trench-coat',
    title: 'Belted Trench Coat',
    brand: 'Maison Lin',
    category: 'women-outerwear',
    gender: 'women',
    type: 'jacket',
    price: 9399,
    colors: [C.sand, C.black],
    sizes: 'adult',
    material: 'Cotton-blend gabardine',
    description:
      'The modern trench: relaxed through the shoulder, double-breasted, finished with a storm flap and removable belt.',
    rating: 4.7,
    reviews: 91,
    isNew: true,
  },
  {
    slug: 'puffer-vest',
    title: 'Cropped Puffer Vest',
    brand: 'Nordhavn',
    category: 'women-outerwear',
    gender: 'women',
    type: 'jacket',
    price: 3799,
    compare: 5199,
    colors: [C.cream, C.forest, C.black],
    sizes: 'adult',
    material: 'Recycled nylon, recycled fill',
    description: 'Lightweight warmth with zero bulk. A cropped hem that layers over everything.',
    rating: 4.2,
    reviews: 49,
  },
  // ---- kids ----
  {
    slug: 'kids-organic-hoodie',
    title: 'Kids Organic Cotton Hoodie',
    brand: 'ASG Kids',
    category: 'kids-tops',
    gender: 'kids',
    type: 'hoodie',
    price: 1899,
    colors: [C.mustard, C.sky, C.sage],
    sizes: 'kids',
    material: '100% organic cotton fleece',
    description:
      'Brushed-back fleece, a roomy kangaroo pocket and reinforced seams for rough-and-tumble days.',
    rating: 4.8,
    reviews: 138,
    best: true,
  },
  {
    slug: 'kids-graphic-tee',
    title: 'Kids Everyday Tee',
    brand: 'ASG Kids',
    category: 'kids-tops',
    gender: 'kids',
    type: 'tee',
    price: 799,
    compare: 999,
    colors: [C.ivory, C.rust, C.navy],
    sizes: 'kids',
    material: '100% organic cotton jersey',
    description: 'Soft, stretchy and tagless. Colour-fast so it survives the school year.',
    rating: 4.5,
    reviews: 85,
  },
  {
    slug: 'kids-pull-on-shorts',
    title: 'Kids Pull-On Shorts',
    brand: 'ASG Kids',
    category: 'kids-bottoms',
    gender: 'kids',
    type: 'shorts',
    price: 999,
    colors: [C.sky, C.sand, C.olive],
    sizes: 'kids',
    material: '100% cotton twill',
    description: 'Elastic waist, deep pockets and a durable twill built for climbing.',
    rating: 4.4,
    reviews: 61,
    isNew: true,
  },
  {
    slug: 'kids-stretch-jeans',
    title: 'Kids Stretch Jeans',
    brand: 'ASG Kids',
    category: 'kids-bottoms',
    gender: 'kids',
    type: 'jeans',
    price: 1599,
    colors: [C.washed, C.indigo],
    sizes: 'kids',
    material: '98% cotton, 2% elastane',
    description: 'Adjustable inner waistband and extra-flexible denim for growing kids.',
    rating: 4.6,
    reviews: 74,
  },
  {
    slug: 'kids-twirl-dress',
    title: 'Kids Twirl Dress',
    brand: 'ASG Kids',
    category: 'kids-dresses',
    gender: 'kids',
    type: 'dress',
    price: 1699,
    compare: 2199,
    colors: [C.blush, C.mustard, C.sky],
    sizes: 'kids',
    material: '100% organic cotton poplin',
    description: 'A swingy cotton dress with pockets, naturally. Soft enough for all-day wear.',
    rating: 4.7,
    reviews: 109,
  },
];

/** small deterministic PRNG so inventory is stable between loads */
function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function buildProduct(spec: ProductSpec, index: number): ProductWithVariants {
  const id = `p_${spec.slug}`;
  const sizes =
    spec.sizes === 'adult' ? ADULT_SIZES : spec.sizes === 'waist' ? WAIST_SIZES : KIDS_SIZES;
  const careMap: Partial<Record<GarmentType, string[]>> = {
    sweater: CARE_WOOL,
    jacket: CARE_OUTER,
    jeans: CARE_DENIM,
    shirt: spec.material.toLowerCase().includes('linen') ? CARE_LINEN : CARE_COTTON,
    dress: spec.material.toLowerCase().includes('linen') ? CARE_LINEN : CARE_COTTON,
  };
  const price = spec.price * 100;
  const variants: ProductVariant[] = [];
  spec.colors.forEach(([color, hex], ci) => {
    const images = [0, 1, 2, 3].map((v) => garmentUrl(spec.type, hex, v));
    sizes.forEach((size) => {
      const seed = hash(`${spec.slug}-${color}-${size}`);
      let stock = spec.soldOut ? 0 : 2 + (seed % 14);
      if (!spec.soldOut && seed % 11 === 0) stock = 0;
      if (!spec.soldOut && seed % 7 === 0) stock = 1 + (seed % 3); // low stock
      if (spec.soldOutSizes?.includes(size)) stock = 0;
      variants.push({
        id: `v_${spec.slug}_${ci}_${size.toLowerCase()}`,
        product_id: id,
        color,
        color_hex: `#${hex}`,
        size,
        sku: `${spec.slug.slice(0, 3).toUpperCase()}-${hex.slice(0, 3).toUpperCase()}-${size}`,
        price,
        inventory_count: stock,
        image_urls: images,
      });
    });
  });
  const created = new Date();
  created.setDate(created.getDate() - (spec.isNew ? 3 + (index % 12) : 40 + index * 6));
  return {
    id,
    slug: spec.slug,
    title: spec.title,
    description: spec.description,
    brand: spec.brand,
    category_id: spec.category,
    gender: spec.gender,
    price,
    compare_at_price: spec.compare ? spec.compare * 100 : null,
    material: spec.material,
    care: careMap[spec.type] ?? CARE_COTTON,
    details: [
      spec.sizes === 'kids' ? 'Sized for ages 4–12' : 'True to size — see our size guide',
      'Responsibly sourced materials',
      'Designed in-house, ethically made',
    ],
    status: 'active',
    rating: spec.rating,
    review_count: spec.reviews,
    is_new: Boolean(spec.isNew),
    is_best_seller: Boolean(spec.best),
    created_at: created.toISOString(),
    variants,
  };
}

export const PRODUCTS: ProductWithVariants[] = SPECS.map(buildProduct);

/* ---------------- reviews ---------------- */

const REVIEW_SNIPPETS: [number, string, string][] = [
  [
    5,
    'Exactly what I wanted',
    'The quality is excellent and the fit is spot on. Washes beautifully and has not lost its shape.',
  ],
  [
    5,
    'Worth every penny',
    'Fabric feels premium and the colour is even better in person. Already ordered a second one.',
  ],
  [
    4,
    'Great, runs slightly large',
    'Love the cut and the weight of the fabric. I would size down if you are between sizes.',
  ],
  [
    4,
    'Lovely and well made',
    'Stitching is neat and it feels substantial. Delivery was quick too.',
  ],
  [
    3,
    'Good but not perfect',
    'Nice material, though the length was a bit shorter than I expected. Still a good buy.',
  ],
  [5, 'My new favourite', 'Comfortable from the first wear. Have had many compliments already.'],
];

const REVIEWERS = [
  'Priya S.',
  'Daniel M.',
  'Amelia R.',
  'Kenji T.',
  'Sofia L.',
  'Arjun K.',
  'Hannah B.',
  'Omar F.',
];

export function seedReviews(): Review[] {
  const out: Review[] = [];
  PRODUCTS.forEach((p, pi) => {
    const count = 3 + (pi % 3);
    for (let i = 0; i < count; i += 1) {
      const snip = REVIEW_SNIPPETS[(pi + i) % REVIEW_SNIPPETS.length] as [number, string, string];
      const d = new Date();
      d.setDate(d.getDate() - (5 + pi * 3 + i * 17));
      out.push({
        id: `r_${p.id}_${i}`,
        product_id: p.id,
        user_id: `seed_${i}`,
        author_name: REVIEWERS[(pi + i * 3) % REVIEWERS.length] as string,
        rating: snip[0],
        title: snip[1],
        body: snip[2],
        verified_purchase: i % 2 === 0,
        created_at: d.toISOString(),
      });
    }
  });
  return out;
}

/* ---------------- coupons ---------------- */

const inDays = (n: number) => new Date(Date.now() + n * 86_400_000).toISOString();

export const COUPONS: Coupon[] = [
  {
    code: 'WELCOME10',
    type: 'percent',
    value: 10,
    min_subtotal: 0,
    expires_at: inDays(365),
    description: '10% off your order',
    usage_limit: null,
    times_used: 0,
    is_public: true,
  },
  {
    code: 'SAVE500',
    type: 'fixed',
    value: 50000,
    min_subtotal: 399900,
    expires_at: inDays(180),
    description: '₹500 off orders over ₹3,999',
    usage_limit: null,
    times_used: 0,
    is_public: true,
  },
  {
    code: 'FREESHIP',
    type: 'free_shipping',
    value: 0,
    min_subtotal: 99900,
    expires_at: inDays(90),
    description: 'Free shipping on orders over ₹999',
    usage_limit: null,
    times_used: 0,
    is_public: true,
  },
  {
    code: 'EARLYBIRD25',
    type: 'percent',
    value: 25,
    min_subtotal: 499900,
    expires_at: inDays(-10),
    description: '25% off orders over ₹4,999',
    usage_limit: null,
    times_used: 0,
    is_public: false,
  },
  {
    code: 'USEDUP',
    type: 'percent',
    value: 15,
    min_subtotal: 0,
    expires_at: inDays(30),
    description: 'Fully redeemed',
    usage_limit: 5,
    times_used: 5,
    is_public: false,
  },
];
