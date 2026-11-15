// Lab parameters shown on /quality and the 10-stage process. Products come from the API.
export type { Product } from '@/lib/types';

/** Exactly as printed on PCRWR Water Quality Laboratory Gujranwala report
 *  ML GRW-1578 (received 24-02-2026, reported 02-03-2026). Update when a new report arrives. */
export const labReport = { lab: 'PCRWR Water Quality Laboratory, Gujranwala', code: 'ML GRW-1578', reported: '2 March 2026', remark: 'This sample is fit for drinking purpose on the basis of above parameters.' };

export const qualityResults = [
  { parameter: 'Turbidity', allowedMax: '5', actual: '0.1', unit: 'NTU' },
  { parameter: 'pH', allowedMax: '6.5 – 8.5 (WHO)', actual: '7.8', unit: '' },
  { parameter: 'TDS', allowedMax: '1000 (WHO)', actual: '130', unit: 'mg/L' },
  { parameter: 'Conductivity', allowedMax: 'No guideline', actual: '245', unit: 'µS/cm' },
  { parameter: 'Sodium', allowedMax: '200 (WHO)', actual: '20', unit: 'mg/L' },
  { parameter: 'Potassium', allowedMax: '12 (EC)', actual: '1.4', unit: 'mg/L' },
  { parameter: 'Calcium', allowedMax: 'No guideline', actual: '22', unit: 'mg/L' },
  { parameter: 'Magnesium', allowedMax: '150 (WHO)', actual: '7', unit: 'mg/L' },
  { parameter: 'Hardness', allowedMax: '< 500', actual: '150', unit: 'mg/L' },
  { parameter: 'Bicarbonate', allowedMax: 'No guideline', actual: '160', unit: 'mg/L' },
  { parameter: 'Nitrate (as N)', allowedMax: '10 (WHO)', actual: '1.11', unit: 'mg/L' },
  { parameter: 'Chloride', allowedMax: '250', actual: '30', unit: 'mg/L' },
  { parameter: 'Sulphate', allowedMax: '250 (WHO)', actual: '30', unit: 'mg/L' },
  { parameter: 'Total Coliforms', allowedMax: '0', actual: '0', unit: 'CFU/100ml' },
  { parameter: 'E. Coli', allowedMax: '0', actual: '0', unit: 'CFU/100ml' },
];

export const purificationSteps = [
  { step: 1, title: 'Source Collection', description: 'Raw water drawn into our Gujranwala plant and checked before treatment' },
  { step: 2, title: 'Pre-Filtration', description: 'Removes large sediments and particles' },
  { step: 3, title: 'Activated Carbon', description: 'Eliminates chlorine, odor, and organic compounds' },
  { step: 4, title: 'Reverse Osmosis', description: 'Removes 99.9% of contaminants at molecular level' },
  { step: 5, title: 'Mineral Enhancement', description: 'Essential minerals added back for perfect balance' },
  { step: 6, title: 'UV Sterilization', description: 'Destroys bacteria and viruses without chemicals' },
  { step: 7, title: 'Ozonation', description: 'Final disinfection ensuring absolute purity' },
  { step: 8, title: 'Micron Filtration', description: '0.2 micron filter for ultra-fine purification' },
  { step: 9, title: 'Quality Testing', description: 'Regular multi-parameter testing, with independent PCRWR lab reports' },
  { step: 10, title: 'Sealed Bottling', description: 'Automated hygienic bottling in sterile environment' },
];
