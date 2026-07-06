// Real SS Bikes catalog data.
// Product specs, prices and imagery are sourced from ssbikes.in (Shopify storefront).
// Images reference the live Shopify CDN so photography matches the real store.

const CDN = 'https://cdn.shopify.com/s/files/1/0629/3497/4708/files'

export const img = {
  hero: 'https://ssbikes.in/cdn/shop/files/634515138_920420300675452_2599153082670953304_n.png?v=1771790018&width=1920',
  lifestyle: `${CDN}/1st_Slide_2_33715fed-400b-4d4b-b54d-6d7907f06624.jpg`,
  monero: `${CDN}/1stSlide_fe55cd5a-866c-46f8-b129-8547a93af5ea.jpg`,
  cosmosClassic: `${CDN}/1st_Slide_5_1.jpg`,
  cosmosStandard: `${CDN}/1st_Slide_5.jpg`,
  dynamo: `${CDN}/1st_Slide_3_0f4b92f9-9958-481e-9f79-073e601613a5.jpg`,
  retro: `${CDN}/ChatGPT_Image_Nov_10_2025_05_44_31_PM.png`,
  controller: `${CDN}/thumbnail_7167e89d-617a-4e8a-9fb3-3a14d98eeaf1.jpg`,
  throttle: `${CDN}/thumbnail_2_d6a6dd78-35af-4573-8c33-ad0b70533385.jpg`,
  ebrake: `${CDN}/thumbnail_2_48e38814-8f3f-4d86-a024-f262f1ff0161.jpg`,
  motor: `${CDN}/thumbnail_2_e1183a4d-239c-455e-826a-b68a2864aace.jpg`,
  review1: `${CDN}/IMG-20250211-WA0002.jpg`,
  review2: `${CDN}/IMG-20250211-WA0003.jpg`,
  review3: `${CDN}/IMG-20250211-WA0004.jpg`,
}

// spec keys render as an icon grid on the product page
const spec = (motor, battery, range, brakes, extra = {}) => ({
  motor,
  battery,
  range,
  brakes,
  ...extra,
})

