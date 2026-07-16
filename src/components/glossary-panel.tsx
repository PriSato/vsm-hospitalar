import { X, BookOpen } from 'lucide-react'
import { GLOSSARY_TERMS } from '@/lib/glossary'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * Painel lateral sempre acessível com os conceitos-chave de VSM. Repetir o
 * termo nos três lugares (campo, alerta, glossário) é o que fixa o
 * vocabulário na cabeça do usuário. Ver plano de arquitetura, seção 6.3.
 */
export function GlossaryPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <div
      className={cn(
        'fixed inset-y-0 right-0 z-40 w-80 border-l border-border bg-background shadow-xl transition-transform',
        open ? 'translate-x-0' : 'translate-x-full',
      )}
    >
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">Glossário de termos</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Fechar glossário">
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="h-[calc(100%-57px)] overflow-y-auto p-4">
        <ul className="flex flex-col gap-4">
          {GLOSSARY_TERMS.map((term) => (
            <li key={term.id}>
              <p className="text-sm font-semibold text-foreground">{term.term}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{term.meaning}</p>
              <p className="mt-0.5 text-xs italic text-muted-foreground/80">{term.example}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
