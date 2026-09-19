import { Product, Category, Brand, User, Order } from '../types.ts';

export const STORE_CONFIG = {
  storeName: 'Daily Thread',
  tagline: 'Everyday clothing for everyday movement.',
  heroTitle: 'Find Your Everyday Style',
  heroSubtitle: 'Fashion essentials for your everyday movement.',
  whatsappNumber: import.meta.env.VITE_WHATSAPP_NUMBER || '6281234567890',
  currency: 'IDR',
  freeShippingThreshold: 500000,
  shippingMethods: [
    { id: 'pickup', name: 'Ambil Sendiri di Toko (Store Pick-up)', cost: 0, estimate: 'Langsung ambil di store' },
    { id: 'jne_reg', name: 'JNE Reguler', cost: 18000, estimate: '2 - 3 Hari Kerja' },
    { id: 'sicepat_best', name: 'SiCepat BEST (Next Day)', cost: 24000, estimate: '1 - 2 Hari Kerja' },
    { id: 'jnt_ez', name: 'J&T Express EZ', cost: 19000, estimate: '2 - 3 Hari Kerja' },
    { id: 'gosend_instant', name: 'GoSend / GrabExpress Instant', cost: 35000, estimate: '3 - 5 Jam (Jabodetabek)' }
  ]
};

