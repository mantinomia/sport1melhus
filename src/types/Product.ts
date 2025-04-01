export interface Product {
  name: string
  brand: string
  image: string
  price: number | null
  description: string
  gender: 'herre' | 'dame' | 'barn' | 'junior' | 'unisex' | 'alle'
  color: string
  url: string
  has_error?: boolean // 👈 tracks scrape or data issues
}
