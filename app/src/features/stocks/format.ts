const dateFormat = new Intl.DateTimeFormat('en-AU', {
  day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
})

export const formatDate = (date: string) => dateFormat.format(new Date(date))
export const decimal = new Intl.NumberFormat('en-AU', {
  minimumFractionDigits: 2, maximumFractionDigits: 2,
})
export const signed = new Intl.NumberFormat('en-AU', {
  signDisplay: 'exceptZero', minimumFractionDigits: 2, maximumFractionDigits: 2,
})
