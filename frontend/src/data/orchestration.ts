import { MarkerType, Position, type Edge, type Node } from '@xyflow/react'

export type FlowParam = {
  key: string
  label: string
  kind: 'text' | 'number' | 'range'
  value: string | number
  min?: number
  max?: number
  step?: number
  suffix?: string
}

export type FlowNodeData = {
  title: string
  subtitle: string
  description: string
  tone: 'indigo' | 'sky' | 'amber' | 'rose' | 'emerald'
  icon: 'activity' | 'git-branch' | 'sparkles' | 'brain' | 'git-fork' | 'shield' | 'cpu' | 'send'
  category: string
  badge?: string
  badgeTone?: 'default' | 'secondary' | 'warning' | 'success'
  compact?: boolean
  params: FlowParam[]
  stats: Array<{ label: string; value: string }>
}

export type WorkflowNode = Node<FlowNodeData, 'workflowNode'>

export const toneStyles = {
  indigo: {
    border: 'border-zinc-300/90',
    bg: 'bg-zinc-100/80',
    icon: 'bg-zinc-200/90 text-zinc-700',
    text: 'text-zinc-700',
    ring: 'ring-zinc-300/55',
    handle: '#71717a',
    edge: '#71717a',
  },
  sky: {
    border: 'border-slate-300/90',
    bg: 'bg-slate-100/80',
    icon: 'bg-slate-200/90 text-slate-700',
    text: 'text-slate-700',
    ring: 'ring-slate-300/55',
    handle: '#64748b',
    edge: '#64748b',
  },
  amber: {
    border: 'border-[#d4c6ab]',
    bg: 'bg-[#f6f1e6]',
    icon: 'bg-[#efe3c7] text-[#8a6320]',
    text: 'text-[#8a6320]',
    ring: 'ring-[#ddc79d]/55',
    handle: '#8a6320',
    edge: '#8a6320',
  },
  rose: {
    border: 'border-stone-300/90',
    bg: 'bg-stone-100/75',
    icon: 'bg-stone-200/90 text-stone-700',
    text: 'text-stone-700',
    ring: 'ring-stone-300/55',
    handle: '#78716c',
    edge: '#78716c',
  },
  emerald: {
    border: 'border-emerald-300/90',
    bg: 'bg-emerald-50/90',
    icon: 'bg-emerald-100 text-emerald-700',
    text: 'text-emerald-700',
    ring: 'ring-emerald-300/55',
    handle: '#047857',
    edge: '#047857',
  },
} as const

