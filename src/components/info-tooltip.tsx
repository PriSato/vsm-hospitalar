import { Info } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { GlossaryTerm } from '@/lib/glossary'

/**
 * Ícone ⓘ inline reaproveitado em campos, alertas e no glossário — mesmo
 * padrão em todos os lugares: termo técnico + significado + exemplo
 * hospitalar. Ver plano de arquitetura, seção 10.
 */
export function InfoTooltip({ term }: { term: GlossaryTerm }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={`O que é ${term.term}?`}
          className="inline-flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground hover:text-primary"
        >
          <Info className="h-3.5 w-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p className="font-semibold">{term.term}</p>
        <p className="mt-1">{term.meaning}</p>
        <p className="mt-1 italic text-background/80">{term.example}</p>
      </TooltipContent>
    </Tooltip>
  )
}
