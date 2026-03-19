import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react'
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ChartNoAxesColumn,
  FlaskConical,
  Globe,
  LayoutGrid,
  MoonStar,
  Package,
  PanelLeftClose,
  Plus,
  Radar,
  TimerReset,
  UserRoundCheck,
  Workflow,
  ZoomIn,
} from 'lucide-react'
import {
  Background,
  BackgroundVariant,
  Controls,
  Panel,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useEdgesState,
  useNodesState,
  type Connection,
} from '@xyflow/react'

import FlowNode from '@/components/orchestration/flow-node'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import { getExperimentConsoleSnapshot, type ConsoleTone } from '@/data/console'
import {
  createInitialEdges,
  createInitialNodes,
  railItems,
  toneStyles,
  type FlowParam,
  type WorkflowNode,
} from '@/data/orchestration'
import { cn } from '@/lib/utils'

const nodeTypes = {
  workflowNode: FlowNode,
}

const railIcons = {
  workflow: Workflow,
  'layout-grid': LayoutGrid,
  package: Package,
  'user-round-check': UserRoundCheck,
  'activity-square': Activity,
  'chart-no-axes-column': ChartNoAxesColumn,
} as const

const toneDotClass: Record<ConsoleTone, string> = {
  neutral: 'bg-zinc-500',
  amber: 'bg-amber-400',
  success: 'bg-emerald-500',
}

const heroMetricClass: Record<ConsoleTone, string> = {
  neutral: 'text-zinc-950',
  amber: 'text-zinc-950',
  success: 'text-emerald-700',
}

const riskCardClass: Record<ConsoleTone, string> = {
  neutral: 'border-zinc-300/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(237,241,247,0.96))] text-zinc-800',
  amber: 'border-[rgba(209,182,123,0.82)] bg-[linear-gradient(180deg,rgba(255,251,244,0.98),rgba(245,236,217,0.96))] text-[#664b1f]',
  success: 'border-emerald-200/80 bg-[linear-gradient(180deg,rgba(236,253,245,0.96),rgba(209,250,229,0.78))] text-emerald-900',
}

const opsSectionClass = {
  runtime: 'ops-section-card ops-section-runtime',
  risk: 'ops-section-card ops-section-risk',
  release: 'ops-section-card ops-section-release',
} as const

const toneBadgeClass: Record<ConsoleTone, string> = {
  neutral: 'border-zinc-300/90 bg-zinc-950 text-white',
  amber: 'border-amber-300/80 bg-amber-100 text-amber-950',
  success: 'border-emerald-300/80 bg-emerald-50 text-emerald-900',
}

const timelineStatusClass: Record<ConsoleTone, string> = {
  neutral: 'border-zinc-300/90 bg-zinc-100 text-zinc-700',
  amber: 'border-amber-300/80 bg-amber-100 text-amber-900',
  success: 'border-emerald-300/80 bg-emerald-50 text-emerald-900',
}

type FlowEdgeMeta = {
  baseAnimated?: boolean
  baseLabelStyle?: CSSProperties
  baseMarkerColor?: string
  baseStyle?: CSSProperties
}

