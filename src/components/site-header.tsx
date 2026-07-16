import logo from '@/assets/logo-hmsvp.png'
import { cn } from '@/lib/utils'

/** Cabeçalho com a marca do Hospital e Maternidade São Vicente de Paulo. */
export function SiteHeader({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cn('flex items-center gap-3', compact ? 'py-1' : 'py-2')}>
      <img
        src={logo}
        alt="Hospital e Maternidade São Vicente de Paulo"
        className={compact ? 'h-8 w-auto' : 'h-12 w-auto'}
      />
      {!compact && (
        <div className="h-8 w-px bg-border" aria-hidden="true" />
      )}
      {!compact && <span className="text-sm font-medium text-muted-foreground">VSM Hospitalar</span>}
    </div>
  )
}
