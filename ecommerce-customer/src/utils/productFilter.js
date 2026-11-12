import { getDiscountedPrice } from './formatters.js'

export const filterProductsByPrice = (products, minPrice, maxPrice) => products.filter((product) => {
  const minimum = minPrice === '' ? null : Number(minPrice)
  const maximum = maxPrice === '' ? null : Number(maxPrice)
  const price = getDiscountedPrice(product)
  return (minimum === null || price >= minimum)
    && (maximum === null || price <= maximum)
})
