import { chromium } from 'playwright'
import { supabase } from '../src/lib/supabase'
import { Product } from '../src/types/Product'

const scrapeAll = async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage()
  const seen = new Set<string>()
  const failedProducts: { name: string; brand: string; gender: string; color: string; url: string; reason: string }[] = []

  for (let i = 1; i <= 50; i++) {
    console.log(`🔄 Scraping page ${i}...`)
    const url = `https://www.sport1.no/sko?page=${i}&InStockWarehouseIds=11340&sort=PriceDescending`
    await page.goto(url, { timeout: 10000 }).catch(() =>
      console.warn(`⚠️ Timeout loading listing page ${i}`)
    )
    await page.waitForTimeout(3000)

    const shoes = await page.$$eval('a.flex.flex-1.flex-col', nodes =>
      nodes.map(node => {
        const brand = node.querySelector('p.typo-subtitle-2')?.textContent?.trim() || ''
        const nameElements = node.querySelectorAll('p.typo-subtitle-2')
        const name = nameElements[1]?.textContent?.trim() || ''
        const priceRaw = node.querySelector('p.typo-subtitle-1')?.textContent || ''
        const cleanedPrice = priceRaw.replace(/\s/g, '') // ✅ handle prices over 1000
        const priceMatch = cleanedPrice.match(/(\d+),-/)
        const price = priceMatch ? parseInt(priceMatch[1], 10) : null
        const img = (node.querySelector('img') as HTMLImageElement)?.src || ''
        const href = (node as HTMLAnchorElement).getAttribute('href') || ''
        return { brand, name, price, img, href }
      })
    )

    const pageProducts: (Product & { has_error?: boolean })[] = []

    for (const shoe of shoes) {
      const href = shoe.href.trim()
      const fullUrl = `https://www.sport1.no${href}`

      const genderMatch = href.match(/-(herre|dame|barn|junior|alle|unisex)/i)
      const gender = (genderMatch?.[1].toLowerCase() ?? 'unisex') as Product['gender']

      let description = ''
      let color = ''

      try {
        const { data: existing } = await supabase
          .from('sport1melhus')
          .select('id')
          .eq('name', shoe.name)
          .eq('brand', shoe.brand)
          .eq('gender', gender)

        if (existing && existing.length > 0) {
          continue
        }
      } catch (err) {
        console.warn(`❌ Error checking Supabase for existing: ${shoe.name}`, err)
      }

      try {
        const detailPage = await browser.newPage()
        await detailPage.goto(fullUrl, { timeout: 10000 })
        await detailPage.waitForTimeout(1000)

        try {
          description = await detailPage.$eval(
            'div.grid.gap-4 p',
            el => el.textContent?.trim() || ''
          )
        } catch {
          console.warn(`⚠️ No description found for ${shoe.name}`)
        }

        try {
          const rawColor = await detailPage.$eval(
            'p.typo-subtitle-1.mb-1',
            el => el.textContent?.trim() || ''
          )
          const match = rawColor.match(/Farge:\s*(?:\d{3,4}-)?([a-zæøå]+)/i)
          if (match) {
            color = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase()
          }
        } catch {
          console.warn(`⚠️ No color found for ${shoe.name}`)
        }

        await detailPage.close()
        console.log(`✅ Scraped: ${shoe.brand} ${shoe.name}`)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err)
        console.warn(`❌ Failed to load product: ${shoe.name}`, errorMessage)
        failedProducts.push({
          name: shoe.name,
          brand: shoe.brand,
          gender,
          color,
          url: fullUrl,
          reason: errorMessage,
        })
        pageProducts.push({
          name: shoe.name,
          brand: shoe.brand,
          image: shoe.img,
          price: shoe.price,
          description: '',
          gender,
          color,
          url: fullUrl,
          has_error: true,
        })
        
        continue
      }

      const key = `${shoe.brand.toLowerCase()}|${shoe.name.toLowerCase()}|${gender}|${color.toLowerCase()}`
      if (seen.has(key)) continue
      seen.add(key)

      pageProducts.push({
        name: shoe.name,
        brand: shoe.brand,
        image: shoe.img,
        price: shoe.price,
        description,
        gender,
        color,
        url: fullUrl,
        has_error: false,
      })
      
    }

    if (pageProducts.length > 0) {
      const { error } = await supabase.from('sport1melhus').upsert(pageProducts, {
        onConflict: 'brand,name,gender,color',
      })
      if (error) {
        console.error(`❌ Upload error on page ${i}:`, error)
      } else {
        console.log(`📤 Uploaded ${pageProducts.length} shoes from page ${i}`)
      }
    }

    console.log(`✅ Page ${i} finished – total uploaded so far: ${seen.size}`)
  }

  if (failedProducts.length > 0) {
    console.log(`⚠️ ${failedProducts.length} failed products:`)
    failedProducts.forEach(p =>
      console.log(`- ${p.name} (${p.url}) → ${p.reason}`)
    )
  }

  await browser.close()
  console.log(`🎉 All done. Total uploaded: ${seen.size} shoes.`)
}

scrapeAll()
