"use client"

import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Process } from "@/lib/types"

interface ProcessTableProps {
  processes: Process[]
  onDelete: (id: number) => void
  showPriority?: boolean // Added prop to conditionally show priority column
}

export default function ProcessTable({ processes, onDelete, showPriority = true }: ProcessTableProps) {
  if (processes.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No processes added yet. Add a process to get started.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4 font-semibold">Process ID</th>
            <th className="text-left py-3 px-4 font-semibold">Arrival Time</th>
            <th className="text-left py-3 px-4 font-semibold">Burst Time</th>
            {showPriority && <th className="text-left py-3 px-4 font-semibold">Priority</th>}
            <th className="text-right py-3 px-4 font-semibold">Action</th>
          </tr>
        </thead>
        <tbody>
          {processes.map((process) => (
            <tr key={process.id} className="border-b last:border-0 hover:bg-muted/50">
              <td className="py-3 px-4 font-mono">P{process.id}</td>
              <td className="py-3 px-4">{process.arrivalTime}</td>
              <td className="py-3 px-4">{process.burstTime}</td>
              {showPriority && <td className="py-3 px-4">{process.priority}</td>}
              <td className="py-3 px-4 text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(process.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