const workflowNodes = (): WorkflowNode[] => [
  {
    id: 'trigger',
    type: 'workflowNode',
    position: { x: 80, y: 290 },
    sourcePosition: Position.Right,
    data: {
      title: 'User Event',
      subtitle: 'trigger',
      description: '从曝光、点击和停留事件进入推荐链路，为实时策略编排提供上下文。',
      tone: 'indigo',
      icon: 'activity',
      category: '输入',
      badge: 'online',
      compact: false,
      params: [
        { key: 'event_type', label: 'event_type', kind: 'text', value: 'click' },
        { key: 'sample_ratio', label: 'sample_ratio', kind: 'range', value: 80, min: 0, max: 100, step: 5, suffix: '%' },
      ],
      stats: [
        { label: 'QPS', value: '18.2k' },
        { label: '延迟', value: '14ms' },
      ],
    },
  },
  {
    id: 'itemcf',
    type: 'workflowNode',
    position: { x: 340, y: 205 },
    targetPosition: Position.Left,
    sourcePosition: Position.Right,
    data: {
      title: 'ItemCF 召回',
      subtitle: 'recall',
      description: '基于协同过滤聚合历史交互邻域，提供稳定的高覆盖召回底座。',
      tone: 'amber',
      icon: 'git-branch',
      category: '召回',
      badge: 'base',
      badgeTone: 'secondary',
      compact: false,
      params: [
        { key: 'top_k', label: 'top_k', kind: 'number', value: 200, min: 50, max: 500, step: 10 },
        { key: 'source_pool', label: 'source_pool', kind: 'text', value: 'user_click_7d' },
      ],
      stats: [
        { label: 'Coverage', value: '72%' },
        { label: 'Recall', value: '0.38' },
      ],
    },
  },
  {
    id: 'vector',
    type: 'workflowNode',
    position: { x: 340, y: 390 },
    targetPosition: Position.Left,
    sourcePosition: Position.Right,
    data: {
      title: 'Vector 召回',
      subtitle: 'semantic',
      description: '使用向量索引补充冷启动和长尾内容，增强新内容进入推荐池速度。',
      tone: 'sky',
      icon: 'sparkles',
      category: '召回',
      badge: 'boost',
      badgeTone: 'default',
      compact: false,
      params: [
        { key: 'index_name', label: 'index_name', kind: 'text', value: 'rec_item_embedding_v4' },
        { key: 'top_k', label: 'top_k', kind: 'number', value: 120, min: 20, max: 300, step: 10 },
      ],
      stats: [
        { label: 'Freshness', value: '4m' },
        { label: 'Recall', value: '0.24' },
      ],
    },
  },
  {
    id: 'ranker',
    type: 'workflowNode',
    selected: true,
    position: { x: 620, y: 300 },
    targetPosition: Position.Left,
    sourcePosition: Position.Right,
    data: {
      title: 'DeepFM Ranking',
      subtitle: 'ranking',
      description: '汇总召回候选后进行精排打分，是当前线上主排序器。',
      tone: 'amber',
      icon: 'brain',
      category: '排序',
      badge: 'selected',
      badgeTone: 'warning',
      compact: false,
      params: [
        { key: 'model_version', label: 'model_version', kind: 'text', value: 'deepfm_v2.3.1' },
        { key: 'temperature', label: 'temperature', kind: 'range', value: 100, min: 0, max: 200, step: 5, suffix: '%' },
        { key: 'output_size', label: 'output_size', kind: 'number', value: 50, min: 10, max: 100, step: 5 },
      ],
      stats: [
        { label: 'AUC', value: '0.842' },
        { label: 'P95', value: '38ms' },
      ],
    },
  },
  {
    id: 'ab-split',
    type: 'workflowNode',
    position: { x: 900, y: 320 },
    targetPosition: Position.Left,
    sourcePosition: Position.Right,
    data: {
      title: 'AB Split',
      subtitle: 'experiment',
      description: '在主排序后分流控制组与实验组，为策略上线提供低风险灰度。',
      tone: 'amber',
      icon: 'git-fork',
      category: '实验',
      badge: '50 / 50',
      badgeTone: 'warning',
      compact: true,
      params: [
        { key: 'traffic_control', label: 'traffic_control', kind: 'range', value: 50, min: 0, max: 100, step: 5, suffix: '%' },
        { key: 'traffic_test', label: 'traffic_test', kind: 'range', value: 50, min: 0, max: 100, step: 5, suffix: '%' },
      ],
      stats: [
        { label: '实验数', value: '12' },
        { label: '流量', value: '50%' },
      ],
    },
  },
  {
    id: 'filters',
    type: 'workflowNode',
    position: { x: 1160, y: 205 },
    targetPosition: Position.Left,
    sourcePosition: Position.Right,
    data: {
      title: 'Filters',
      subtitle: 'control',
      description: '控制组仅保留基础过滤和规则兜底，作为稳定基准线。',
      tone: 'rose',
      icon: 'shield',
      category: '规则',
      badge: 'control',
      badgeTone: 'secondary',
      compact: true,
      params: [
        { key: 'block_list', label: 'block_list', kind: 'text', value: 'unsafe_content, inventory_zero' },
        { key: 'top_k', label: 'top_k', kind: 'number', value: 80, min: 20, max: 150, step: 10 },
      ],
      stats: [
        { label: '规则命中', value: '8.4%' },
        { label: 'CTR', value: '+0.0%' },
      ],
    },
  },
  {
    id: 'din',
    type: 'workflowNode',
    position: { x: 1160, y: 425 },
    targetPosition: Position.Left,
    sourcePosition: Position.Right,
    data: {
      title: 'DIN Ranking',
      subtitle: 'test',
      description: '实验组替换为 DIN 精排，强化短期兴趣序列建模。',
      tone: 'sky',
      icon: 'cpu',
      category: '实验排序',
      badge: 'test',
      badgeTone: 'default',
      compact: false,
      params: [
        { key: 'model_version', label: 'model_version', kind: 'text', value: 'din_v1.8.4' },
        { key: 'top_k', label: 'top_k', kind: 'number', value: 100, min: 50, max: 200, step: 10 },
      ],
      stats: [
        { label: 'Lift', value: '+5.2%' },
        { label: 'P95', value: '42ms' },
      ],
    },
  },
  {
    id: 'output',
    type: 'workflowNode',
    position: { x: 1510, y: 320 },
    targetPosition: Position.Left,
    data: {
      title: 'Output',
      subtitle: 'dispatch',
      description: '将候选结果回传推荐服务，同时把策略标识写入监控和实验归因。',
      tone: 'emerald',
      icon: 'send',
      category: '输出',
      badge: 'live',
      badgeTone: 'success',
      compact: true,
      params: [
        { key: 'channel', label: 'channel', kind: 'text', value: 'home_feed' },
        { key: 'timeout', label: 'timeout', kind: 'number', value: 120, min: 80, max: 300, step: 10, suffix: 'ms' },
      ],
      stats: [
        { label: 'Dispatch', value: '99.97%' },
        { label: 'Trace', value: 'enabled' },
      ],
    },
  },
]

