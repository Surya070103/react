export const filterProductsByPrice = (products, minPrice, maxPrice) => products.filter((product) => {
  const minimum = minPrice === '' ? null : Number(minPrice)
  const maximum = maxPrice === '' ? null : Number(maxPrice)
  return (minimum === null || product.price >= minimum)
    && (maximum === null || product.price <= maximum)
})
