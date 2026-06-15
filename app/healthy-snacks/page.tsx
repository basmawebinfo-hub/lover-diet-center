import Image from 'next/image'
import { Cookie } from 'lucide-react'
import { InAppActionButton } from '@/components/in-app-action-button'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Healthy Snacks & Supplements',
  description: 'Guilt-free protein bars, dried fruits, nuts, and organic supplements from Lover Diet Center UAE.',
}

const products = [
  {
    nameEn: 'Whey Protein Blend',
    nameAr: 'بروتين واي',
    price: 189,
    category: 'Supplement',
    image: '/products/protein.png',
  },
  {
    nameEn: 'Fat Burner Complex',
    nameAr: 'حارق الدهون',
    price: 149,
    category: 'Supplement',
    image: '/products/burner.png',
  },
  {
    nameEn: 'Omega-3 Fish Oil',
    nameAr: 'أوميغا 3',
    price: 99,
    category: 'Supplement',
    image: '/products/omega.png',
  },
  {
    nameEn: 'Mass Gainer',
    nameAr: 'زيادة الكتلة',
    price: 219,
    category: 'Supplement',
    image: '/products/gainer.png',
  },
]

export default function HealthySnacksPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#f0faf7] to-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#4d7c0f]/10 text-[#4d7c0f] text-sm font-semibold px-4 py-2 rounded-full mb-6">
            <Cookie className="w-4 h-4" />
            Healthy Snacks & Supplements
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6 leading-tight">
            Snacks That Work{' '}
            <span className="text-[#4d7c0f]">For Your Goals</span>
          </h1>
          <p className="text-lg text-neutral-600 mb-8 max-w-2xl mx-auto">
            Protein bars, dried fruits, nuts, and certified supplements — all curated by our nutrition team to support your health journey.
          </p>
          <InAppActionButton mode="shop" label="Shop Now" />
        </div>
      </section>

      {/* Products */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-neutral-900 text-center mb-10">Featured Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product, i) => (
              <div key={i} className="bg-white border border-neutral-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="relative h-44 bg-[#f0faf7]">
                  <Image src={product.image} alt={product.nameEn} fill className="object-cover" />
                </div>
                <div className="p-4">
                  <span className="text-xs font-semibold text-[#4d7c0f] bg-[#4d7c0f]/10 px-2 py-1 rounded-full">
                    {product.category}
                  </span>
                  <h3 className="font-bold text-neutral-900 mt-2">{product.nameEn}</h3>
                  <p className="text-sm text-neutral-500">{product.nameAr}</p>
                  <p className="text-lg font-bold text-[#4d7c0f] mt-2">{product.price} AED</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <InAppActionButton mode="shop" label="View All Products" variant="light" />
          </div>
        </div>
      </section>
    </main>
  )
}
