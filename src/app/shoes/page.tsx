'use client'

import { supabase } from '@/lib/supabase'
import { Product } from '@/types/Product'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ShoesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const gender = searchParams.get('gender') || 'all'
  const sort = searchParams.get('sort') || 'desc'

  useEffect(() => {
    const fetchData = async () => {
      let query = supabase.from('sport1melhus').select('*')

      if (gender !== 'all') {
        query = query.eq('gender', gender)
      }

      query = query.order('price', { ascending: sort === 'asc' })

      const { data, error } = await query

      if (!error && data) {
        setProducts(data)
      }

      setLoading(false)
    }

    fetchData()
  }, [gender, sort])

  const handleGenderChange = (value: string) => {
    router.push(`?gender=${value}&sort=${sort}`)
  }

  const handleSortChange = (value: string) => {
    router.push(`?gender=${gender}&sort=${value}`)
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Shoes at Sport 1 Melhus 👟</h1>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <select
          className="border rounded-lg px-3 py-2"
          onChange={(e) => handleGenderChange(e.target.value)}
          defaultValue={gender}
        >
          <option value="all">All Genders</option>
          <option value="herre">Herre</option>
          <option value="dame">Dame</option>
          <option value="barn">Barn</option>
          <option value="junior">Junior</option>
          <option value="unisex">Unisex</option>
          <option value="alle">Alle</option>
        </select>

        <select
          className="border rounded-lg px-3 py-2"
          onChange={(e) => handleSortChange(e.target.value)}
          defaultValue={sort}
        >
          <option value="desc">Sort by price: High → Low</option>
          <option value="asc">Sort by price: Low → High</option>
        </select>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={`${product.brand}-${product.name}-${product.image}`}
              className={`border rounded-2xl p-4 shadow hover:shadow-md transition ${
                product.has_error ? 'bg-red-900 text-white' : 'bg-white'
              }`}
            >
              <div className="aspect-square relative mb-4">
                {product.image && (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-contain rounded-xl"
                  />
                )}
              </div>
              <h2 className="text-xl font-semibold">{product.brand} {product.name}</h2>
              <p className="text-gray-600 mb-1">{product.price} kr</p>
              <p className="text-sm text-gray-500">Gender: {product.gender}</p>
              <p className="text-sm text-gray-500">Color: {product.color}</p>
              <p className="text-sm text-gray-500 italic">
                {product.description || 'No description yet'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
