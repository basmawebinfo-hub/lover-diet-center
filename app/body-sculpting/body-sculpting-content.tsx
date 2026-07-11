"use client"

import Image from "next/image"
import Link from "next/link"
import { useMemo, useState } from "react"
import { ArrowRight, Clock3, ShieldCheck, Sparkles, Star } from "lucide-react"
import { useLocale } from "@/lib/locale"
import { fallbackBodyServices, fallbackGallery, fallbackReviews, serviceCategories } from "@/lib/body-services"
import { Reveal } from "@/components/ui/reveal"

export function BodySculptingContent() {
  const { locale } = useLocale()
  const ar = locale === "ar"
  const [category, setCategory] = useState("all")
  const services = useMemo(() => fallbackBodyServices.filter((s) => s.isActive && (category === "all" || s.categoryId === category)), [category])
  return <div dir={ar ? "rtl" : "ltr"} className="min-h-screen bg-[#f7f6ef] text-neutral-950">
    <div>
      <section className="relative overflow-hidden bg-[#123f35] text-white">
        <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(circle_at_1px_1px,currentColor_1px,transparent_0)] [background-size:24px_24px]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 md:px-8 lg:grid-cols-2 lg:py-24">
          <div className="animate-fade-up"><span className="inline-flex items-center gap-2 rounded-full border border-[#d7b56d]/40 px-4 py-2 text-sm font-bold text-[#f2d38f]"><Sparkles className="size-4" />{ar ? "خدمات VIP في أم القيوين" : "VIP care in Umm Al Quwain"}</span><h1 className="mt-6 text-balance text-4xl font-black leading-tight sm:text-6xl">{ar ? "جسم أكثر تناسقًا، وبشرة أكثر إشراقًا" : "Feel sculpted, restored and radiant"}</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-white/75">{ar ? "جلسات متخصصة لنحت القوام والعناية بالبشرة والاسترخاء، بخطة تناسب احتياجاتك." : "Specialist body shaping, skin care and wellness sessions tailored to your goals."}</p><div className="mt-8 flex flex-wrap gap-3"><a href="#services" className="btn-shine rounded-full bg-[#d7b56d] px-6 py-3.5 font-bold text-[#123f35]">{ar ? "استكشفي الخدمات" : "Explore services"}</a><a href="tel:+971529033110" className="rounded-full border border-white/25 px-6 py-3.5 font-bold">052 903 3110</a></div></div>
          <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-[2.5rem] border border-white/15 p-3 shadow-2xl"><Image src="/images/body-sculpting/maderotherapy-vip.jpeg" alt={ar ? "جلسة وود ثيرابي" : "Wood therapy session"} fill priority sizes="420px" className="rounded-[2rem] object-cover" /></div>
        </div>
      </section>
      <section id="services" className="mx-auto max-w-7xl px-5 py-16 md:px-8 lg:py-24">
        <Reveal><p className="font-bold tracking-widest text-emerald-800">{ar ? "اختاري جلستك" : "CHOOSE YOUR SESSION"}</p><h2 className="mt-3 text-3xl font-black sm:text-4xl">{ar ? "عروض مصممة لاحتياجاتك" : "Care designed around your goals"}</h2></Reveal>
        <div className="mt-8 flex flex-wrap gap-2"><Filter active={category === "all"} onClick={() => setCategory("all")}>{ar ? "الكل" : "All"}</Filter>{serviceCategories.map(c => <Filter key={c.id} active={category === c.id} onClick={() => setCategory(c.id)}>{ar ? c.nameAr : c.nameEn}</Filter>)}</div>
        <Reveal variant="stagger" className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{services.map(service => <article key={service.id} className="group card-glow overflow-hidden rounded-[2rem] border border-[#dedacb] bg-white"><Link href={`/body-sculpting/${service.slug}`}><div className="relative aspect-[4/5] overflow-hidden"><Image src={service.imageUrl} alt={ar ? service.nameAr : service.nameEn} fill sizes="(max-width:768px) 100vw,33vw" className="object-cover transition duration-700 group-hover:scale-105" />{service.badgeEn && <span className="absolute start-4 top-4 rounded-full bg-[#123f35] px-4 py-2 text-xs font-bold text-white">{ar ? service.badgeAr : service.badgeEn}</span>}</div><div className="p-6"><div className="flex justify-between gap-3"><h3 className="text-xl font-black">{ar ? service.nameAr : service.nameEn}</h3><span className="shrink-0 text-xs font-bold text-neutral-500"><Clock3 className="me-1 inline size-4" />{service.durationMinutes} {ar ? "د" : "min"}</span></div><p className="mt-3 line-clamp-2 leading-7 text-neutral-600">{ar ? service.shortDescriptionAr : service.shortDescriptionEn}</p><div className="mt-5 flex items-end justify-between border-t pt-5"><div><b className="text-2xl text-emerald-900">{service.price} {ar ? "د.إ" : "AED"}</b>{service.compareAtPrice && <del className="ms-2 text-sm text-neutral-400">{service.compareAtPrice}</del>}</div><ArrowRight className="size-5 text-emerald-800 rtl:rotate-180" /></div></div></Link></article>)}</Reveal>
      </section>
      <section className="bg-white py-16"><div className="mx-auto max-w-7xl px-5 md:px-8"><Reveal className="text-center"><ShieldCheck className="mx-auto size-10 text-emerald-800" /><h2 className="mt-4 text-3xl font-black">{ar ? "رعاية واضحة من أول خطوة" : "Confident care from the first step"}</h2></Reveal><div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">{fallbackGallery.slice(0,7).map((g,i)=><figure key={g.id} className={`relative overflow-hidden rounded-3xl ${i===0?"col-span-2 row-span-2 aspect-square":"aspect-[4/5]"}`}><Image src={g.imageUrl} alt={ar?g.titleAr:g.titleEn} fill sizes="25vw" className="object-cover transition duration-700 hover:scale-105" /></figure>)}</div></div></section>
      <section className="bg-[#ece8d9] py-16"><div className="mx-auto max-w-7xl px-5 md:px-8"><h2 className="text-center text-3xl font-black">{ar ? "ماذا يقول عملاؤنا؟" : "What our clients say"}</h2><Reveal variant="stagger" className="mt-10 grid gap-5 md:grid-cols-3">{fallbackReviews.map(r=><blockquote key={r.id} className="rounded-3xl bg-white p-7"><div className="flex gap-1 text-[#b8862d]">{Array.from({length:r.rating}).map((_,i)=><Star key={i} className="size-4 fill-current" />)}</div><p className="mt-5 text-lg leading-8">“{ar?r.commentAr:r.commentEn}”</p><footer className="mt-5 font-bold text-emerald-900">{r.customerName}</footer></blockquote>)}</Reveal></div></section>
      <section className="bg-[#123f35] px-5 py-16 text-center text-white"><h2 className="text-3xl font-black">{ar ? "مش متأكدة أي جلسة تناسبك؟" : "Not sure which session fits you?"}</h2><a href="https://wa.me/971529033110" className="btn-shine mt-7 inline-block rounded-full bg-[#d7b56d] px-7 py-3.5 font-bold text-[#123f35]">{ar ? "اسألي عبر واتساب" : "Ask on WhatsApp"}</a></section>
    </div>
  </div>
}
function Filter({active,children,onClick}:{active:boolean;children:React.ReactNode;onClick:()=>void}){return <button type="button" onClick={onClick} aria-pressed={active} className={`rounded-full border px-5 py-2.5 text-sm font-bold ${active?"border-emerald-900 bg-emerald-900 text-white":"border-[#d3cebb] bg-white"}`}>{children}</button>}
