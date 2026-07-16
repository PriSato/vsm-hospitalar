import { useState, type FormEvent } from 'react'
import { Plus, X } from 'lucide-react'
import { useVSMStore } from '@/store/vsm-store'
import type { VSMTemplate } from '@/lib/templates'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

/**
 * Um template representa uma categoria de fluxo (ex: "Cirurgia eletiva").
 * Dentro dela o usuário pode cadastrar fluxos específicos (ex: "Cirurgia
 * vascular", "Cirurgia oncológica") que reaproveitam as mesmas etapas base
 * e viram mapas independentes.
 */
const EMPTY_VARIANTS: string[] = []

export function TemplateCard({
  template,
  onStart,
}: {
  template: VSMTemplate
  onStart: (name: string, steps: string[]) => void
}) {
  const variants = useVSMStore((s) => s.templateVariants[template.id] ?? EMPTY_VARIANTS)
  const addTemplateVariant = useVSMStore((s) => s.addTemplateVariant)
  const removeTemplateVariant = useVSMStore((s) => s.removeTemplateVariant)

  const [adding, setAdding] = useState(false)
  const [variantName, setVariantName] = useState('')

  const submitVariant = (e: FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!variantName.trim()) return
    addTemplateVariant(template.id, variantName)
    setVariantName('')
    setAdding(false)
  }

  return (
    <Card className="hover:border-primary/60">
      <button
        type="button"
        className="w-full cursor-pointer text-left"
        onClick={() => onStart(template.name, template.steps)}
      >
        <CardHeader>
          <CardTitle>{template.name}</CardTitle>
          <CardDescription>{template.description}</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 text-xs text-muted-foreground">{template.steps.join(' → ')}</CardContent>
      </button>

      <div className="flex flex-wrap items-center gap-1.5 px-4 pb-4">
        {variants.map((variant) => (
          <span
            key={variant}
            className="group flex items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-1 text-xs text-foreground"
          >
            <button
              type="button"
              className="hover:underline"
              onClick={(e) => {
                e.stopPropagation()
                onStart(`${template.name} — ${variant}`, template.steps)
              }}
            >
              {variant}
            </button>
            <button
              type="button"
              aria-label={`Remover fluxo ${variant}`}
              className="text-muted-foreground opacity-0 hover:text-danger group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation()
                removeTemplateVariant(template.id, variant)
              }}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}

        {adding ? (
          <form className="flex items-center gap-1" onSubmit={submitVariant} onClick={(e) => e.stopPropagation()}>
            <Input
              autoFocus
              placeholder="Ex: Cirurgia vascular"
              value={variantName}
              onChange={(e) => setVariantName(e.target.value)}
              onBlur={() => !variantName && setAdding(false)}
              className="h-7 w-40 text-xs"
            />
            <Button type="submit" size="sm" className="h-7 px-2 text-xs">
              Adicionar
            </Button>
          </form>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 gap-1 px-2 text-xs text-muted-foreground"
            onClick={(e) => {
              e.stopPropagation()
              setAdding(true)
            }}
          >
            <Plus className="h-3 w-3" />
            Adicionar fluxo
          </Button>
        )}
      </div>
    </Card>
  )
}
