import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight, Clock } from 'lucide-react';
import { POSTS } from '@/data/blog/posts';
import PageHero from '@/components/site/PageHero';
import Reveal from '@/components/Reveal';
import Seo, { SITE_URL } from '@/components/site/Seo';

export default function Blog() {
  return (
    <div className="ow-page">
      <Seo path="/blog" jsonLd={[{ '@type': 'Blog', name: 'One Water guides', url: `${SITE_URL}/blog` }]} />
      <PageHero eyebrow={<><BookOpen className="w-4 h-4" /> Guides</>} title={<>Know your <span className="ow-gradient-text">water</span></>}
        subtitle="Plain-language guides on drinking water, 19L delivery and keeping your dispenser clean." />
      <section className="pb-20">
        <div className="container mx-auto px-4 max-w-5xl grid gap-5 sm:grid-cols-2">
          {POSTS.map((p, i) => (
            <Reveal key={p.slug} delay={i * 80} className="h-full">
              <Link to={`/blog/${p.slug}`} className="group ow-card ow-card-hover p-6 h-full flex flex-col">
                <p className="text-xs ow-subtle flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {p.readMinutes} min read</p>
                <h2 className="font-heading font-bold text-lg text-white mt-2 leading-snug">{p.title}</h2>
                <p className="text-sm ow-muted mt-2 flex-1">{p.description}</p>
                <span className="text-sm ow-cyan font-semibold mt-4 inline-flex items-center gap-1">Read guide <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" /></span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