export const CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Cargo Pants', slug: 'cargo-pants', description: 'Functional multi-pocket utility pants engineered for durability and daily movement.', image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=800&auto=format&fit=crop' },
  { id: 'cat-2', name: 'Denim Pants', slug: 'denim-pants', description: 'Classic straight, wide, and relaxed fit denim crafted from durable cotton twill.', image: 'https://images.unsplash.com/photo-1542272604-780c96856592?q=80&w=800&auto=format&fit=crop' },
  { id: 'cat-3', name: 'Salvage Denim', slug: 'salvage-denim', description: 'Authentic red-line selvedge denim woven on vintage shuttle looms for raw aging.', image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800&auto=format&fit=crop' },
  { id: 'cat-4', name: 'Jeans', slug: 'jeans', description: 'Essential everyday five-pocket jeans with washed finishes and comfort stretch.', image: 'https://images.unsplash.com/photo-1560243563-062bfc001d68?q=80&w=800&auto=format&fit=crop' },
  { id: 'cat-5', name: 'Chino Pants', slug: 'chino-pants', description: 'Refined casual trousers cut in breathable cotton twill for school, work, and hangout.', image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?q=80&w=800&auto=format&fit=crop' },
  { id: 'cat-6', name: 'Work Pants', slug: 'work-pants', description: 'Heavyweight double-knee and carpenter pants made for tough everyday wear.', image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=800&auto=format&fit=crop' },
  { id: 'cat-7', name: 'T-Shirt', slug: 't-shirt', description: 'Core heavyweight 24s/20s cotton combed tees with pre-shrunk silhouette.', image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop' },
  { id: 'cat-8', name: 'Oversized T-Shirt', slug: 'oversized-t-shirt', description: 'Boxy drop-shoulder cut tees made from breathable 220 GSM heavyweight cotton.', image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800&auto=format&fit=crop' },
  { id: 'cat-9', name: 'Flannel Shirt', slug: 'flannel-shirt', description: 'Brushed cotton plaid flannels offering timeless layering warmth and relaxed drape.', image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=800&auto=format&fit=crop' },
  { id: 'cat-10', name: 'Work Shirt', slug: 'work-shirt', description: 'Sturdy twin-pocket button-ups constructed from durable cotton poly blend.', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800&auto=format&fit=crop' },
  { id: 'cat-11', name: 'Work Jacket', slug: 'work-jacket', description: 'Canvas chore coats and Detroit zip jackets lined with soft flannel or quilt.', image: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?q=80&w=800&auto=format&fit=crop' },
  { id: 'cat-12', name: 'Varsity Jacket', slug: 'varsity-jacket', description: 'Collegiate wool-blend jackets with contrast faux-leather sleeves and chenille embroidery.', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800&auto=format&fit=crop' },
  { id: 'cat-13', name: 'Hoodie', slug: 'hoodie', description: 'Cozy 330 GSM french terry pullovers with double-layered hood and kangaroo pouch.', image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=800&auto=format&fit=crop' },
  { id: 'cat-14', name: 'Crewneck', slug: 'crewneck', description: 'Minimalist boxy-cut sweatshirts with heavy ribbed cuffs and collar.', image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=800&auto=format&fit=crop' },
  { id: 'cat-15', name: 'Sweater', slug: 'sweater', description: 'Textured knit pullovers and vintage cardigans designed for subtle clean layers.', image: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?q=80&w=800&auto=format&fit=crop' },
  { id: 'cat-16', name: 'Outerwear', slug: 'outerwear', description: 'Windbreakers, coach jackets, and technical parkas built for urban commuting.', image: 'https://images.unsplash.com/photo-1544923246-77307dd654cb?q=80&w=800&auto=format&fit=crop' },
  { id: 'cat-17', name: 'Short Pants', slug: 'short-pants', description: 'Comfortable nylon easy shorts, sweatshorts, and denim cutoffs for sunny days.', image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=80&w=800&auto=format&fit=crop' },
  { id: 'cat-18', name: 'Accessories', slug: 'accessories', description: 'Curated 6-panel caps, knit beanies, heavy canvas tote bags, and webbed belts.', image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=80&w=800&auto=format&fit=crop' }
];

export const BRANDS: Brand[] = [
  { id: 'br-1', name: 'Daily Thread', slug: 'daily-thread', description: 'Original in-house streetwear & essential lifestyle staples.' },
  { id: 'br-2', name: "Levi's", slug: 'levis', description: 'Pioneers of authentic heritage American denim since 1873.' },
  { id: 'br-3', name: 'Dickies', slug: 'dickies', description: 'Iconic durable Texas workwear adapted into modern youth street fashion.' },
  { id: 'br-4', name: 'Carhartt', slug: 'carhartt', description: 'Rugged canvas workwear tailored for heavy wear and functional utility.' },
  { id: 'br-5', name: 'Uniqlo', slug: 'uniqlo', description: 'Japanese LifeWear featuring refined minimalist cuts and comfort tech.' },
  { id: 'br-6', name: 'H&M', slug: 'hm', description: 'Youth-focused affordable trendy essentials and seasonal urban drops.' },
  { id: 'br-7', name: 'Zara', slug: 'zara', description: 'Elevated contemporary European cuts with clean structural tailoring.' },
  { id: 'br-8', name: 'Pull&Bear', slug: 'pull-and-bear', description: 'Casual teen California-inspired street style and skate culture.' },
  { id: 'br-9', name: 'Wrangler', slug: 'wrangler', description: 'Rugged western denim built for outdoor resilience and vintage charm.' },
  { id: 'br-10', name: 'Lee', slug: 'lee', description: 'Timeless denim jackets and rider jeans with classic yellow stitch.' },
  { id: 'br-11', name: 'Converse', slug: 'converse', description: 'Street culture icon renowned for skate-ready silhouettes.' },
  { id: 'br-12', name: 'Vans', slug: 'vans', description: 'Off the wall skate heritage garments with graphic edge.' },
  { id: 'br-13', name: 'Adidas', slug: 'adidas', description: 'Three stripes sport-inspired track apparel and contemporary retro tops.' },
  { id: 'br-14', name: 'Nike', slug: 'nike', description: 'Sportswear innovation with iconic collegiate and club fleece aesthetics.' },
  { id: 'br-15', name: 'Champion', slug: 'champion', description: 'The inventor of the hoodie, famous for patented Reverse Weave fleece.' },
  { id: 'br-16', name: 'Stussy', slug: 'stussy', description: 'Original Southern California streetwear heavyweight since 1980.' },
  { id: 'br-17', name: 'The North Face', slug: 'the-north-face', description: 'Technical outdoor wear seamlessly fused with modern city style.' },
  { id: 'br-18', name: 'Columbia', slug: 'columbia', description: 'Authentic Pacific Northwest heritage outdoor outerwear.' }
];

const CATEGORY_IMAGES: Record<string, string[]> = {
  'Cargo Pants': [
    'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1548883354-7622d03aca27?q=80&w=800&auto=format&fit=crop'
  ],
  'Denim Pants': [
    'https://images.unsplash.com/photo-1542272604-780c96856592?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1560243563-062bfc001d68?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1582552938357-32b906df40cb?q=80&w=800&auto=format&fit=crop'
  ],
  'Salvage Denim': [
    'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1582552938357-32b906df40cb?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1542272604-780c96856592?q=80&w=800&auto=format&fit=crop'
  ],
  'Jeans': [
    'https://images.unsplash.com/photo-1560243563-062bfc001d68?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1542272604-780c96856592?q=80&w=800&auto=format&fit=crop'
  ],
  'Chino Pants': [
    'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=800&auto=format&fit=crop'
  ],
  'Work Pants': [
    'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?q=80&w=800&auto=format&fit=crop'
  ],
  'T-Shirt': [
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=800&auto=format&fit=crop'
  ],
  'Oversized T-Shirt': [
    'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop'
  ],
  'Flannel Shirt': [
    'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1603252109303-2751441dd157?q=80&w=800&auto=format&fit=crop'
  ],
  'Work Shirt': [
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1603252109303-2751441dd157?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=800&auto=format&fit=crop'
  ],
  'Work Jacket': [
    'https://images.unsplash.com/photo-1548883354-7622d03aca27?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1544923246-77307dd654cb?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800&auto=format&fit=crop'
  ],
  'Varsity Jacket': [
    'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1548883354-7622d03aca27?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1544923246-77307dd654cb?q=80&w=800&auto=format&fit=crop'
  ],
  'Hoodie': [
    'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?q=80&w=800&auto=format&fit=crop'
  ],
  'Crewneck': [
    'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?q=80&w=800&auto=format&fit=crop'
  ],
  'Sweater': [
    'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?q=80&w=800&auto=format&fit=crop'
  ],
  'Outerwear': [
    'https://images.unsplash.com/photo-1544923246-77307dd654cb?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1548883354-7622d03aca27?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800&auto=format&fit=crop'
  ],
  'Short Pants': [
    'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1560243563-062bfc001d68?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=800&auto=format&fit=crop'
  ],
  'Accessories': [
    'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?q=80&w=800&auto=format&fit=crop'
  ]
};

const COLOR_PALETTES = [
  { name: 'Washed Black', hex: '#1C1C1C' },
  { name: 'Vintage Indigo', hex: '#2A3F54' },
  { name: 'Raw Ecru', hex: '#EBE6DD' },
  { name: 'Olive Drab', hex: '#4B5320' },
  { name: 'Heather Grey', hex: '#9E9E9E' },
  { name: 'Dark Khaki', hex: '#BDB76B' },
  { name: 'Charcoal', hex: '#36454F' },
  { name: 'Forest Green', hex: '#228B22' },
  { name: 'Clay Brown', hex: '#8B4513' },
  { name: 'Navy Blue', hex: '#000080' },
  { name: 'Off White', hex: '#FAF9F6' },
  { name: 'Deep Burgundy', hex: '#800020' },
  { name: 'Sand Beige', hex: '#D2B48C' }
];

const PRODUCT_TEMPLATES: Record<string, { adjectives: string[]; silhouettes: string[]; basePrice: number }> = {
  'Cargo Pants': {
    adjectives: ['Tactical Modular', 'Heavy Cotton', 'Ripstop Utility', 'Wide Leg Baggy', 'Parachute Tech', 'Relaxed Daily', 'Multi-Pocket Military', 'Double Knee', 'Six-Pocket Urban', 'Drawcord Cargo'],
    silhouettes: ['Cargo Trousers', 'Utility Pants', 'Combat Pants', 'Field Cargo', 'Worker Cargo'],
    basePrice: 289000
  },
  'Denim Pants': {
    adjectives: ['Vintage Washed', 'Loose Fit', 'Baggy 90s', 'Straight Leg', 'Distressed Raw', 'Classic Rigid', 'Fade Whisker', 'Skate Fit', 'Carpenter Rigid', 'Wide Cut'],
    silhouettes: ['Denim Trousers', 'Classic Denim', 'Baggy Denim', 'Straight Cut Denim', 'Raw Denim'],
    basePrice: 349000
  },
  'Salvage Denim': {
    adjectives: ['14oz Red-Line', 'Kuroki Mill', 'Unsanforized Raw', 'Indigo Shuttle Loom', 'Heavy Selvedge', 'Narrow Shuttle', 'Heritage 16oz', 'Rope Dyed'],
    silhouettes: ['Selvedge Jeans', 'Salvage Trousers', 'Raw Loom Denim', 'Authentic Selvedge'],
    basePrice: 599000
  },
  'Jeans': {
    adjectives: ['Original Regular', 'Tapered Stretch', 'Relaxed Comfort', 'Ripped Knee', 'Stone Washed', 'Dark Rinse', 'Medium Indigo', 'Black Coated'],
    silhouettes: ['Five-Pocket Jeans', 'Daily Jeans', 'Rider Jeans', 'Urban Jeans'],
    basePrice: 279000
  },
  'Chino Pants': {
    adjectives: ['Tailored Slim', 'Relaxed Pleated', 'Twill Everyday', 'Stretch Easy', 'Minimalist Crop', 'Wide Chino', 'Vintage Officer'],
    silhouettes: ['Chino Trousers', 'Daily Chino', 'Pleated Chino', 'Casual Chinos'],
    basePrice: 239000
  },
  'Work Pants': {
    adjectives: ['874 Heavy Twill', 'Double Knee Sturdy', 'Duck Canvas', 'Painter Carpenter', 'Straight Workwear', 'Heavy Duty Flex'],
    silhouettes: ['Work Trousers', 'Carpenter Pants', 'Utility Workwear', 'Double Knee Pants'],
    basePrice: 299000
  },
  'T-Shirt': {
    adjectives: ['Heavyweight 20s Combed', 'Vintage Fade', 'Pocket Crew', 'Essential Basic', 'Retro Pigment Dyed', 'Acid Washed', 'Minimalist Center Logo'],
    silhouettes: ['Tee', 'Crewneck T-Shirt', 'Graphic Tee', 'Pocket Tee'],
    basePrice: 129000
  },
  'Oversized T-Shirt': {
    adjectives: ['Drop Shoulder 220 GSM', 'Boxy Heavy Cotton', 'Washed Streetwear', 'Wide Cut Minimal', 'Cyber Gothic Print', 'Subtle Typography'],
    silhouettes: ['Oversized Tee', 'Boxy T-Shirt', 'Drop Shoulder Tee'],
    basePrice: 149000
  },
  'Flannel Shirt': {
    adjectives: ['Heavy Brushed Plaid', 'Ombre Check Relaxed', 'Shadow Tartan', 'Vintage Buffalo Check', 'Oversized Layering', 'Fleece Lined Warm'],
    silhouettes: ['Flannel Shirt', 'Plaid Overshirt', 'Checkered Button-Up'],
    basePrice: 249000
  },
  'Work Shirt': {
    adjectives: ['Short Sleeve Industrial', 'Twin Pocket Heavy Twill', 'Embroidered Mechanic', 'Sturdy Garage', 'Chambray Utility'],
    silhouettes: ['Work Shirt', 'Mechanic Button-Up', 'Utility Overshirt'],
    basePrice: 229000
  },
  'Work Jacket': {
    adjectives: ['Detroit Duck Canvas', 'Corduroy Collar Chore', 'Blanket Lined Rugged', 'Heavy Twill Zip', 'Vintage Washed Worker'],
    silhouettes: ['Chore Coat', 'Work Jacket', 'Mechanic Zip Jacket'],
    basePrice: 489000
  },
  'Varsity Jacket': {
    adjectives: ['Wool Blend Heritage', 'Letterman Chenille', 'Leather Sleeved Retro', 'Collegiate Vintage', 'Oversized Street Club'],
    silhouettes: ['Varsity Jacket', 'Letterman Bomber', 'Club Jacket'],
    basePrice: 529000
  },
  'Hoodie': {
    adjectives: ['Heavyweight 380 GSM Terry', 'Boxy Kangaroo Pouch', 'Faded Mineral Wash', 'Clean Minimal Embroidered', 'Thermal Lined Core'],
    silhouettes: ['Pullover Hoodie', 'Boxy Hoodie', 'Heavy Terry Sweatshirt'],
    basePrice: 299000
  },
  'Crewneck': {
    adjectives: ['Relaxed Vintage College', 'Heavy French Terry', 'Drop Shoulder Ribbed', 'Sun Faded Retro', 'Minimalist Daily'],
    silhouettes: ['Crewneck Sweatshirt', 'Boxy Crewneck', 'Fleece Sweater'],
    basePrice: 269000
  },
  'Sweater': {
    adjectives: ['Chunky Cable Knit', 'Mohair Style Fluffy', 'Vintage Geo Jacquard', 'Waffle Knit Thermal', 'Grandpa Knit Cardigan'],
    silhouettes: ['Knit Sweater', 'Cardigan Pullover', 'Crewneck Knit'],
    basePrice: 319000
  },
  'Outerwear': {
    adjectives: ['Mountain Tech Parka', 'Waterproof Coach', 'Ripstop Nylon Windbreaker', 'Anorak 1/4 Zip', 'Puffer Light Vest'],
    silhouettes: ['Coach Jacket', 'Windbreaker', 'Shell Parka', 'Track Jacket'],
    basePrice: 389000
  },
  'Short Pants': {
    adjectives: ['Cargo Easy Shorts', 'Heavy Sweatshorts', 'Baggy Denim Jorts', 'Nylon Amphibious', 'Elastic Twill Relaxed'],
    silhouettes: ['Short Pants', 'Cargo Shorts', 'Easy Shorts', 'Denim Cutoffs'],
    basePrice: 179000
  },
  'Accessories': {
    adjectives: ['Heavy Duck Canvas', '6-Panel Unstructured Dad', 'Ribbed Fisherman', 'Tactical Webbed', 'Embroidered Daily'],
    silhouettes: ['Tote Bag', 'Dad Cap', 'Beanie', 'Utility Belt', 'Crossbody Bag'],
    basePrice: 99000
  }
};

export function generateSeedProducts(): Product[] {
  const products: Product[] = [];
  let idCounter = 1;

  for (let catIndex = 0; catIndex < CATEGORIES.length; catIndex++) {
    const category = CATEGORIES[catIndex];
    const catName = category.name;
    const template = PRODUCT_TEMPLATES[catName] || PRODUCT_TEMPLATES['Cargo Pants'];
    const images = CATEGORY_IMAGES[catName] || CATEGORY_IMAGES['Cargo Pants'];

    const itemCountForCat = 15; 

    for (let i = 0; i < itemCountForCat; i++) {
      const brandObj = BRANDS[(catIndex * 3 + i) % BRANDS.length];
      const brandName = brandObj.name;

      const adj = template.adjectives[i % template.adjectives.length];
      const sil = template.silhouettes[i % template.silhouettes.length];
      const name = `${brandName} ${adj} ${sil}`;
      const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${idCounter}`;

      const priceVariation = ((idCounter * 17) % 70) * 1000;
      const price = template.basePrice + priceVariation;

      const hasDiscount = idCounter % 3 === 0;
      const discount_price = hasDiscount ? Math.round(price * 0.82) : null;

      const isOutOfStock = idCounter === 14 || idCounter === 47 || idCounter === 112;
      const stock = isOutOfStock ? 0 : Math.floor(15 + ((idCounter * 17) % 85));

      let badge: Product['badge'] = null;
      if (isOutOfStock) {
        badge = 'OUT OF STOCK';
      } else if (hasDiscount) {
        badge = 'SALE';
      } else if (idCounter % 7 === 0) {
        badge = 'BEST SELLER';
      } else if (idCounter % 8 === 0) {
        badge = 'TRENDING';
      } else if (idCounter % 11 === 0) {
        badge = 'NEW';
      } else if (idCounter % 19 === 0) {
        badge = 'LIMITED';
      }

      const isPant = catName.includes('Pants') || catName.includes('Jeans') || catName.includes('Denim') || catName.includes('Chino');
      const isAccessory = catName === 'Accessories';
      const sizes = isAccessory 
        ? ['All Size / Free Size'] 
        : isPant 
          ? ['28', '30', '32', '34', '36'] 
          : ['S', 'M', 'L', 'XL', 'XXL'];

      const colorStartIndex = (idCounter * 2) % COLOR_PALETTES.length;
      const colors = [
        COLOR_PALETTES[colorStartIndex],
        COLOR_PALETTES[(colorStartIndex + 1) % COLOR_PALETTES.length],
        COLOR_PALETTES[(colorStartIndex + 3) % COLOR_PALETTES.length]
      ];

      const primaryImage = images[i % images.length];
      const secondaryImage = images[(i + 1) % images.length];
      const tertiaryImage = images[(i + 2) % images.length];

      const brandCode = brandName.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X');
      const catCode = catName.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'C');
      const sku = `${brandCode}-${catCode}-${String(idCounter).padStart(3, '0')}`;

      const rating = Number((4.6 + ((idCounter % 5) * 0.08)).toFixed(1));
      const sold_count = Math.floor(25 + ((idCounter * 23) % 480));

      const description = `Koleksi autentik ${name} dari ${brandName}. Dirancang secara cermat menggunakan material premium berkualitas tinggi untuk mendukung mobilitas harian para remaja dan pencinta streetwear. Menampilkan potongan presisi modern dengan kenyamanan maksimal, jahitan rantai kokoh, serta detail fungsional tahan lama. Cocok dipadukan dengan berbagai daily outfit, streetwear, maupun casual workwear.`;

      products.push({
        id: `prod-${idCounter}`,
        name,
        slug,
        brand: brandName,
        category: catName,
        price,
        discount_price,
        description,
        images: [primaryImage, secondaryImage, tertiaryImage],
        sizes,
        colors,
        stock,
        sku,
        rating: Math.min(5.0, rating),
        sold_count,
        status: isOutOfStock ? 'out_of_stock' : 'in_stock',
        badge,
        created_at: new Date(Date.now() - (idCounter * 86400000 * 0.5)).toISOString()
      });

      idCounter++;
    }
  }

  return products;
}

export const INITIAL_PRODUCTS: Product[] = generateSeedProducts();

export const SEED_USERS: User[] = [
  {
    id: 'user-demo-1',
    fullName: 'Alex Pratama',
    username: 'alexpratama',
    email: 'alex@dailythread.com',
    phone: '081298765432',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop',
    address: 'Jl. Senopati No. 42, RT 02 / RW 03',
    district: 'Kebayoran Baru',
    city: 'Jakarta Selatan',
    postalCode: '12190',
    role: 'user',
    status: 'active',
    createdAt: new Date('2026-01-10').toISOString()
  },
  {
    id: 'user-admin-1',
    fullName: 'Admin Daily Thread',
    username: 'admin_dailythread',
    email: 'admin@dailythread.com',
    phone: '081234567890',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop',
    address: 'Jl. Kemang Raya No. 18A',
    district: 'Mampang Prapatan',
    city: 'Jakarta Selatan',
    postalCode: '12730',
    role: 'admin',
    status: 'active',
    createdAt: new Date('2026-01-01').toISOString()
  }
];

export const SEED_ORDERS: Order[] = [];