const workflowEdges = (): Edge[] => [
  {
    id: 'trigger-itemcf',
    source: 'trigger',
    target: 'itemcf',
    type: 'smoothstep',
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
    style: { stroke: '#94a3b8', strokeWidth: 1.5 },
  },
  {
    id: 'trigger-vector',
    source: 'trigger',
    target: 'vector',
    type: 'smoothstep',
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
    style: { stroke: '#94a3b8', strokeWidth: 1.5 },
  },
  {
    id: 'itemcf-ranker',
    source: 'itemcf',
    target: 'ranker',
    type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed, color: '#71717a' },
    style: { stroke: '#71717a', strokeWidth: 1.5 },
  },
  {
    id: 'vector-ranker',
    source: 'vector',
    target: 'ranker',
    type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed, color: '#64748b' },
    style: { stroke: '#64748b', strokeWidth: 1.5 },
  },
  {
    id: 'ranker-ab',
    source: 'ranker',
    target: 'ab-split',
    type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed, color: '#8a6320' },
    style: { stroke: '#8a6320', strokeWidth: 1.6 },
  },
  {
    id: 'ab-filters',
    source: 'ab-split',
    target: 'filters',
    type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed, color: '#71717a' },
    label: 'control 50%',
    labelStyle: { fill: '#52525b', fontSize: 10, fontWeight: 600 },
    style: { stroke: '#71717a', strokeWidth: 1.6 },
  },
  {
    id: 'ab-din',
    source: 'ab-split',
    target: 'din',
    type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed, color: '#8a6320' },
    label: 'test 50%',
    labelStyle: { fill: '#8a6320', fontSize: 10, fontWeight: 600 },
    style: { stroke: '#8a6320', strokeWidth: 1.6 },
  },
  {
    id: 'filters-output',
    source: 'filters',
    target: 'output',
    type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed, color: '#71717a' },
    style: { stroke: '#94a3b8', strokeWidth: 1.5 },
  },
  {
    id: 'din-output',
    source: 'din',
    target: 'output',
    type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed, color: '#047857' },
    style: { stroke: '#10b981', strokeWidth: 1.5 },
  },
]

export const createInitialNodes = () => workflowNodes()

export const createInitialEdges = () => workflowEdges()

export const railItems = [
  { id: 'orchestration', label: '编排', icon: 'workflow', active: true },
  { id: 'scenes', label: '场景', icon: 'layout-grid', active: false },
  { id: 'library', label: '组件', icon: 'package', active: false },
  { id: 'mock', label: 'Mock', icon: 'user-round-check', active: false },
  { id: 'monitor', label: '监控', icon: 'activity-square', active: false },
  { id: 'dashboard', label: '看板', icon: 'chart-no-axes-column', active: false },
] as const

export const topMetrics = [
  { label: 'Live Flow', value: '18', accent: 'text-zinc-700' },
  { label: 'Active Experiments', value: '12', accent: 'text-amber-700' },
  { label: 'P95 Latency', value: '42ms', accent: 'text-amber-700' },
] as const
