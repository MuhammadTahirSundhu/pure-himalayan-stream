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

function Price19() {
  const { product } = useDispenserProduct();
  const { settings } = useSiteSettings();
  if (!product) return <p className="ow-card p-4 text-sm ow-muted">See the current 19L price on our <Link to="/delivery" className="ow-cyan underline">delivery page</Link>.</p>;
  return (
    <div className="ow-card p-5 grid grid-cols-2 gap-4 text-center">
      <div><p className="text-xs ow-subtle uppercase tracking-wider">Water per 19L bottle</p><p className="font-heading font-black text-3xl text-white">{pkr(product.price)}</p></div>
      <div><p className="text-xs ow-subtle uppercase tracking-wider">Refundable deposit</p><p className="font-heading font-black text-3xl text-white">{pkr(settings.delivery_info.bottle_deposit)}</p><p className="text-xs ow-muted">new bottles only</p></div>
    </div>
  );
}

function Lab() {
  const pick = ['pH', 'TDS', 'Sodium', 'Nitrate (as N)', 'E. Coli'];
  return (
    <div className="ow-card overflow-hidden">
      <table className="w-full text-sm">
        <thead><tr className="text-left text-white" style={{ background: 'rgba(0,212,255,0.1)' }}><th className="p-3">Parameter</th><th className="p-3">Guideline</th><th className="p-3">One Water</th></tr></thead>
        <tbody>
          {qualityResults.filter((r) => pick.includes(r.parameter)).map((r) => (
            <tr key={r.parameter} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <td className="p-3 text-white">{r.parameter}</td><td className="p-3 ow-muted">{r.allowedMax}</td><td className="p-3 ow-cyan font-semibold">{r.actual} {r.unit}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs ow-subtle p-3">{labReport.lab}, report {labReport.code}, {labReport.reported}.</p>
    </div>
  );
}

function Cta({ kind }: { kind: 'delivery' | 'quality' | 'whatsapp' | 'products' }) {
  const { settings } = useSiteSettings();
  const map = {
    delivery: { to: '/delivery', icon: Truck, label: 'Order 19L delivery', text: 'Fresh 19L bottles delivered across Gujranwala.' },
    quality: { to: '/quality', icon: FlaskConical, label: 'See our full lab report', text: 'Every parameter, straight from the PCRWR report.' },
    products: { to: '/products', icon: ShoppingCart, label: 'See products & prices', text: 'Order online and pay cash on delivery.' },
  } as const;
  if (kind === 'whatsapp') {
    return (
      <div className="ow-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-white font-semibold">Need water for your dispenser? Order in one message.</p>
        <a className="ow-btn-whatsapp shrink-0" target="_blank" rel="noopener noreferrer" href={whatsappLink(settings.contact_info.whatsapp, 'Assalam o Alaikum! I would like to order 19L water.')}><WhatsAppIcon /> Order on WhatsApp</a>
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
    case 'p': return <p key={i} className="ow-muted leading-relaxed text-[1.05rem]">{b.text}</p>;
    case 'h2': return <h2 key={i} className="font-heading font-bold text-2xl text-white pt-4">{b.text}</h2>;
    case 'ul': return <ul key={i} className="list-disc pl-6 space-y-2 ow-muted">{b.items.map((t) => <li key={t}>{t}</li>)}</ul>;
    case 'ol': return <ol key={i} className="list-decimal pl-6 space-y-2 ow-muted">{b.items.map((t) => <li key={t}>{t}</li>)}</ol>;
    case 'note': return <p key={i} className="flex gap-2 rounded-xl p-4 text-sm text-sky-100" style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.2)' }}><Info className="w-4 h-4 mt-0.5 shrink-0 ow-cyan" />{b.text}</p>;
    case 'cta': return <Cta key={i} kind={b.kind} />;
    case 'price19': return <Price19 key={i} />;
    case 'lab': return <Lab key={i} />;
  }
}

export default function BlogPost() {
  const { slug = '' } = useParams();
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
        <Link to="/blog" className="text-sm ow-cyan inline-flex items-center gap-1 hover:underline"><ArrowLeft className="w-4 h-4" /> All guides</Link>
        <h1 className="font-heading font-black text-3xl md:text-4xl text-white mt-4 leading-tight">{post.title}</h1>
        <p className="text-sm ow-subtle mt-3 flex items-center gap-2"><Clock className="w-4 h-4" /> {post.readMinutes} min read · Updated {new Date(post.date).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        <div className="mt-8 space-y-5">{post.body.map(render)}</div>
      </article>
      <section className="pb-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-heading font-bold text-xl text-white mb-4">More guides</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {more.map((p) => (
              <Link key={p.slug} to={`/blog/${p.slug}`} className="ow-card ow-card-hover p-4 text-sm text-white font-semibold leading-snug">{p.title}</Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
