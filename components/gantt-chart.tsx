import type { TimelineEntry } from "@/lib/types"

interface GanttChartProps {
  timeline: TimelineEntry[]
}

const COLORS = ["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5"]

export default function GanttChart({ timeline }: GanttChartProps) {
  const maxTime = timeline.length > 0 ? timeline[timeline.length - 1].end : 0
  const processColors = new Map<number, string>()

  timeline.forEach((entry) => {
    if (!processColors.has(entry.processId)) {
      processColors.set(entry.processId, COLORS[processColors.size % COLORS.length])
    }
  })

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="flex border rounded-lg overflow-hidden" style={{ minHeight: "80px" }}>
          {timeline.map((entry, index) => {
            const width = ((entry.end - entry.start) / maxTime) * 100
            const color = processColors.get(entry.processId)

            return (
              <div
                key={index}
                className={`${color} border-r last:border-r-0 flex items-center justify-center relative group`}
                style={{ width: `${width}%` }}
              >
                <span className="font-mono font-semibold text-sm text-primary-foreground">P{entry.processId}</span>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </div>
            )
          })}
        </div>

        <div className="flex mt-2">
          {timeline.map((entry, index) => {
            const width = ((entry.end - entry.start) / maxTime) * 100

            return (
              <div key={index} className="text-xs text-muted-foreground relative" style={{ width: `${width}%` }}>
                <span className="absolute left-0">{entry.start}</span>
                {index === timeline.length - 1 && <span className="absolute right-0">{entry.end}</span>}
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 pt-4 border-t">
        {Array.from(processColors.entries()).map(([processId, color]) => (
          <div key={processId} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded ${color}`} />
            <span className="text-sm font-mono">P{processId}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
