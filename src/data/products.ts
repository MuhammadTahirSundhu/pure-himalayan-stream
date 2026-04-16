import bottle300 from '@/assets/brand/bottle-300ml.png';
import bottle500 from '@/assets/brand/bottle-500ml.png';
import bottle1000 from '@/assets/brand/bottle-1000ml.png';
import bottle1500 from '@/assets/brand/bottle-1500ml.png';
import bottle19l from '@/assets/brand/bottle-19l.png';

export interface Product {
  id: string;
  name: string;
  size: string;
  price: number;
  description: string;
  image: string;
  category: 'bottle' | 'dispenser';
  inStock: boolean;
}

export const products: Product[] = [
  {
    id: '300ml',
    name: 'One Water 300ml',
    size: '300ml',
    price: 30,
    description: 'Perfect for on-the-go hydration. Pure Himalayan mineral water in a compact bottle.',
    image: bottle300,
    category: 'bottle',
    inStock: true,
  },
  {
    id: '500ml',
    name: 'One Water 500ml',
    size: '500ml',
    price: 50,
    description: 'Our most popular size. Ideal for daily use, gym, and travel.',
    image: bottle500,
    category: 'bottle',
    inStock: true,
  },
  {
    id: '1000ml',
    name: 'One Water 1L',
    size: '1L',
    price: 80,
    description: 'Family-friendly size. Great for home and office use.',
    image: bottle1000,
    category: 'bottle',
    inStock: true,
  },
  {
    id: '1500ml',
    name: 'One Water 1.5L',
    size: '1.5L',
    price: 100,
    description: 'Maximum hydration for the whole family. Premium Himalayan purity.',
    image: bottle1500,
    category: 'bottle',
    inStock: true,
  },
  {
    id: '19l',
    name: 'One Water 19L Dispenser',
    size: '19L',
    price: 250,
    description: 'Home & office dispenser bottle. Refundable deposit PKR 1,000 for first order.',
    image: bottle19l,
    category: 'dispenser',
    inStock: true,
  },
];

export const qualityResults = [
  { parameter: 'pH Value', allowedMax: '6.5 - 8.5', actual: '7.2', unit: '' },
  { parameter: 'TDS', allowedMax: '< 1000', actual: '180', unit: 'mg/L' },
  { parameter: 'Calcium', allowedMax: '< 200', actual: '42', unit: 'mg/L' },
  { parameter: 'Magnesium', allowedMax: '< 150', actual: '18', unit: 'mg/L' },
  { parameter: 'Sodium', allowedMax: '< 200', actual: '12', unit: 'mg/L' },
  { parameter: 'Potassium', allowedMax: '< 12', actual: '2.5', unit: 'mg/L' },
  { parameter: 'Chloride', allowedMax: '< 250', actual: '15', unit: 'mg/L' },
  { parameter: 'Sulphate', allowedMax: '< 250', actual: '22', unit: 'mg/L' },
  { parameter: 'Nitrate', allowedMax: '< 50', actual: '3.2', unit: 'mg/L' },
  { parameter: 'Turbidity', allowedMax: '< 5', actual: '0.3', unit: 'NTU' },
  { parameter: 'E. Coli', allowedMax: '0', actual: '0', unit: 'CFU/mL' },
  { parameter: 'Total Coliform', allowedMax: '0', actual: '0', unit: 'CFU/mL' },
];

export const purificationSteps = [
  { step: 1, title: 'Source Collection', description: 'Water sourced from pristine Himalayan glacial springs' },
  { step: 2, title: 'Pre-Filtration', description: 'Removes large sediments and particles' },
  { step: 3, title: 'Activated Carbon', description: 'Eliminates chlorine, odor, and organic compounds' },
  { step: 4, title: 'Reverse Osmosis', description: 'Removes 99.9% of contaminants at molecular level' },
  { step: 5, title: 'Mineral Enhancement', description: 'Essential minerals added back for perfect balance' },
  { step: 6, title: 'UV Sterilization', description: 'Destroys bacteria and viruses without chemicals' },
  { step: 7, title: 'Ozonation', description: 'Final disinfection ensuring absolute purity' },
  { step: 8, title: 'Micron Filtration', description: '0.2 micron filter for ultra-fine purification' },
  { step: 9, title: 'Quality Testing', description: 'PSQCA-certified lab testing every batch' },
  { step: 10, title: 'Sealed Bottling', description: 'Automated hygienic bottling in sterile environment' },
];
