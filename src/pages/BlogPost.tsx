import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, Info, Truck, FlaskConical, ShoppingCart } from 'lucide-react';
import { getPost, POSTS, type Block } from '@/data/blog/posts';
import { qualityResults, labReport } from '@/data/products';
import { useDispenserProduct } from '@/hooks/useProducts';
import { useSiteSettings, whatsappLink } from '@/hooks/useSiteSettings';
import { pkr } from '@/lib/pricing';
import Seo, { SITE_URL } from '@/components/site/Seo';
import WhatsAppIcon from '@/components/site/WhatsAppIcon';
import NotFound from './NotFound';
import { useLang } from '@/contexts/LanguageContext';

function Price19() {
  const { product } = useDispenserProduct();
  const { settings } = useSiteSettings();
  const { t, isUrdu } = useLang();
  if (!product) {
    return isUrdu
      ? <p className="ow-card p-4 text-sm ow-muted">19 لیٹر کی موجودہ قیمت ہمارے <Link to="/delivery" className="ow-cyan underline">ڈیلیوری صفحے</Link> پر دیکھیں۔</p>
      : <p className="ow-card p-4 text-sm ow-muted">See the current 19L price on our <Link to="/delivery" className="ow-cyan underline">delivery page</Link>.</p>;
  }
  return (
    <div className="ow-card p-5 grid grid-cols-2 gap-4 text-center">
      <div><p className="text-xs ow-subtle uppercase tracking-wider">{t('Water per 19L bottle', 'فی 19 لیٹر بوتل پانی')}</p><p className="font-heading font-black text-3xl text-white">{pkr(product.price)}</p></div>
      <div><p className="text-xs ow-subtle uppercase tracking-wider">{t('Refundable deposit', 'قابلِ واپسی سیکیورٹی')}</p><p className="font-heading font-black text-3xl text-white">{pkr(settings.delivery_info.bottle_deposit)}</p><p className="text-xs ow-muted">{t('new bottles only', 'صرف نئی بوتلوں پر')}</p></div>
    </div>
  );
}

