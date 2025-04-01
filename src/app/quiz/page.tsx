'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Product } from '@/types/Product'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { EditButton } from '@/components/ui/EditButton'
import clsx from 'clsx'

const genders: Product['gender'][] = ['herre', 'dame', 'barn', 'junior', 'unisex', 'alle']

type QuestionType = 'guessNameFromImage' | 'guessPrice'

export default function QuizPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [genderFilter, setGenderFilter] = useState<string | null>(null)
  const [questionType, setQuestionType] = useState<QuestionType | null>(null)
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null)
  const [options, setOptions] = useState<string[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [correctAnswer, setCorrectAnswer] = useState<string | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      let query = supabase.from('sport1melhus').select('*')
      if (genderFilter) {
        query = query.eq('gender', genderFilter)
      }
      const { data } = await query
      if (data) setProducts(data)
    }
    fetchProducts()
  }, [genderFilter])

  const generatePriceOptions = (price: number): string[] => {
    const values = [price, price + 100, price + 200, price - 200]
    const unique = Array.from(new Set(values)).filter(p => p > 0)
    return unique.map(p => p.toString()).sort(() => 0.5 - Math.random()).slice(0, 4)
  }

  const generateQuestion = () => {
    if (products.length === 0) return

    const pickRandom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]
    const randomType: QuestionType = pickRandom(['guessNameFromImage', 'guessPrice'])

    const correct = pickRandom(products)
    let opts: string[] = []
    let answer = ''

    if (randomType === 'guessPrice') {
      const price = correct.price ?? 0
      answer = price.toString()
      opts = generatePriceOptions(price)
    } else {
      answer = `${correct.brand} ${correct.name}`
      const sameBrand = products.filter(p => p.brand === correct.brand && p.name !== correct.name)
      const decoys = sameBrand.sort(() => 0.5 - Math.random()).slice(0, 3)
      opts = [answer, ...decoys.map(d => `${d.brand} ${d.name}`)]
    }

    setQuestionType(randomType)
    setCurrentProduct(correct)
    setOptions(opts.sort(() => 0.5 - Math.random()))
    setCorrectAnswer(answer)
    setSelected(null)
  }

  useEffect(() => {
    if (products.length > 0) generateQuestion()
  }, [products])

  const handleAnswer = (answer: string) => {
    setSelected(answer)
    if (answer === correctAnswer) {
      setTimeout(() => {
        generateQuestion()
      }, 1000)
    }
  }

  if (!currentProduct || !questionType) {
    return <p className="p-6 text-center">Loading question...</p>
  }

  return (
    <div className="p-6 max-w-xl mx-auto flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">Shoe Quiz 👟</h1>

      <div className="mb-6 w-full text-center">
        <label className="font-medium mr-2">Filter by gender:</label>
        <select
          className="border px-2 py-1 rounded bg-black text-white"
          value={genderFilter ?? 'all'}
          onChange={(e) => {
            setGenderFilter(e.target.value === 'all' ? null : e.target.value)
          }}
        >
          <option value="all">All</option>
          {genders.map((g) => (
            <option key={g} value={g}>
              {g.charAt(0).toUpperCase() + g.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-3 text-sm text-center text-blue-400">
        {currentProduct.url && (
          <a
            href={currentProduct.url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            View product on Sport1.no
          </a>
        )}
      </div>

      {questionType === 'guessNameFromImage' && (
        <>
          <p className="mb-2 text-center">What shoe is this?</p>
          <div className="relative w-full aspect-square bg-white rounded shadow mb-4 max-w-xs">
            <Image
              src={currentProduct.image}
              alt={currentProduct.name}
              fill
              className="object-contain rounded"
            />
          </div>
          <EditButton product={currentProduct} />
        </>
      )}

      {questionType === 'guessPrice' && (
        <>
          <p className="mb-2 text-center">What is the price?</p>
          <h2 className="text-lg font-semibold mb-2 text-center">
            {currentProduct.brand} {currentProduct.name}
          </h2>
          <div className="relative w-full aspect-square bg-white rounded shadow mb-4 max-w-xs">
            <Image
              src={currentProduct.image}
              alt={currentProduct.name}
              fill
              className="object-contain rounded"
            />
          </div>
          <EditButton product={currentProduct} />
        </>
      )}

      <div className="grid gap-3 mt-2 w-full max-w-xs">
        {options.map((opt, index) => {
          const isCorrect = opt === correctAnswer
          const isSelected = selected === opt

          const feedback =
            selected !== null
              ? isCorrect
                ? 'ring-2 ring-green-500'
                : isSelected
                ? 'ring-2 ring-red-500'
                : ''
              : ''

          return (
            <Button
              key={`${opt}-${index}`}
              variant="outline"
              disabled={selected === correctAnswer}
              onClick={() => handleAnswer(opt)}
              className={clsx(
                'w-full py-3 text-sm sm:text-base text-white transition-all',
                feedback
              )}
            >
              {questionType === 'guessPrice' ? `${opt} kr` : opt}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
