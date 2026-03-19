export type ConsoleTone = 'neutral' | 'amber' | 'success'

export type StatusChip = {
  id: string
  label: string
  tone: ConsoleTone
}

export type HeroMetric = {
  label: string
  value: string
  note: string
  tone: ConsoleTone
}

export type WorkbenchSummary = {
  title: string
  description: string
  activeRailLabel: string
}

export type SplitSnapshot = {
  value: string
  note: string
}

export type GuardrailSnapshot = {
  value: string
  note: string
}

export type RuntimeCard = {
  id: string
  title: string
  eyebrow: string
  tone: ConsoleTone
  lines: Array<{
    label: string
    value: string
  }>
}

export type RiskSignal = {
  id: string
  label: string
  value: string
  detail: string
  tone: ConsoleTone
}

export type TimelineStep = {
  id: string
  time: string
  label: string
  status: string
  tone: ConsoleTone
}

export type ExperimentConsoleSnapshot = {
  workspace: WorkbenchSummary
  statusChips: StatusChip[]
  heroMetrics: HeroMetric[]
  split: SplitSnapshot
  guardrail: GuardrailSnapshot
  runtimeCards: RuntimeCard[]
  riskSignals: RiskSignal[]
  timeline: TimelineStep[]
}

export const experimentConsoleSnapshot: ExperimentConsoleSnapshot = {
  workspace: {
    title: '首页推荐主链路 / 实验工位',
    description: '当前工作区围绕召回、精排和 AB 分流展开，强调链路稳定性、参数可读性和实验风险感知。',
    activeRailLabel: '编排',
  },
  statusChips: [
    { id: 'window', label: '发布窗口进行中', tone: 'amber' },
    { id: 'saved', label: 'saved 17:24:18', tone: 'neutral' },
    { id: 'nodes', label: '主链路 18 nodes', tone: 'neutral' },
    { id: 'guardrail', label: 'guardrail healthy', tone: 'success' },
  ],
  heroMetrics: [
    { label: 'Live Flow', value: '18', note: 'active nodes', tone: 'neutral' },
    { label: 'Active Experiments', value: '12', note: 'running today', tone: 'amber' },
    { label: 'P95 Latency', value: '42ms', note: 'within guardrail', tone: 'amber' },
  ],
  split: {
    value: '50 / 50',
    note: 'control vs test split',
  },
  guardrail: {
    value: 'CTR +5.2%',
    note: '连续 30 分钟超过阈值可切量',
  },
  runtimeCards: [
    {
      id: 'traffic',
      title: 'Traffic Distribution',
      eyebrow: 'stable',
      tone: 'amber',
      lines: [
        { label: 'Control', value: '50%' },
        { label: 'Test', value: '50%' },
      ],
    },
    {
      id: 'release',
      title: 'Release Notes',
      eyebrow: 'watching',
      tone: 'neutral',
      lines: [
        { label: 'DIN', value: '仍在灰度观察期' },
        { label: 'Threshold', value: 'CTR > 3% for 30m' },
      ],
    },
  ],
  riskSignals: [
    {
      id: 'latency',
      label: 'Ranking P95',
      value: '38ms',
      detail: '低于 45ms 预算，仍有 7ms 缓冲',
      tone: 'success',
    },
    {
      id: 'coverage',
      label: 'Recall Coverage',
      value: '72%',
      detail: '向量召回稳定补充长尾，但未突破 75% 目标',
      tone: 'amber',
    },
    {
      id: 'safety',
      label: 'Rule Hit',
      value: '8.4%',
      detail: '过滤命中率正常，无异常抬升',
      tone: 'neutral',
    },
  ],
  timeline: [
    { id: 'warmup', time: '17:00', label: 'warm up traffic', status: 'completed', tone: 'success' },
    { id: 'observe', time: '17:12', label: 'observe guardrail', status: 'running', tone: 'amber' },
    { id: 'decision', time: '17:30', label: 'decide rollout', status: 'pending', tone: 'neutral' },
  ],
}

export function getExperimentConsoleSnapshot() {
  return experimentConsoleSnapshot
}
