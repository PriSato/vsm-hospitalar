import { useState } from 'react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { HomeView } from '@/components/home-view'
import { WizardView } from '@/components/wizard-view'
import { EditorView } from '@/components/editor-view'

type View = { name: 'home' } | { name: 'wizard' } | { name: 'editor'; projectId: string }

function App() {
  const [view, setView] = useState<View>({ name: 'home' })

  return (
    <TooltipProvider delayDuration={200}>
      {view.name === 'home' && (
        <HomeView
          onOpenProject={(id) => setView({ name: 'editor', projectId: id })}
          onStartWizard={() => setView({ name: 'wizard' })}
        />
      )}
      {view.name === 'wizard' && (
        <WizardView
          onDone={(id) => setView({ name: 'editor', projectId: id })}
          onCancel={() => setView({ name: 'home' })}
        />
      )}
      {view.name === 'editor' && (
        <EditorView projectId={view.projectId} onBack={() => setView({ name: 'home' })} />
      )}
    </TooltipProvider>
  )
}

export default App
