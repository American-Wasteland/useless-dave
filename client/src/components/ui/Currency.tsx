interface CurrencyProps {
  amount: number
  className?: string
}

export function Currency({ amount, className }: CurrencyProps) {
  const formatted = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)

  // es-CO uses ',' as decimal separator
  const separatorIndex = formatted.lastIndexOf(',')
  if (separatorIndex === -1) {
    return <span className={className}>{formatted}</span>
  }

  const integer = formatted.slice(0, separatorIndex)
  const cents = formatted.slice(separatorIndex + 1)

  return (
    <span className={className}>
      {integer}
      <sup className="text-[0.58em] font-medium ml-px">{cents}</sup>
    </span>
  )
}
