export interface GlossaryTerm {
  id: string
  term: string
  meaning: string
  example: string
}

// Termo técnico + significado + exemplo hospitalar — mesmo padrão usado nos
// tooltips de campo e nas mensagens de interpretação situacional.
// Ver plano de arquitetura, seções 6.3 e 10.
export const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    id: 'tempo-de-ciclo',
    term: 'Tempo de ciclo',
    meaning: 'Tempo que leva para atender um paciente nesta etapa, do início ao fim.',
    example: 'Ex: 8 minutos na triagem.',
  },
  {
    id: 'setup',
    term: 'Setup',
    meaning:
      'Tempo para preparar a sala/equipamento entre um atendimento e outro (limpeza, troca de material, ajuste). Não conta o tempo do atendimento em si.',
    example: 'Ex: 5 minutos para higienizar a sala entre pacientes.',
  },
  {
    id: 'uptime',
    term: 'Uptime',
    meaning:
      '% do tempo em que a equipe/sala está disponível para atender, descontando pausas, manutenção ou falta de profissional.',
    example: 'Ex: 90% = disponível 90% do turno.',
  },
  {
    id: 'operadores',
    term: 'Operadores',
    meaning: 'Número de profissionais necessários para realizar esta etapa ao mesmo tempo.',
    example: 'Ex: 1 médico + 1 técnico.',
  },
  {
    id: 'estoque',
    term: 'Estoque (fila de espera)',
    meaning:
      'Chamado de estoque no vocabulário de VSM — na prática, é o número de pacientes aguardando entre uma etapa e outra.',
    example: 'Usado para calcular o tempo de espera.',
  },
  {
    id: 'takt-time',
    term: 'Takt time',
    meaning: 'Ritmo com que o setor precisa atender para dar conta da demanda de pacientes.',
    example: 'Ex: se chegam 60 pacientes em 8 horas, o takt time é de 1 paciente a cada 8 minutos.',
  },
  {
    id: 'demanda',
    term: 'Demanda',
    meaning: 'Quantidade de pacientes que chegam neste fluxo no período de referência.',
    example: 'Ex: turno, dia ou semana.',
  },
  {
    id: 'lead-time',
    term: 'Lead time',
    meaning: 'Tempo total que o paciente passa no fluxo, do início ao fim, somando esperas e atendimentos.',
    example: 'Ex: da chegada à alta.',
  },
  {
    id: 'va',
    term: '% VA (valor agregado)',
    meaning: 'Quanto do tempo total é atendimento de fato, versus espera.',
    example: 'Ex: 15% de VA significa que 85% do tempo o paciente está esperando.',
  },
  {
    id: 'gargalo',
    term: 'Gargalo',
    meaning: 'Etapa que trava o fluxo por não acompanhar o ritmo necessário (takt time).',
    example: 'Ex: uma triagem lenta represa os pacientes que chegam depois.',
  },
]