function getFlowFocusState(currentEdges: Array<{ id: string; source: string; target: string }>, selectedId: string) {
  const primaryEdgeIds = new Set(currentEdges.filter((edge) => edge.source === selectedId || edge.target === selectedId).map((edge) => edge.id))
  const relatedEdgeIds = new Set(primaryEdgeIds)
  const relatedNodeIds = new Set([selectedId])

  const walk = (direction: 'upstream' | 'downstream') => {
    const queue = [selectedId]
    const visited = new Set(queue)

    while (queue.length > 0) {
      const currentId = queue.shift()
      if (!currentId) {
        continue
      }

      currentEdges.forEach((edge) => {
        const nextId =
          direction === 'upstream'
            ? edge.target === currentId
              ? edge.source
              : null
            : edge.source === currentId
              ? edge.target
              : null

        if (!nextId) {
          return
        }

        relatedEdgeIds.add(edge.id)
        relatedNodeIds.add(nextId)

        if (visited.has(nextId)) {
          return
        }

        visited.add(nextId)
        queue.push(nextId)
      })
    }
  }

  walk('upstream')
  walk('downstream')

  return { primaryEdgeIds, relatedEdgeIds, relatedNodeIds }
}

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState<WorkflowNode>(createInitialNodes())
  const [edges, setEdges, onEdgesChange] = useEdgesState(createInitialEdges())
  const [activeRail, setActiveRail] = useState('orchestration')
  const [savedAt, setSavedAt] = useState('17:24:18')

  const selectedNodeId = useMemo(() => nodes.find((node) => node.selected)?.id ?? 'ranker', [nodes])
  const selectedNode = useMemo(() => nodes.find((node) => node.id === selectedNodeId) ?? nodes[0], [nodes, selectedNodeId])
  const selectedTone = selectedNode ? toneStyles[selectedNode.data.tone] : toneStyles.amber
  const edgeTopology = useMemo(() => edges.map((edge) => `${edge.id}:${edge.source}:${edge.target}`).join('|'), [edges])
  const structuralEdges = useMemo(() => edges.map(({ id, source, target }) => ({ id, source, target })), [edgeTopology])
  const flowFocusState = useMemo(() => getFlowFocusState(structuralEdges, selectedNodeId), [selectedNodeId, structuralEdges])

  const consoleSnapshot = useMemo(() => {
    const snapshot = getExperimentConsoleSnapshot()
    return {
      ...snapshot,
      workspace: {
        ...snapshot.workspace,
        activeRailLabel: railItems.find((item) => item.id === activeRail)?.label ?? snapshot.workspace.activeRailLabel,
      },
      statusChips: snapshot.statusChips.map((chip) => (chip.id === 'saved' ? { ...chip, label: `saved ${savedAt}` } : chip)),
    }
  }, [activeRail, savedAt])

  useEffect(() => {
    const { primaryEdgeIds, relatedEdgeIds, relatedNodeIds } = flowFocusState

    setNodes((currentNodes) =>
      currentNodes.map((node) => {
        const isSelected = node.id === selectedNodeId
        const isRelated = relatedNodeIds.has(node.id)

        return {
          ...node,
          style: {
            ...node.style,
            opacity: isSelected ? 1 : isRelated ? 0.94 : 0.38,
            filter: isSelected ? 'none' : isRelated ? 'saturate(0.94)' : 'saturate(0.72)',
            transition: 'opacity 240ms var(--ease-out-quart), filter 240ms var(--ease-out-quart)',
          },
          zIndex: isSelected ? 30 : isRelated ? 15 : 1,
        }
      }),
    )

    setEdges((currentEdges) =>
      currentEdges.map((edge) => {
        const meta = (edge.data ?? {}) as FlowEdgeMeta
        const baseStyle = meta.baseStyle ?? edge.style ?? { stroke: '#94a3b8', strokeWidth: 1.5 }
        const baseMarkerColor =
          meta.baseMarkerColor ??
          (typeof edge.markerEnd === 'object' && edge.markerEnd && 'color' in edge.markerEnd ? edge.markerEnd.color : undefined) ??
          (typeof baseStyle.stroke === 'string' ? baseStyle.stroke : '#94a3b8')
        const baseLabelStyle = meta.baseLabelStyle ?? edge.labelStyle
        const baseAnimated = meta.baseAnimated ?? edge.animated ?? false
        const isPrimary = primaryEdgeIds.has(edge.id)
        const isRelated = relatedEdgeIds.has(edge.id)
        const isDimmed = !isRelated
        const strokeColor = isPrimary ? selectedTone.edge : typeof baseStyle.stroke === 'string' ? baseStyle.stroke : '#94a3b8'
        const strokeWidth = isPrimary ? 2.7 : isRelated ? Math.max(Number(baseStyle.strokeWidth ?? 1.5), 1.7) : 1.2

        return {
          ...edge,
          animated: isPrimary ? true : baseAnimated && !isDimmed,
          className: isPrimary ? 'flow-edge-primary' : isRelated ? 'flow-edge-related' : 'flow-edge-dim',
          data: {
            ...meta,
            baseAnimated,
            baseLabelStyle,
            baseMarkerColor,
            baseStyle,
          },
          labelStyle: edge.label
            ? {
                ...baseLabelStyle,
                fill: isPrimary ? selectedTone.edge : baseLabelStyle?.fill ?? baseMarkerColor,
                opacity: isDimmed ? 0.32 : 0.96,
              }
            : edge.labelStyle,
          markerEnd: typeof edge.markerEnd === 'object' && edge.markerEnd
            ? {
                ...edge.markerEnd,
                color: isDimmed ? '#cbd5e1' : isPrimary ? selectedTone.edge : baseMarkerColor,
              }
            : edge.markerEnd,
          style: {
            ...baseStyle,
            opacity: isDimmed ? 0.2 : isPrimary ? 1 : 0.78,
            stroke: isDimmed ? '#cbd5e1' : strokeColor,
            strokeWidth,
          },
          zIndex: isPrimary ? 20 : isRelated ? 10 : 1,
        }
      }),
    )
  }, [flowFocusState, selectedNodeId, selectedTone, setEdges, setNodes])

  const handleConnect = useCallback(
    (connection: Connection) => {
      setEdges((currentEdges) =>
        addEdge(
          {
            ...connection,
            type: 'smoothstep',
            style: { stroke: '#71717a', strokeWidth: 1.5 },
          },
          currentEdges,
        ),
      )
    },
    [setEdges],
  )

  const handleNodeSelect = useCallback(
    (nodeId: string) => {
      setNodes((currentNodes) =>
        currentNodes.map((node) => ({
          ...node,
          selected: node.id === nodeId,
        })),
      )
    },
    [setNodes],
  )

  const updateParam = useCallback(
    (paramKey: string, value: string | number) => {
      setNodes((currentNodes) =>
        currentNodes.map((node) => {
          if (node.id !== selectedNodeId) {
            return node
          }

          return {
            ...node,
            data: {
              ...node.data,
              params: node.data.params.map((param) =>
                param.key === paramKey
                  ? {
                      ...param,
                      value,
                    }
                  : param,
              ),
            },
          }
        }),
      )
    },
    [selectedNodeId, setNodes],
  )

  const stepParam = useCallback(
    (param: FlowParam, direction: 'up' | 'down') => {
      if (param.kind === 'text' || typeof param.value !== 'number') {
        return
      }

      const delta = param.step ?? 1
      const nextValue = direction === 'up' ? param.value + delta : param.value - delta
      const boundedValue = Math.max(param.min ?? Number.MIN_SAFE_INTEGER, Math.min(param.max ?? Number.MAX_SAFE_INTEGER, nextValue))
      updateParam(param.key, boundedValue)
    },
    [updateParam],
  )

  const resetSelectedNode = useCallback(() => {
    const pristineNode = createInitialNodes().find((node) => node.id === selectedNodeId)
    if (!pristineNode) {
      return
    }

    setNodes((currentNodes) =>
      currentNodes.map((node) =>
        node.id === selectedNodeId
          ? {
              ...node,
              data: pristineNode.data,
            }
          : node,
      ),
    )
  }, [selectedNodeId, setNodes])

  const saveSelectedNode = useCallback(() => {
    const now = new Date()
    setSavedAt(now.toLocaleTimeString('zh-CN', { hour12: false }))
  }, [])

  return (
    <ReactFlowProvider>
      <div className="console-page min-h-screen px-3 py-3 md:px-5 md:py-5">
        <div className="console-shell relative mx-auto flex min-h-[calc(100vh-1.5rem)] w-full max-w-[1680px] flex-col overflow-hidden rounded-[30px] border border-white/80 bg-[rgba(246,248,251,0.94)] shadow-[0_28px_90px_rgba(15,23,42,0.09)]">
          <div className="ambient-orb ambient-orb-left" />
          <div className="ambient-orb ambient-orb-right" />
          <div className="scan-grid pointer-events-none absolute inset-0 opacity-50" />

          <header className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200/75 px-4 py-3.5 md:px-6">
            <div className="motion-enter motion-from-left motion-fast flex min-w-0 items-center gap-3">
              <div className="brand-mark flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border border-zinc-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.97),rgba(242,246,250,0.9))] text-zinc-900 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
                <Workflow className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-sm font-semibold tracking-[0.02em] text-zinc-950 md:text-[15px]">推荐编排实验台</div>
                  <Badge variant="secondary">Console surface</Badge>
                </div>
                <div className="mt-1 text-xs text-zinc-500 md:text-[13px]">把暖色缩回重点区域，用更冷的中性色和更硬朗的明暗对比，让界面更克制、更利落。</div>
              </div>
            </div>

            <nav className="motion-enter motion-delay-1 motion-fast order-3 flex w-full flex-wrap items-center gap-2 lg:order-none lg:w-auto lg:flex-1 lg:justify-center">
              {railItems.map((item) => {
                const Icon = railIcons[item.icon]
                const isActive = activeRail === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveRail(item.id)}
                    className={cn(
                      'nav-pill inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-medium transition-all duration-200 md:text-[13px]',
                      isActive
                        ? 'border-zinc-950 bg-zinc-950 text-zinc-50 shadow-[0_12px_24px_rgba(15,23,42,0.14)]'
                        : 'border-zinc-200/80 bg-white/78 text-zinc-500 hover:border-zinc-400 hover:text-zinc-900',
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {item.label}
                  </button>
                )
              })}
            </nav>

            <div className="motion-enter motion-delay-2 motion-from-right motion-fast flex items-center gap-2 md:gap-3">
              <Button variant="ghost" size="icon" className="hidden md:inline-flex">
                <PanelLeftClose className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <MoonStar className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                <Globe className="h-4 w-4" /> EN
              </Button>
              <div className="toolbar-chip hidden items-center gap-2.5 pl-2 pr-3 md:flex">
                <Avatar className="h-8 w-8 border border-zinc-200/80">
                  <AvatarFallback className="bg-zinc-950 text-xs font-semibold text-zinc-50">JH</AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-sm font-medium leading-none text-zinc-900">Joe Ho</div>
                  <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">strategy ops</div>
                </div>
              </div>
            </div>
          </header>

          <div className="relative z-10 flex-1 overflow-auto">
            <section className="px-4 pb-4 pt-5 md:px-6 md:pb-5 md:pt-7">
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.82fr)] xl:items-start">
                <div className="space-y-5">
                  <div className="motion-enter motion-delay-1 motion-shift-sm flex flex-wrap items-center gap-2">
                    <div className="micro-chip">
                      <span className="status-dot bg-amber-400" />
                      发布窗口进行中
                    </div>
                    <div className="micro-chip">
                      <span className="status-dot bg-zinc-500" />
                      {consoleSnapshot.workspace.activeRailLabel} workspace
                    </div>
                  </div>

                  <div className="motion-enter motion-delay-2 motion-shift-lg max-w-4xl">
                    <h1 className="max-w-[12ch] text-[clamp(2.6rem,5vw,4.9rem)] font-semibold tracking-[-0.06em] text-zinc-950">
                      让推荐实验像发布代码一样可控。
                    </h1>
                    <p className="mt-4 max-w-[60ch] text-[15px] leading-6 text-zinc-600 md:text-[16px]">
                      这次把界面整体温度拉冷，强化黑白灰层级，让琥珀只留在发布窗口、风险提示和实验焦点上，控制台会更像一个长期驻留的产品工作台。
                    </p>
                  </div>

                  <div className="motion-enter motion-delay-3 motion-shift-sm flex flex-wrap items-center gap-3">
                    <Button onClick={saveSelectedNode}>
                      发布变更
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                    <Button variant="outline">
                      <Plus className="h-4 w-4" /> 新建节点
                    </Button>
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    {consoleSnapshot.heroMetrics.map((metric, index) => (
                      <div
                        key={metric.label}
                        className={cn(
                          'hero-metric rounded-[22px] border px-4 py-3.5 md:px-4.5',
                          `motion-enter motion-delay-${index + 4} motion-shift-sm`,
                          index === 1 && 'hero-metric-highlight',
                        )}
                      >
                        <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500">{metric.label}</div>
                        <div className={cn('mt-2.5 text-[clamp(1.64rem,2.4vw,2.18rem)] font-semibold tracking-[-0.05em]', heroMetricClass[metric.tone])}>
                          {metric.value}
                        </div>
                        <div className="mt-1 text-[13px] text-zinc-500">{metric.note}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <Card className="hero-brief motion-enter motion-delay-4 motion-from-right overflow-hidden border-zinc-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.97),rgba(241,245,249,0.94))]">
                  <div key={`release-lens-${selectedNodeId}`} className="panel-swap">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="section-kicker">Release Lens</div>
                          <CardTitle className="mt-2.5 text-[1.48rem] tracking-[-0.04em]">{selectedNode?.data.title}</CardTitle>
                          <CardDescription className="mt-2.5 max-w-[32ch] leading-6">
                            当前聚焦节点位于发布决策中心，右侧参数台与下方风险面板同步围绕它展开。
                          </CardDescription>
                        </div>
                        <Badge variant="outline" className={cn('bg-white/84', selectedTone.text)}>
                          {selectedNode?.data.category}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-0">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="brief-stat rounded-[20px] border border-zinc-200/80 px-4 py-3.5">
                          <div className="section-kicker">traffic split</div>
                          <div className="mt-2.5 text-[1.78rem] font-semibold tracking-[-0.05em] text-zinc-950">{consoleSnapshot.split.value}</div>
                          <div className="mt-1 text-[13px] text-zinc-500">{consoleSnapshot.split.note}</div>
                        </div>
                        <div className="brief-stat rounded-[20px] border border-[rgba(222,208,179,0.78)] bg-[linear-gradient(180deg,rgba(255,255,255,0.97),rgba(245,241,232,0.92))] px-4 py-3.5">
                          <div className="section-kicker text-[#8a6a33]">guardrail</div>
                          <div className="mt-2.5 text-[1.78rem] font-semibold tracking-[-0.05em] text-zinc-950">{consoleSnapshot.guardrail.value}</div>
                          <div className="mt-1 text-[13px] text-zinc-600">{consoleSnapshot.guardrail.note}</div>
                        </div>
                      </div>

                      <div className="space-y-2 rounded-[22px] border border-zinc-200/80 bg-white/84 p-3">
                        {consoleSnapshot.statusChips.map((chip) => (
                          <div key={chip.id} className="flex items-center justify-between gap-3 rounded-[16px] border border-zinc-200/65 bg-[rgba(248,250,252,0.94)] px-3 py-2.5">
                            <div className="flex items-center gap-2 text-[13px] text-zinc-600">
                              <span className={cn('status-dot', toneDotClass[chip.tone])} />
                              {chip.label}
                            </div>
                            <ArrowRight className="h-3.5 w-3.5 text-zinc-300" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </div>
            </section>

            <section className="px-4 pb-5 md:px-6 md:pb-7">
              <div className="control-strip motion-enter motion-delay-5 motion-shift-lg grid gap-3 rounded-[24px] border border-zinc-200/80 px-4 py-3.5 md:px-5 md:py-4.5 xl:grid-cols-[minmax(0,1.35fr)_repeat(3,minmax(0,0.7fr))]">
                <div className="min-w-0">
                  <div className="section-kicker">Current Scope</div>
                  <div className="mt-2.5 text-[1.34rem] font-semibold tracking-[-0.04em] text-zinc-950">{consoleSnapshot.workspace.title}</div>
                  <p className="mt-2 max-w-[68ch] text-[13px] leading-6 text-zinc-600">{consoleSnapshot.workspace.description}</p>
                </div>

                <div className="strip-stat rounded-[20px] border border-zinc-200/70 px-4 py-3.5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="section-kicker">Traffic</div>
                      <div className="mt-2 text-[1.7rem] font-semibold tracking-[-0.04em] text-zinc-950">{consoleSnapshot.split.value}</div>
                      <div className="mt-1 text-[13px] text-zinc-500">双分支稳定对照</div>
                    </div>
                    <FlaskConical className="h-5 w-5 text-zinc-500" />
                  </div>
                </div>

                <div className="strip-stat rounded-[20px] border border-zinc-200/70 px-4 py-3.5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="section-kicker">Guardrail</div>
                      <div className="mt-2 text-[1.7rem] font-semibold tracking-[-0.04em] text-zinc-950">{consoleSnapshot.guardrail.value}</div>
                      <div className="mt-1 text-[13px] text-zinc-500">收益仍处于安全区</div>
                    </div>
                    <Radar className="h-5 w-5 text-[#8a6a33]" />
                  </div>
                </div>

                <div className="strip-stat rounded-[20px] border border-zinc-200/70 px-4 py-3.5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="section-kicker">Workspace</div>
                      <div className="mt-2 text-[1.7rem] font-semibold tracking-[-0.04em] text-zinc-950">{consoleSnapshot.workspace.activeRailLabel}</div>
                      <div className="mt-1 text-[13px] text-zinc-500">从链路切到监控无需跳页</div>
                    </div>
                    <ChartNoAxesColumn className="h-5 w-5 text-zinc-500" />
                  </div>
                </div>
              </div>
            </section>

            <main className="grid gap-4 px-4 pb-6 md:px-6 md:pb-8 xl:grid-cols-[minmax(0,1.5fr)_372px] xl:items-start">
              <section className="space-y-4">
                <div className="workspace-panel motion-enter motion-delay-6 motion-shift-lg overflow-hidden rounded-[28px] border border-zinc-200/80 bg-[rgba(248,250,252,0.92)]">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200/70 px-4 py-3 md:px-5">
                    <div>
                      <div className="section-kicker">Experiment Graph</div>
                      <div className="mt-1 text-sm font-medium text-zinc-800 md:text-[15px]">主链路编排视图</div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="micro-chip">
                        <ZoomIn className="h-3.5 w-3.5" /> drag / zoom / inspect
                      </div>
                      <div className="micro-chip">
                        <span className="status-dot bg-emerald-500" /> flow healthy
                      </div>
                    </div>
                  </div>

                  <div className="workspace-frame motion-sheen relative h-[640px] overflow-hidden md:h-[760px] xl:h-[840px]">
                    <div className="absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top,rgba(100,116,139,0.14),transparent_72%)]" />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.58),rgba(255,255,255,0.08)_34%,rgba(237,242,247,0.82))]" />
                    <div className="console-grid absolute inset-0 opacity-80" />

                    <ReactFlow
                      nodes={nodes}
                      edges={edges}
                      nodeTypes={nodeTypes}
                      onNodesChange={onNodesChange}
                      onEdgesChange={onEdgesChange}
                      onNodeClick={(_, node) => handleNodeSelect(node.id)}
                      onPaneClick={() => handleNodeSelect(selectedNodeId)}
                      onConnect={handleConnect}
                      fitView
                      fitViewOptions={{ padding: 0.3, minZoom: 0.48 }}
                      minZoom={0.45}
                      maxZoom={1.35}
                      proOptions={{ hideAttribution: true }}
                      defaultEdgeOptions={{ type: 'smoothstep' }}
                      className="bg-transparent"
                    >
                      <Background variant={BackgroundVariant.Lines} gap={84} size={1} color="rgba(100, 116, 139, 0.11)" />
                      <Background id="dots" variant={BackgroundVariant.Dots} gap={20} size={1.05} color="rgba(148, 163, 184, 0.18)" />
                      <Controls showInteractive={false} />

                      <Panel position="top-left">
                        <Card className="flow-overlay-card motion-enter motion-delay-8 motion-from-left w-[calc(100vw-4rem)] max-w-[340px] border-zinc-200/80 bg-white/90 backdrop-blur-sm">
                          <CardHeader className="pb-2.5">
                            <div className="section-kicker">Flow Brief</div>
                            <CardTitle className="mt-2 text-[1.22rem] tracking-[-0.04em]">首页推荐主链路</CardTitle>
                            <CardDescription className="mt-2 text-[13px] leading-6">
                              当前视图强调召回底座、精排和 AB 分流的依赖关系，点击任意节点即可联动右侧参数台。
                            </CardDescription>
                          </CardHeader>
                        </Card>
                      </Panel>

                      <Panel position="bottom-left">
                        <div key={`selected-chip-${selectedNodeId}`} className="panel-swap">
                          <div className="micro-chip bg-white/80 backdrop-blur-sm">
                            <span className="status-dot bg-amber-400" /> selected: {selectedNode?.data.subtitle}
                          </div>
                        </div>
                      </Panel>
                    </ReactFlow>
                  </div>
                </div>

                <Card className="side-card ops-overview-card motion-enter motion-delay-8 motion-shift-sm border-zinc-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(241,245,249,0.96))]">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="section-kicker">Ops Overview</div>
                        <CardTitle className="mt-2 text-[1.08rem] tracking-[-0.03em] text-zinc-950">运行状态与放量观察</CardTitle>
                        <CardDescription className="mt-2 max-w-[62ch] text-[13px] leading-6 text-zinc-700">
                          用更强的层级把运行面、风险面和放量决策拆开，避免整块信息都糊在同一层浅灰里。
                        </CardDescription>
                      </div>
                      <div className="ops-overview-badge">
                        <span className="status-dot bg-amber-400" /> 3 lanes live
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="grid gap-4 pt-1 xl:grid-cols-3">
                    <section className={cn('space-y-3', opsSectionClass.runtime)}>
                      <div className="ops-section-head">
                        <div>
                          <div className="section-kicker">Runtime Desk</div>
                          <div className="mt-1 text-sm font-semibold text-zinc-950">Flow Health</div>
                        </div>
                        <div className="ops-section-icon">
                          <Activity className="h-4 w-4" />
                        </div>
                      </div>
                      {consoleSnapshot.runtimeCards.map((card) => (
                        <div key={card.id} className={cn('rounded-[18px] border px-3.5 py-3 shadow-[0_12px_26px_rgba(15,23,42,0.06)]', riskCardClass[card.tone])}>
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-[13px] font-semibold text-zinc-950">{card.title}</span>
                            <span className={cn('rounded-full border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em]', toneBadgeClass[card.tone])}>
                              {card.eyebrow}
                            </span>
                          </div>
                          <div className="mt-2 divide-y divide-zinc-200/80 rounded-[14px] border border-white/70 bg-white/84">
                            {card.lines.map((line) => (
                              <div key={line.label} className="flex items-center justify-between gap-3 px-3 py-2.5 text-[13px]">
                                <span className="text-zinc-700">{line.label}</span>
                                <span className="font-semibold text-zinc-950">{line.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </section>

                    <section className={cn('space-y-3', opsSectionClass.risk)}>
                      <div className="ops-section-head">
                        <div>
                          <div className="section-kicker">Risk Ledger</div>
                          <div className="mt-1 text-sm font-semibold text-zinc-950">实验风险面板</div>
                        </div>
                        <div className="ops-section-icon">
                          <AlertTriangle className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        {consoleSnapshot.riskSignals.map((signal) => (
                          <div key={signal.id} className={cn('rounded-[18px] border px-3.5 py-3 shadow-[0_12px_26px_rgba(15,23,42,0.06)]', riskCardClass[signal.tone])}>
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="text-[13px] font-semibold text-zinc-950">{signal.label}</div>
                                <div className="mt-1 text-[12px] leading-5 text-zinc-700">{signal.detail}</div>
                              </div>
                              <div className={cn('rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em]', toneBadgeClass[signal.tone])}>
                                {signal.value}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section className={cn('space-y-3', opsSectionClass.release)}>
                      <div className="ops-section-head">
                        <div>
                          <div className="section-kicker">Release Timeline</div>
                          <div className="mt-1 text-sm font-semibold text-zinc-950">放量决策时间线</div>
                        </div>
                        <div className="ops-section-icon">
                          <TimerReset className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        {consoleSnapshot.timeline.map((step) => (
                          <div key={step.id} className="timeline-row ops-timeline-row flex items-start gap-3 rounded-[18px] px-3 py-3">
                            <div className={cn('mt-1 h-2.5 w-2.5 rounded-full shadow-[0_0_0_4px_rgba(255,255,255,0.88)]', toneDotClass[step.tone])} />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-3">
                                <span className="text-[13px] font-semibold text-zinc-950">{step.label}</span>
                                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-700">{step.time}</span>
                              </div>
                              <div className="mt-2">
                                <span className={cn('inline-flex rounded-full border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em]', timelineStatusClass[step.tone])}>
                                  {step.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  </CardContent>
                </Card>
              </section>

              <aside className="space-y-4">
                <Card className="side-card motion-enter motion-delay-7 motion-from-right border-zinc-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.97),rgba(241,245,249,0.94))]">
                  <div key={`parameter-console-${selectedNodeId}`} className="panel-swap">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="section-kicker">Parameter Console</div>
                          <CardTitle className="mt-2 text-[1.28rem] tracking-[-0.04em]">{selectedNode?.data.title}</CardTitle>
                          <CardDescription className="mt-2 text-[13px] leading-6">{selectedNode?.data.description}</CardDescription>
                        </div>
                        <Badge variant="outline" className={cn('bg-white/84', selectedTone.text)}>
                          {selectedNode?.data.category}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-0">
                      <div className="rounded-[20px] border border-zinc-200/80 bg-[rgba(249,250,252,0.92)] px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">Selected Stage</div>
                            <div className="mt-2 text-sm font-medium text-zinc-900">{selectedNode?.data.subtitle}</div>
                          </div>
                          <Badge variant={selectedNode?.data.badgeTone ?? 'default'}>{selectedNode?.data.badge ?? 'node'}</Badge>
                        </div>
                      </div>

                      {selectedNode?.data.params.map((param) => (
                        <div key={param.key} className="rounded-[20px] border border-zinc-200/80 bg-[rgba(249,251,253,0.92)] px-4 py-3.5">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">{param.label}</div>
                              <div className="mt-2 text-sm font-medium text-zinc-900">
                                {param.kind === 'range' && typeof param.value === 'number' ? `${param.value}${param.suffix ?? ''}` : `${param.value}`}
                              </div>
                            </div>
                            {param.kind === 'number' ? (
                              <div className="flex gap-1.5">
                                <Button variant="outline" size="sm" onClick={() => stepParam(param, 'down')}>
                                  -
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => stepParam(param, 'up')}>
                                  +
                                </Button>
                              </div>
                            ) : null}
                          </div>

                          <div className="mt-3">
                            {param.kind === 'text' ? <Input value={String(param.value)} onChange={(event) => updateParam(param.key, event.target.value)} /> : null}

                            {param.kind === 'number' ? (
                              <Input
                                type="number"
                                value={Number(param.value)}
                                min={param.min}
                                max={param.max}
                                step={param.step}
                                onChange={(event) => updateParam(param.key, Number(event.target.value))}
                              />
                            ) : null}

                            {param.kind === 'range' && typeof param.value === 'number' ? (
                              <Slider min={param.min} max={param.max} step={param.step} value={[param.value]} onValueChange={([value]) => updateParam(param.key, value)} />
                            ) : null}
                          </div>
                        </div>
                      ))}

                      <Separator />

                      <div className="grid grid-cols-2 gap-2">
                        {selectedNode?.data.stats.map((stat) => (
                        <div key={stat.label} className="brief-stat rounded-[18px] border border-zinc-200/80 px-3.5 py-3">
                          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">{stat.label}</div>
                          <div className="mt-2 text-base font-semibold text-zinc-900">{stat.value}</div>
                        </div>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="justify-between gap-3">
                      <Button variant="outline" className="flex-1" onClick={resetSelectedNode}>
                        重置
                      </Button>
                      <Button className="flex-1" onClick={saveSelectedNode}>
                        应用
                      </Button>
                    </CardFooter>
                  </div>
                </Card>
              </aside>
            </main>
          </div>
        </div>
      </div>
    </ReactFlowProvider>
  )
}

export default App
