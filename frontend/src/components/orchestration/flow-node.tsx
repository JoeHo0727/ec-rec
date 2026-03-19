import { memo } from 'react'
import { Activity, Brain, Cpu, GitBranch, GitFork, Send, Shield, Sparkles } from 'lucide-react'
import { Handle, Position, type NodeProps } from '@xyflow/react'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { toneStyles, type FlowNodeData } from '@/data/orchestration'

const iconMap = {
  activity: Activity,
  'git-branch': GitBranch,
  sparkles: Sparkles,
  brain: Brain,
  'git-fork': GitFork,
  shield: Shield,
  cpu: Cpu,
  send: Send,
} as const

function FlowNode({ data, selected }: NodeProps) {
  const nodeData = data as FlowNodeData
  const tone = toneStyles[nodeData.tone]
  const Icon = iconMap[nodeData.icon]

  return (
    <div
      className={cn(
        'node-shell group relative rounded-[22px] border transition-all duration-300',
        'bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(242,245,249,0.94))] shadow-[0_22px_44px_rgba(15,23,42,0.08)]',
        nodeData.compact ? 'min-w-[198px] w-max' : 'min-w-[228px] w-max',
        tone.border,
        selected && ['node-selected -translate-y-1 shadow-[0_30px_64px_rgba(15,23,42,0.14)] ring-4', tone.ring],
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!h-3 !w-3 !border-[1.5px] !border-white !bg-white"
        style={{ backgroundColor: 'white', borderColor: tone.handle, left: -7 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!h-3 !w-3 !border-[1.5px] !border-white !bg-white"
        style={{ backgroundColor: 'white', borderColor: tone.handle, right: -7 }}
      />

      <div className="node-surface relative overflow-hidden rounded-[inherit] px-4 pb-3 pt-3">
        <div className={cn('absolute inset-x-0 top-0 h-14 opacity-75', tone.bg)} />
        <div className="absolute inset-x-0 top-0 h-px bg-white/90" />

        <div className="relative flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className={cn('flex h-10 w-10 items-center justify-center rounded-[13px] border border-white/70 shadow-sm', tone.icon)}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="space-y-1">
              <div className="text-[13px] font-semibold tracking-[0.01em] text-zinc-900">{nodeData.title}</div>
              <div className={cn('font-mono text-[10px] uppercase tracking-[0.22em]', tone.text)}>{nodeData.subtitle}</div>
            </div>
          </div>
          {nodeData.badge ? <Badge variant={nodeData.badgeTone ?? 'default'}>{nodeData.badge}</Badge> : null}
        </div>

        <div className="relative mt-3 grid grid-cols-2 gap-1.5 rounded-[16px] border border-white/80 bg-white/78 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.58)]">
          {nodeData.stats.map((stat) => (
            <div key={stat.label} className="rounded-[13px] bg-zinc-50/92 px-2.5 py-2">
              <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-400">{stat.label}</div>
              <div className="mt-1 text-[12px] font-semibold text-zinc-800">{stat.value}</div>
            </div>
          ))}
        </div>
      </div>

      {selected ? (
        <div className="absolute -top-3 left-4 z-10">
          <Badge variant="outline" className="border-white/90 bg-white/95 text-zinc-700 shadow-sm">
            Focused
          </Badge>
        </div>
      ) : null}
    </div>
  )
}

export default memo(FlowNode)
