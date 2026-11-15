// Lab parameters shown on /quality and the 10-stage process. Products come from the API.
export type { Product } from '@/lib/types';

/** Exactly as printed on PCRWR Water Quality Laboratory Gujranwala report
 *  ML GRW-1578 (received 24-02-2026, reported 02-03-2026). Update when a new report arrives. */
export const labReport = { lab: 'PCRWR Water Quality Laboratory, Gujranwala', code: 'ML GRW-1578', reported: '2 March 2026', remark: 'This sample is fit for drinking purpose on the basis of above parameters.',
  /** Urdu rendering of `remark` for the Urdu UI (the report itself is in English). */
  remarkUr: 'اوپر دیے گئے پیمانوں کی بنیاد پر یہ نمونہ پینے کے لیے موزوں ہے۔' };

/** Optional Urdu labels for lab parameters; keep `parameter` itself in English. */
export const qualityParameterUr: Record<string, string> = {
  Turbidity: 'گدلا پن',
  pH: 'pH',
  TDS: 'TDS (حل شدہ ٹھوس اجزاء)',
  Conductivity: 'برقی موصلیت',
  Sodium: 'سوڈیم',
  Potassium: 'پوٹاشیم',
  Calcium: 'کیلشیم',
  Magnesium: 'میگنیشیم',
  Hardness: 'سختی (Hardness)',
  Bicarbonate: 'بائی کاربونیٹ',
  'Nitrate (as N)': 'نائٹریٹ (بطور N)',
  Chloride: 'کلورائیڈ',
  Sulphate: 'سلفیٹ',
  'Total Coliforms': 'ٹوٹل کولیفارم',
  'E. Coli': 'ای کولائی (E. Coli)',
};

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
  { step: 1, title: 'Source Collection', description: 'Raw water drawn into our Gujranwala plant and checked before treatment',
    titleUr: 'پانی کی وصولی', descriptionUr: 'خام پانی ہمارے گوجرانوالہ پلانٹ میں لایا جاتا ہے اور ٹریٹمنٹ سے پہلے چیک کیا جاتا ہے' },
  { step: 2, title: 'Pre-Filtration', description: 'Removes large sediments and particles',
    titleUr: 'ابتدائی فلٹریشن', descriptionUr: 'مٹی اور بڑے ذرات نکال دیتی ہے' },
  { step: 3, title: 'Activated Carbon', description: 'Eliminates chlorine, odor, and organic compounds',
    titleUr: 'ایکٹیویٹڈ کاربن', descriptionUr: 'کلورین، بو اور نامیاتی اجزاء ختم کرتا ہے' },
  { step: 4, title: 'Reverse Osmosis', description: 'Removes 99.9% of contaminants at molecular level',
    titleUr: 'آر او (RO)', descriptionUr: 'مالیکیولر سطح پر 99.9% آلودگی دور کرتا ہے' },
  { step: 5, title: 'Mineral Enhancement', description: 'Essential minerals added back for perfect balance',
    titleUr: 'منرلز کی شمولیت', descriptionUr: 'صحیح توازن کے لیے ضروری منرلز دوبارہ شامل کیے جاتے ہیں' },
  { step: 6, title: 'UV Sterilization', description: 'Destroys bacteria and viruses without chemicals',
    titleUr: 'یو وی (UV) جراثیم کشی', descriptionUr: 'کیمیکل کے بغیر بیکٹیریا اور وائرس ختم کرتی ہے' },
  { step: 7, title: 'Ozonation', description: 'Final disinfection ensuring absolute purity',
    titleUr: 'اوزونیشن', descriptionUr: 'آخری جراثیم کشی، تاکہ پانی مکمل صاف رہے' },
  { step: 8, title: 'Micron Filtration', description: '0.2 micron filter for ultra-fine purification',
    titleUr: 'مائیکرون فلٹریشن', descriptionUr: 'انتہائی باریک صفائی کے لیے 0.2 مائیکرون فلٹر' },
  { step: 9, title: 'Quality Testing', description: 'Regular multi-parameter testing, with independent PCRWR lab reports',
    titleUr: 'کوالٹی ٹیسٹنگ', descriptionUr: 'مختلف پیمانوں پر باقاعدہ ٹیسٹنگ، اور PCRWR کی آزاد لیب رپورٹس' },
  { step: 10, title: 'Sealed Bottling', description: 'Automated hygienic bottling in sterile environment',
    titleUr: 'سیل بند بوتلنگ', descriptionUr: 'جراثیم سے پاک ماحول میں خودکار اور صاف ستھری بوتلنگ' },
];
