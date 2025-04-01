'use client'

import { useState } from 'react'
import { Product } from '@/types/Product'
import { supabase } from '@/lib/supabase'
import { Button } from './Button'

interface Props {
  product: Product
}

export const EditButton = ({ product }: Props) => {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(product)
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: name === 'price' ? parseInt(value) || 0 : value,
    }))
  }

  const handleSubmit = async () => {
    setStatus('saving')

    const updatedProduct = {
      ...form,
      has_error: false // ✅ Clear error status on save
    }

    const { error } = await supabase.from('sport1melhus').upsert(updatedProduct, {
      onConflict: 'brand,name,gender,color',
    })

    if (error) {
      console.error(error)
      setStatus('error')
    } else {
      setStatus('saved')
      setTimeout(() => {
        setEditing(false)
        setStatus('idle')
      }, 800)
    }
  }

  return (
    <div className="w-full mt-4 text-sm text-white">
      {!editing ? (
        <button
          onClick={() => setEditing(true)}
          className="underline text-gray-400 hover:text-white"
        >
          Edit product
        </button>
      ) : (
        <form
          onSubmit={e => {
            e.preventDefault()
            handleSubmit()
          }}
          className="flex flex-col gap-4 bg-neutral-900 p-4 rounded-xl shadow"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              name="brand"
              value={form.brand}
              onChange={handleChange}
              className="px-3 py-2 text-black bg-white rounded"
              placeholder="Brand"
            />
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="px-3 py-2 text-black bg-white rounded"
              placeholder="Model"
            />
            <input
              name="price"
              value={form.price ?? ''}
              onChange={handleChange}
              type="number"
              className="px-3 py-2 text-black bg-white rounded"
              placeholder="Price"
            />
            <input
              name="color"
              value={form.color}
              onChange={handleChange}
              className="px-3 py-2 text-black bg-white rounded"
              placeholder="Color"
            />
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="px-3 py-2 text-black bg-white rounded"
            >
              <option value="herre">Herre</option>
              <option value="dame">Dame</option>
              <option value="barn">Barn</option>
              <option value="junior">Junior</option>
              <option value="unisex">Unisex</option>
              <option value="alle">Alle</option>
            </select>
          </div>

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 text-black bg-white rounded"
            placeholder="Description"
          />

          <div className="flex flex-wrap gap-3 items-center justify-between">
            <Button size="sm" onClick={handleSubmit} disabled={status === 'saving'}>
              Save
            </Button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="text-gray-400 hover:text-white text-xs"
            >
              Cancel
            </button>
            {status === 'saved' && <span className="text-green-400 text-sm">✅ Saved!</span>}
            {status === 'error' && <span className="text-red-400 text-sm">❌ Failed</span>}
          </div>
        </form>
      )}
    </div>
  )
}
