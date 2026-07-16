import { useState } from 'react'
import { ArrowLeft, ArrowRight, Plus, Trash2 } from 'lucide-react'
import { useVSMStore } from '@/store/vsm-store'
import { DEFAULT_SECTORS } from '@/lib/sectors'
import { FieldLabel } from '@/components/field-label'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface WizardStep {
  name: string
  cycleTime: number
}

/**
 * Modo guiado (wizard) para o primeiro mapa — o usuário só encontra o
 * editor avançado depois de já ter um mapa funcionando. Ver plano de
 * arquitetura, seção 6.2.
 */
export function WizardView({ onDone, onCancel }: { onDone: (projectId: string) => void; onCancel: () => void }) {
  const createProjectFromSteps = useVSMStore((s) => s.createProjectFromSteps)
  const updateProcessBox = useVSMStore((s) => s.updateProcessBox)

  const [step, setStep] = useState(1)
  const [projectName, setProjectName] = useState('')
  const [sectorId, setSectorId] = useState(DEFAULT_SECTORS[0].id)
  const [steps, setSteps] = useState<WizardStep[]>([{ name: '', cycleTime: 0 }])

  const canGoToStep2 = projectName.trim().length > 0
  const canGoToStep3 = steps.every((s) => s.name.trim().length > 0) && steps.length > 0
  const canFinish = steps.every((s) => s.cycleTime > 0)

  const finish = () => {
    const projectId = createProjectFromSteps(
      projectName.trim(),
      sectorId,
      steps.map((s) => s.name.trim()),
    )
    const project = useVSMStore.getState().projects.find((p) => p.id === projectId)
    if (project) {
      project.versions[0].processBoxes.forEach((box, index) => {
        updateProcessBox(projectId, box.id, { cycleTime: steps[index].cycleTime })
      })
    }
    onDone(projectId)
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Modo guiado — passo {step} de 3</CardTitle>
          <CardDescription>
            {step === 1 && 'Qual processo você quer mapear?'}
            {step === 2 && 'Quais são as etapas principais, em ordem?'}
            {step === 3 && 'Para cada etapa, quanto tempo leva em média?'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {step === 1 && (
            <>
              <div>
                <Label htmlFor="projectName">Nome do processo</Label>
                <Input
                  id="projectName"
                  autoFocus
                  placeholder="Ex: Jornada do paciente na Emergência"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="sector">Setor</Label>
                <select
                  id="sector"
                  value={sectorId}
                  onChange={(e) => setSectorId(e.target.value)}
                  className="mt-1 h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
                >
                  {DEFAULT_SECTORS.map((sector) => (
                    <option key={sector.id} value={sector.id}>
                      {sector.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-2">
              {steps.map((s, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    placeholder={`Etapa ${index + 1}`}
                    value={s.name}
                    onChange={(e) =>
                      setSteps((prev) => prev.map((p, i) => (i === index ? { ...p, name: e.target.value } : p)))
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Remover etapa"
                    disabled={steps.length === 1}
                    onClick={() => setSteps((prev) => prev.filter((_, i) => i !== index))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-fit gap-1.5"
                onClick={() => setSteps((prev) => [...prev, { name: '', cycleTime: 0 }])}
              >
                <Plus className="h-3.5 w-3.5" />
                Adicionar etapa
              </Button>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-3">
              {steps.map((s, index) => (
                <div key={index}>
                  <FieldLabel glossaryTermId="tempo-de-ciclo" htmlFor={`time-${index}`} />
                  <div className="mt-1 flex items-center gap-2">
                    <span className="w-32 shrink-0 truncate text-sm text-muted-foreground">{s.name}</span>
                    <Input
                      id={`time-${index}`}
                      type="number"
                      min={0}
                      placeholder="Minutos"
                      value={s.cycleTime || ''}
                      onChange={(e) =>
                        setSteps((prev) =>
                          prev.map((p, i) => (i === index ? { ...p, cycleTime: Number(e.target.value) } : p)),
                        )
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-2 flex justify-between">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5"
              onClick={() => (step === 1 ? onCancel() : setStep((s) => s - 1))}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {step === 1 ? 'Cancelar' : 'Voltar'}
            </Button>

            {step < 3 && (
              <Button
                size="sm"
                className="gap-1.5"
                disabled={step === 1 ? !canGoToStep2 : !canGoToStep3}
                onClick={() => setStep((s) => s + 1)}
              >
                Próximo
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            )}
            {step === 3 && (
              <Button size="sm" disabled={!canFinish} onClick={finish}>
                Gerar mapa
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
