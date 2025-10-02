import type { Metrics, ProcessMetrics } from "@/lib/types"

interface MetricsDisplayProps {
  metrics: Metrics
  processes: ProcessMetrics[]
}

export default function MetricsDisplay({ metrics, processes }: MetricsDisplayProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-muted">
          <div className="text-sm text-muted-foreground mb-1">Avg Waiting Time</div>
          <div className="text-2xl font-bold font-mono">{metrics.avgWaitingTime.toFixed(2)}</div>
        </div>
        <div className="p-4 rounded-lg bg-muted">
          <div className="text-sm text-muted-foreground mb-1">Avg Turnaround Time</div>
          <div className="text-2xl font-bold font-mono">{metrics.avgTurnaroundTime.toFixed(2)}</div>
        </div>
        <div className="p-4 rounded-lg bg-muted">
          <div className="text-sm text-muted-foreground mb-1">CPU Utilization</div>
          <div className="text-2xl font-bold font-mono">{metrics.cpuUtilization.toFixed(1)}%</div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 font-semibold">Process</th>
              <th className="text-left py-3 px-4 font-semibold">Arrival</th>
              <th className="text-left py-3 px-4 font-semibold">Burst</th>
              <th className="text-left py-3 px-4 font-semibold">Completion</th>
              <th className="text-left py-3 px-4 font-semibold">Turnaround</th>
              <th className="text-left py-3 px-4 font-semibold">Waiting</th>
            </tr>
          </thead>
          <tbody>
            {processes.map((process) => (
              <tr key={process.processId} className="border-b last:border-0 hover:bg-muted/50">
                <td className="py-3 px-4 font-mono font-semibold">P{process.processId}</td>
                <td className="py-3 px-4">{process.arrivalTime}</td>
                <td className="py-3 px-4">{process.burstTime}</td>
                <td className="py-3 px-4">{process.completionTime}</td>
                <td className="py-3 px-4">{process.turnaroundTime}</td>
                <td className="py-3 px-4">{process.waitingTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
