import { useState } from 'react'
import { Sparkles, Trash2 } from 'lucide-react'
import { useVSMStore } from '@/store/vsm-store'
import { VSM_TEMPLATES } from '@/lib/templates'
import { DEFAULT_SECTORS } from '@/lib/sectors'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { TemplateCard } from '@/components/template-card'
import { SiteHeader } from '@/components/site-header'

/** Ponto de partida: templates prontos, modo guiado ou mapas já existentes. Ver plano, seção 6.1. */
export function HomeView({
  onOpenProject,
  onStartWizard,
}: {
  onOpenProject: (id: string) => void
  onStartWizard: () => void
}) {
  const projects = useVSMStore((s) => s.projects)
  const createProjectFromSteps = useVSMStore((s) => s.createProjectFromSteps)
  const deleteProject = useVSMStore((s) => s.deleteProject)
  const [sectorId, setSectorId] = useState(DEFAULT_SECTORS[0].id)

  const startFlow = (name: string, steps: string[]) => {
    const id = createProjectFromSteps(name, sectorId, steps)
    onOpenProject(id)
  }

  return (
    <div className="min-h-screen bg-muted">
      <header className="border-b border-border bg-background">
        <div className="mx-auto max-w-5xl px-4">
          <SiteHeader />
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="text-2xl font-semibold text-foreground">Mapeamento de fluxo de valor</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Mapeie o fluxo de valor do atendimento e encontre os pontos que mais impactam o paciente.
        </p>

        <div className="mt-8">
          <Card className="border-primary/40 bg-primary/5">
            <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
              <div>
                <p className="text-sm font-semibold text-foreground">Nunca usou VSM antes?</p>
                <p className="text-sm text-muted-foreground">
                  O modo guiado pergunta passo a passo e monta o mapa pra você.
                </p>
              </div>
              <Button onClick={onStartWizard} className="gap-1.5">
                <Sparkles className="h-4 w-4" />
                Começar modo guiado
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Ou comece de um template</h2>
            <select
              value={sectorId}
              onChange={(e) => setSectorId(e.target.value)}
              className="h-8 rounded-md border border-border bg-background px-2 text-xs"
            >
              {DEFAULT_SECTORS.map((sector) => (
                <option key={sector.id} value={sector.id}>
                  {sector.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {VSM_TEMPLATES.map((template) => (
              <TemplateCard key={template.id} template={template} onStart={startFlow} />
            ))}
          </div>
        </div>

        {projects.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-3 text-sm font-semibold text-foreground">Seus mapas</h2>
            <ul className="flex flex-col gap-2">
              {projects.map((project) => (
                <li
                  key={project.id}
                  className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2"
                >
                  <button
                    className="text-left text-sm text-foreground hover:underline"
                    onClick={() => onOpenProject(project.id)}
                  >
                    {project.name}
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Excluir mapa"
                    onClick={() => deleteProject(project.id)}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