export const products = [
  {
    slug: 'cosmos-premium',
    name: 'Cosmos Premium',
    category: 'e-bikes',
    tagline: 'The flagship city cruiser',
    price: 27500,
    compareAt: 34500,
    badge: 'Bestseller',
    image: img.cosmosStandard,
    colors: ['Black', 'Royal Blue', 'Orange', 'Forest Green'],
    range: '35+ km',
    motorW: 250,
    short:
      'A lightweight MTB-style unisex e-bike tuned for smooth city commuting, with an upgraded 7.8Ah battery and premium finish.',
    specs: spec('250W BLDC hub motor', '36V / 7.8Ah Li-ion', '35+ km on throttle', 'Dual disc brakes', {
      topSpeed: '25 km/h',
      frame: '26" alloy MTB frame',
      modes: '3 ride modes',
      charging: '4–6 hrs full charge',
    }),
  },
  {
    slug: 'dynamo-premium',
    name: 'Dynamo Premium',
    category: 'e-bikes',
    tagline: 'Throttle-first daily rider',
    price: 29500,
    compareAt: 33000,
    badge: null,
    image: img.dynamo,
    colors: ['White', 'Black'],
    range: '35+ km',
    motorW: 250,
    short:
      'A stylish throttle-enabled e-cycle with an LED display and three riding modes for effortless everyday commuting.',
    specs: spec('250W BLDC hub motor', '36V / 7.8Ah Li-ion', '35–45+ km range', 'Dual disc brakes', {
      topSpeed: '25 km/h',
      display: 'LED ride display',
      modes: '3 ride modes',
      charging: '4–6 hrs full charge',
    }),
  },
  {
    slug: 'phantom-premium',
    name: 'Phantom Premium',
    category: 'e-bikes',
    tagline: 'Go further on a single charge',
    price: 39000,
    compareAt: 44000,
    badge: 'Long range',
    image: img.cosmosClassic,
    colors: ['Black', 'Grey'],
    range: '45+ km',
    motorW: 250,
    short:
      'Our premium long-range model built for riders who want maximum distance without compromising on comfort.',
    specs: spec('250W BLDC hub motor', '36V / 10.4Ah Li-ion', '45+ km on throttle', 'Dual disc brakes', {
      topSpeed: '25 km/h',
      frame: '26" alloy frame',
      modes: '3 ride modes',
      charging: '5–7 hrs full charge',
    }),
  },
  {
    slug: 'cargox',
    name: 'CargoX',
    category: 'e-bikes',
    tagline: 'Built to haul, made to deliver',
    price: 36999,
    compareAt: 42000,
    badge: 'For delivery',
    image: img.monero,
    colors: ['Black'],
    range: '35–100+ km',
    motorW: 350,
    short:
      'A powerful 350W delivery-focused e-bike with a reinforced frame and heavy-duty carrier, engineered for last-mile logistics.',
    specs: spec('350W BLDC hub motor', '36V / up to 26Ah Li-ion', '35–100+ km range', 'Dual disc brakes', {
      topSpeed: '25 km/h',
      payload: 'Heavy-duty rear carrier',
      modes: 'Pedal-assist + throttle',
      charging: '6–8 hrs full charge',
    }),
  },
  {
    slug: 'retro',
    name: 'Retro Electric Bicycle',
    category: 'e-bikes',
    tagline: 'Classic looks, modern range',
    price: 32000,
    compareAt: 35000,
    badge: 'Village favourite',
    image: img.retro,
    colors: ['Black'],
    range: '70+ km',
    motorW: 250,
    short:
      'A comfortable steel-framed e-cycle with a big 12.5Ah battery, rear carrier and headlight — perfect for long daily commutes.',
    specs: spec('250W BLDC hub motor', '36V / 12.5Ah Li-ion', '70+ km on throttle', 'Dual disc brakes', {
      topSpeed: '25 km/h',
      frame: 'Comfort steel frame',
      extras: 'Rear carrier + headlight',
      charging: '6–8 hrs full charge',
    }),
  },
  {
    slug: 'monero-premium',
    name: 'Monero Premium',
    category: 'e-bikes',
    tagline: 'Adventure-ready MTB e-bike',
    price: 27500,
    compareAt: 30000,
    badge: null,
    image: img.monero,
    colors: ['Black'],
    range: '35+ km',
    motorW: 250,
    short:
      'A rugged mountain-style e-bike built for both city streets and off-road trails, with dual disc brakes and a versatile 26" frame.',
    specs: spec('250W BLDC hub motor', '36V / 7.5Ah Li-ion', '35+ km on throttle', 'Dual disc brakes', {
      topSpeed: '25 km/h',
      frame: '26" MTB frame',
      modes: '3 ride modes',
      charging: '4–6 hrs full charge',
    }),
  },
  {
    slug: 'cosmos-standard',
    name: 'Cosmos Standard',
    category: 'e-bikes',
    tagline: 'Everyday commuter, many colours',
    price: 25000,
    compareAt: 34500,
    badge: null,
    image: img.cosmosStandard,
    colors: ['Black', 'Orange', 'Royal Blue', 'Nado Pink', 'Yellow', 'Grey', 'Forest Green'],
    range: '35+ km',
    motorW: 250,
    short:
      'A lightweight mountain-style cycle for smooth city commuting, available in a full range of colours with a long-range option.',
    specs: spec('250W BLDC hub motor', '36V / 7.8Ah Li-ion', '35+ km (Long Range option)', 'Dual disc brakes', {
      topSpeed: '25 km/h',
      frame: '26" alloy frame',
      modes: '3 ride modes',
      charging: '4–6 hrs full charge',
    }),
  },
  {
    slug: 'dynamo-standard',
    name: 'Dynamo Standard',
    category: 'e-bikes',
    tagline: 'Clean design, flexible range',
    price: 27000,
    compareAt: 30000,
    badge: null,
    image: img.dynamo,
    colors: ['White'],
    range: '35–45+ km',
    motorW: 250,
    short:
      'A stylish e-cycle with variable battery options, LED display and three riding modes for flexible commuting.',
    specs: spec('250W BLDC hub motor', '36V / 7.8Ah Li-ion', '35–45+ km (Long Range option)', 'Dual disc brakes', {
      topSpeed: '25 km/h',
      display: 'LED ride display',
      modes: '3 ride modes',
      charging: '4–6 hrs full charge',
    }),
  },
  {
    slug: 'cosmos-classic',
    name: 'Cosmos Classic',
    category: 'e-bikes',
    tagline: 'The colourful entry point',
    price: 23000,
    compareAt: 25000,
    badge: 'Value',
    image: img.cosmosClassic,
    colors: ['Black', 'Orange', 'Blue', 'Nado Pink', 'Yellow', 'Grey', 'Royal Blue', 'Forest Green'],
    range: '20+ km',
    motorW: 250,
    short:
      'An MTB-style unisex e-bike with an external battery, adjustable handlebar and eight colour options — great first e-cycle.',
    specs: spec('250W BLDC hub motor', '36V / 5.8Ah external battery', '20+ km on throttle', 'Dual disc brakes', {
      topSpeed: '25 km/h',
      frame: '26" MTB frame',
      handlebar: 'Adjustable handlebar',
      charging: '4–5 hrs full charge',
    }),
  },
  {
    slug: 'monero-standard',
    name: 'Monero Standard',
    category: 'e-bikes',
    tagline: 'Trail-ready essentials',
    price: 25000,
    compareAt: 28000,
    badge: null,
    image: img.monero,
    colors: ['Black'],
    range: '35+ km',
    motorW: 250,
    short:
      'A versatile mountain-style e-bike with a 7.5Ah battery and dual disc brakes for urban and off-road use.',
    specs: spec('250W BLDC hub motor', '36V / 7.5Ah Li-ion', '35+ km on throttle', 'Dual disc brakes', {
      topSpeed: '25 km/h',
      frame: '26" MTB frame',
      modes: '3 ride modes',
      charging: '4–6 hrs full charge',
    }),
  },
  {
    slug: 'monero-classic',
    name: 'Monero Classic',
    category: 'e-bikes',
    tagline: 'The lightweight starter',
    price: 23000,
    compareAt: 25000,
    badge: 'Value',
    image: img.monero,
    colors: ['Black'],
    range: '25+ km',
    motorW: 250,
    short:
      'A lightweight mountain-style e-bike with a 5.8Ah battery, designed for city commuting and off-road adventures.',
    specs: spec('250W BLDC hub motor', '36V / 5.8Ah Li-ion', '25+ km on throttle', 'Dual disc brakes', {
      topSpeed: '25 km/h',
      frame: '26" MTB frame',
      modes: '3 ride modes',
      charging: '4–5 hrs full charge',
    }),
  },

  // ---- Accessories & spare parts ----
  {
    slug: 'bldc-hub-motor',
    name: 'BLDC Hub Motor',
    category: 'accessories',
    tagline: 'Smooth, low-maintenance power',
    price: 7000,
    compareAt: 7450,
    badge: null,
    image: img.motor,
    colors: ['Black'],
    short:
      'A brushless DC hub motor offering smooth, powerful and low-maintenance electric propulsion for your e-cycle.',
    specs: { type: '250W BLDC hub motor', voltage: '36V compatible', fit: 'Rear wheel', warranty: '6-month warranty' },
  },
  {
    slug: 'controller',
    name: 'Controller',
    category: 'accessories',
    tagline: 'The brain of your e-bike',
    price: 3500,
    compareAt: 5000,
    badge: 'Save 30%',
    image: img.controller,
    colors: ['Black'],
    short:
      'The e-bike controller manages power flow and sensor integration for smooth, safe operation of your electric bicycle.',
    specs: { type: 'E-bike controller', voltage: '36V', integration: 'Sensor + throttle ready', warranty: '6-month warranty' },
  },
  {
    slug: 'throttle-with-lock',
    name: 'Throttle with Lock',
    category: 'accessories',
    tagline: 'Control with built-in security',
    price: 1000,
    compareAt: null,
    badge: null,
    soldOut: true,
    image: img.throttle,
    colors: ['Black'],
    short:
      'A throttle control with an integrated lock mechanism, giving you convenient motor assistance plus a security feature.',
    specs: { type: 'Twist throttle', feature: 'Integrated key lock', fit: 'Universal e-bike', warranty: '3-month warranty' },
  },
  {
    slug: 'e-brake-lever',
    name: 'E-brake Lever',
    category: 'accessories',
    tagline: 'Brake + motor cut-off in one',
    price: 500,
    compareAt: 799,
    badge: 'Save 37%',
    image: img.ebrake,
    colors: ['Black'],
    short:
      'A vital braking component that integrates mechanical braking with motor cut-off for safer, more responsive stopping.',
    specs: { type: 'E-brake lever (pair)', feature: 'Motor cut-off switch', fit: 'Universal e-bike', warranty: '3-month warranty' },
  },
]

export const categories = [
  { handle: 'e-bikes', title: 'E-Bikes' },
  { handle: 'accessories', title: 'Accessories' },
]

export const formatINR = (n) =>
  '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })

export const getProduct = (slug) => products.find((p) => p.slug === slug)

export const byCategory = (handle) =>
  handle === 'all' ? products : products.filter((p) => p.category === handle)

export const featured = () =>
  products.filter((p) => p.category === 'e-bikes').slice(0, 6)