function Lab() {
  const { t } = useLang();
  const pick = ['pH', 'TDS', 'Sodium', 'Nitrate (as N)', 'E. Coli'];
  return (
    <div className="ow-card overflow-hidden">
      <table className="w-full text-sm">
        <thead><tr className="text-start text-white" style={{ background: 'rgba(0,212,255,0.1)' }}><th className="p-3">{t('Parameter', 'پیمانہ')}</th><th className="p-3">{t('Guideline', 'مقررہ حد')}</th><th className="p-3">{t('One Water', 'ون واٹر')}</th></tr></thead>
        <tbody>
          {qualityResults.filter((r) => pick.includes(r.parameter)).map((r) => (
            <tr key={r.parameter} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <td className="p-3 text-white">{r.parameter}</td><td className="p-3 ow-muted"><span dir="ltr">{r.allowedMax}</span></td><td className="p-3 ow-cyan font-semibold"><span dir="ltr">{r.actual} {r.unit}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs ow-subtle p-3">{labReport.lab}، {t('report', 'رپورٹ')} <span dir="ltr">{labReport.code}</span>، {labReport.reported}۔</p>
    </div>
  );
}

function Cta({ kind }: { kind: 'delivery' | 'quality' | 'whatsapp' | 'products' }) {
  const { settings } = useSiteSettings();
  const { t } = useLang();
  const map = {
    delivery: { to: '/delivery', icon: Truck, label: t('Order 19L delivery', '19 لیٹر ڈیلیوری آرڈر کریں'), text: t('Fresh 19L bottles delivered across Gujranwala.', 'پورے گوجرانوالہ میں تازہ 19 لیٹر بوتلوں کی ڈیلیوری۔') },
    quality: { to: '/quality', icon: FlaskConical, label: t('See our full lab report', 'ہماری مکمل لیب رپورٹ دیکھیں'), text: t('Every parameter, straight from the PCRWR report.', 'ہر پیمانہ، سیدھا PCRWR کی رپورٹ سے۔') },
    products: { to: '/products', icon: ShoppingCart, label: t('See products & prices', 'پراڈکٹس اور قیمتیں دیکھیں'), text: t('Order online and pay cash on delivery.', 'آن لائن آرڈر کریں اور کیش آن ڈیلیوری ادائیگی کریں۔') },
  };
  if (kind === 'whatsapp') {
    return (
      <div className="ow-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-white font-semibold">{t('Need water for your dispenser? Order in one message.', 'ڈسپنسر کے لیے پانی چاہیے؟ ایک میسج میں آرڈر کریں۔')}</p>
        <a className="ow-btn-whatsapp shrink-0" target="_blank" rel="noopener noreferrer" href={whatsappLink(settings.contact_info.whatsapp, t('Assalam o Alaikum! I would like to order 19L water.', 'السلام علیکم! مجھے 19 لیٹر پانی آرڈر کرنا ہے۔'))}><WhatsAppIcon /> {t('Order on WhatsApp', 'واٹس ایپ پر آرڈر کریں')}</a>
      </div>
    );
  }
  const c = map[kind];
  return (
    <div className="ow-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <p className="text-white font-semibold flex items-center gap-2"><c.icon className="w-5 h-5 ow-cyan" /> {c.text}</p>
      <Link to={c.to} className="ow-btn shrink-0">{c.label}</Link>
    </div>
  );
}

function render(b: Block, i: number) {
  switch (b.type) {
    case 'p': return <p key={i} dir="ltr" lang="en" className="ow-muted leading-relaxed text-[1.05rem]">{b.text}</p>;
    case 'h2': return <h2 key={i} dir="ltr" lang="en" className="font-heading font-bold text-2xl text-white pt-4">{b.text}</h2>;
    case 'ul': return <ul key={i} dir="ltr" lang="en" className="list-disc pl-6 space-y-2 ow-muted">{b.items.map((t) => <li key={t}>{t}</li>)}</ul>;
    case 'ol': return <ol key={i} dir="ltr" lang="en" className="list-decimal pl-6 space-y-2 ow-muted">{b.items.map((t) => <li key={t}>{t}</li>)}</ol>;
    case 'note': return <p key={i} dir="ltr" lang="en" className="flex gap-2 rounded-xl p-4 text-sm text-sky-100" style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.2)' }}><Info className="w-4 h-4 mt-0.5 shrink-0 ow-cyan" />{b.text}</p>;
    case 'cta': return <Cta key={i} kind={b.kind} />;
    case 'price19': return <Price19 key={i} />;
    case 'lab': return <Lab key={i} />;
  }
}

export default function BlogPost() {
  const { slug = '' } = useParams();
  const { t, isUrdu } = useLang();
  const post = getPost(slug);
  if (!post) return <NotFound />;
  const url = `${SITE_URL}/blog/${post.slug}`;
  const more = POSTS.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <div className="ow-page">
      <Seo path={`/blog/${post.slug}`} title={`${post.title} | One Water`} description={post.description} jsonLd={[
        { '@type': 'Article', headline: post.title, description: post.description, datePublished: post.date, dateModified: post.date, mainEntityOfPage: url, image: `${SITE_URL}/og-image.jpg`, author: { '@type': 'Organization', name: 'One Water Pakistan' }, publisher: { '@id': `${SITE_URL}/#business` } },
        { '@type': 'BreadcrumbList', itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'Guides', item: `${SITE_URL}/blog` },
          { '@type': 'ListItem', position: 3, name: post.title, item: url },
        ] },
      ]} />
      <article className="container mx-auto px-4 max-w-3xl py-12 md:py-16">
        <Link to="/blog" className="text-sm ow-cyan inline-flex items-center gap-1 hover:underline"><ArrowLeft className="w-4 h-4 rtl:rotate-180" /> {t('All guides', 'تمام گائیڈز')}</Link>
        {isUrdu && <p className="mt-4 rounded-xl p-3 text-sm text-sky-100" style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.2)' }}>یہ مضمون فی الحال انگریزی میں ہے۔</p>}
        <h1 className="font-heading font-black text-3xl md:text-4xl text-white mt-4 leading-tight" dir="ltr" lang="en">{post.title}</h1>
        <p className="text-sm ow-subtle mt-3 flex items-center gap-2"><Clock className="w-4 h-4" /> {t(`${post.readMinutes} min read`, `${post.readMinutes} منٹ کی پڑھائی`)} · {t('Updated', 'آخری اپ ڈیٹ:')} {new Date(post.date).toLocaleDateString(isUrdu ? 'ur-PK' : 'en-PK', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        <div className="mt-8 space-y-5">{post.body.map(render)}</div>
      </article>
      <section className="pb-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-heading font-bold text-xl text-white mb-4">{t('More guides', 'مزید گائیڈز')}</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {more.map((p) => (
              <Link key={p.slug} to={`/blog/${p.slug}`} className="ow-card ow-card-hover p-4 text-sm text-white font-semibold leading-snug" dir="ltr" lang="en">{p.title}</Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
