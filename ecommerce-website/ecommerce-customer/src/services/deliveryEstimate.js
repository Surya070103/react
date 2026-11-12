const addBusinessDays = (date, days) => {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12)
  let remaining = days

  while (remaining > 0) {
    result.setDate(result.getDate() + 1)
    if (result.getDay() !== 0 && result.getDay() !== 6) remaining -= 1
  }

  return result
}

export const getDeliveryEstimate = (referenceDate = new Date()) => ({
  earliest: addBusinessDays(referenceDate, 3),
  latest: addBusinessDays(referenceDate, 5),
})

export const formatDeliveryEstimate = ({ earliest, latest }) => {
  const formatter = new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  return `${formatter.format(earliest)} - ${formatter.format(latest)}`
}
