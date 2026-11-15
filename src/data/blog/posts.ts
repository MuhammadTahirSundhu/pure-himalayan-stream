// data/blog/posts.ts — article bodies. Metadata (title, description, date) lives
// in index.json so the build script can prerender <head> and the sitemap.
import index from './index.json';

export type Block =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'note'; text: string }
  | { type: 'cta'; kind: 'delivery' | 'quality' | 'whatsapp' | 'products' }
  | { type: 'price19' }
  | { type: 'lab' };

export interface Post { slug: string; title: string; description: string; date: string; readMinutes: number; body: Block[] }

const bodies: Record<string, Block[]> = {
  '19-litre-water-delivery-gujranwala': [
    { type: 'p', text: 'A 19-litre bottle on a dispenser is the simplest way for a family or office to have clean drinking water on tap. Here is exactly how it works with One Water in Gujranwala — what you pay, what the deposit is for, and how to keep refills easy.' },
    { type: 'h2', text: 'What does a 19L refill cost?' },
    { type: 'p', text: 'You pay per bottle of water delivered. The current price is shown below and on our 19L delivery page — it is the same price you see at checkout, with no hidden charges.' },
    { type: 'price19' },
    { type: 'h2', text: 'How the refundable bottle deposit works' },
    { type: 'ul', items: [
      'The 19L bottle itself is reusable and stays ours. When you take a new bottle, you pay a one-time refundable deposit.',
      'When the rider brings your next refill, hand over your empty One Water bottle — you only pay for the water, no new deposit.',
      'If you stop ordering, return the bottle and your deposit is refunded.',
    ] },
    { type: 'h2', text: 'How many bottles does a family need?' },
    { type: 'p', text: 'A practical rule of thumb is about 2.5 litres per person per day for drinking and cooking. That means a family of four uses roughly three 19L bottles a week. Our monthly cost calculator on the delivery page does the maths for your household.' },
    { type: 'h2', text: 'How to order' },
    { type: 'ol', items: [
      'Choose how many bottles you need and how many empties you will return.',
      'Pick one-time, weekly, every two weeks or monthly delivery.',
      'Check out and pay cash on delivery — or send the order to us on WhatsApp.',
    ] },
    { type: 'note', text: 'We currently deliver across all of Gujranwala city. Not in Gujranwala? Join our city waitlist and we will tell you when One Water reaches you.' },
    { type: 'cta', kind: 'delivery' },
  ],
  'what-is-tds-in-drinking-water': [
    { type: 'p', text: 'TDS stands for Total Dissolved Solids — the total amount of minerals, salts and other substances dissolved in water, usually measured in milligrams per litre (mg/L). It is one of the first numbers people look at on a water report, but it is often misunderstood.' },
    { type: 'h2', text: 'What is in TDS?' },
    { type: 'p', text: 'Mostly everyday minerals such as calcium, magnesium, sodium, potassium, bicarbonates, chlorides and sulphates. These give water its taste. TDS on its own does not tell you whether water is free of germs — that is checked separately with tests like E. coli and total coliforms.' },
    { type: 'h2', text: 'What TDS is good for drinking?' },
    { type: 'p', text: 'The World Health Organization does not set a health-based limit for TDS, but it notes that water with TDS below about 600 mg/L is generally considered to taste good, while above about 1,000 mg/L it becomes increasingly unpalatable. Many lab reports in Pakistan compare against a 1,000 mg/L guideline.' },
    { type: 'h2', text: 'Is lower always better?' },
    { type: 'p', text: 'No. Water with almost no dissolved minerals can taste flat. That is why many purification plants, including ours, use reverse osmosis to remove impurities and then add essential minerals back for a clean, balanced taste.' },
    { type: 'h2', text: 'One Water’s numbers' },
    { type: 'p', text: 'Our water was independently tested by the PCRWR Water Quality Laboratory in Gujranwala. These are the figures from that report:' },
    { type: 'lab' },
    { type: 'cta', kind: 'quality' },
  ],
  'ro-water-vs-mineral-water': [
    { type: 'p', text: 'Bottles in Pakistan are labelled “mineral water”, “drinking water” and “purified water” — and the words are often used loosely. Here is what the terms actually mean, and what One Water is.' },
    { type: 'h2', text: 'Natural mineral water' },
    { type: 'p', text: 'Water taken from an underground spring or source and bottled with its natural mineral content. Its composition depends entirely on the source.' },
    { type: 'h2', text: 'RO (reverse osmosis) water' },
    { type: 'p', text: 'Water pushed through a very fine membrane that removes most dissolved salts, metals and other impurities. Pure RO water is very low in minerals, which can make it taste flat.' },
    { type: 'h2', text: 'Remineralised RO water — what One Water is' },
    { type: 'p', text: 'One Water is produced at our own plant in Gujranwala. Water is filtered, purified by reverse osmosis, then essential minerals are added back for taste and balance, followed by UV, ozone and micron filtration before sealing. We do not claim it comes from a mountain spring or glacier.' },
    { type: 'h2', text: 'Which should you choose?' },
    { type: 'ul', items: [
      'Ask for a recent independent lab report — not just a label.',
      'Check microbiological results (E. coli and coliforms should be zero).',
      'Check that TDS, sodium and nitrate are within guideline values.',
      'Buy from a supplier who tells you plainly where the water comes from.',
    ] },
    { type: 'cta', kind: 'quality' },
  ],
  'how-to-clean-water-dispenser': [
    { type: 'p', text: 'Even with clean bottled water, a dispenser that is never cleaned can collect dust and build-up inside its reservoir and taps. A simple routine keeps every glass tasting fresh.' },
    { type: 'h2', text: 'How often?' },
    { type: 'p', text: 'Clean the outside and drip tray weekly, and the inside reservoir every one to three months — or as often as your dispenser’s manual recommends.' },
    { type: 'h2', text: 'Step-by-step' },
    { type: 'ol', items: [
      'Unplug the dispenser and remove the bottle.',
      'Drain the remaining water through both taps (and the drain plug if your model has one).',
      'Wipe the reservoir with a clean cloth and a mild solution of white vinegar and water, or a little dish soap.',
      'Rinse thoroughly several times with clean drinking water until no smell remains.',
      'Clean the taps, the bottle seat and the drip tray, then dry with a clean cloth.',
      'Wash your hands, then place a fresh bottle — avoid touching the bottle neck.',
    ] },
    { type: 'h2', text: 'Storing 19L bottles' },
    { type: 'ul', items: [
      'Keep bottles out of direct sunlight and away from heat.',
      'Store them off the floor, away from chemicals, fuel and strong smells.',
      'Keep the seal on until the moment you place the bottle on the dispenser.',
    ] },
    { type: 'cta', kind: 'whatsapp' },
  ],
};

export const POSTS: Post[] = (index as Omit<Post, 'body'>[]).map((m) => ({ ...m, body: bodies[m.slug] ?? [] }));
export const getPost = (slug: string) => POSTS.find((p) => p.slug === slug);
