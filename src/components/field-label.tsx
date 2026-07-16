import { Label } from '@/components/ui/label'
import { InfoTooltip } from '@/components/info-tooltip'
import { GLOSSARY_TERMS } from '@/lib/glossary'

/** Label do campo com o termo técnico puro + ícone ⓘ com o significado. */
export function FieldLabel({ glossaryTermId, htmlFor }: { glossaryTermId: string; htmlFor?: string }) {
  const term = GLOSSARY_TERMS.find((t) => t.id === glossaryTermId)
  if (!term) return null

  return (
    <div className="flex items-center gap-1.5">
      <Label htmlFor={htmlFor}>{term.term}</Label>
      <InfoTooltip term={term} />
    </div>
  )
}
