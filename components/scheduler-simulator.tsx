"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Play, RotateCcw } from "lucide-react"
import GanttChart from "@/components/gantt-chart"
import MetricsDisplay from "@/components/metrics-display"
import ProcessTable from "@/components/process-table"
import { calculateScheduling } from "@/lib/scheduling-algorithms"
import type { Process, SchedulingResult } from "@/lib/types"

export default function SchedulerSimulator() {
  const [processes, setProcesses] = useState<Process[]>([
    { id: 1, arrivalTime: 0, burstTime: 5, priority: 2 },
    { id: 2, arrivalTime: 1, burstTime: 3, priority: 1 },
    { id: 3, arrivalTime: 2, burstTime: 8, priority: 3 },
  ])
  const [algorithm, setAlgorithm] = useState<string>("fcfs")
  const [timeQuantum, setTimeQuantum] = useState<number>(2)
  const [result, setResult] = useState<SchedulingResult | null>(null)
  const [newProcess, setNewProcess] = useState({
    arrivalTime: 0,
    burstTime: 1,
    priority: 1,
  })

  const addProcess = () => {
    const newId = processes.length > 0 ? Math.max(...processes.map((p) => p.id)) + 1 : 1
    setProcesses([
      ...processes,
      {
        id: newId,
        arrivalTime: newProcess.arrivalTime,
        burstTime: newProcess.burstTime,
        priority: newProcess.priority,
      },
    ])
    setNewProcess({ arrivalTime: 0, burstTime: 1, priority: 1 })
  }

  const deleteProcess = (id: number) => {
    setProcesses(processes.filter((p) => p.id !== id))
  }

  const runSimulation = () => {
    if (processes.length === 0) return
    const schedulingResult = calculateScheduling(processes, algorithm, timeQuantum)
    setResult(schedulingResult)
  }

  const reset = () => {
    setProcesses([
      { id: 1, arrivalTime: 0, burstTime: 5, priority: 2 },
      { id: 2, arrivalTime: 1, burstTime: 3, priority: 1 },
      { id: 3, arrivalTime: 2, burstTime: 8, priority: 3 },
    ])
    setResult(null)
    setAlgorithm("fcfs")
    setTimeQuantum(2)
  }

  const needsPriority = algorithm === "priority" || algorithm === "priority-preemptive"

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-balance">CPU Scheduling Algorithm Simulator</h1>
        <p className="text-muted-foreground text-lg">Visualize and compare different OS scheduling algorithms</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-1">
          <h2 className="text-xl font-semibold mb-4">Configuration</h2>

          <div className="space-y-4">
            <div>
              <Label htmlFor="algorithm">Scheduling Algorithm</Label>
              <Select value={algorithm} onValueChange={setAlgorithm}>
                <SelectTrigger id="algorithm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fcfs">First Come First Serve (FCFS)</SelectItem>
                  <SelectItem value="sjf">Shortest Job First (SJF)</SelectItem>
                  <SelectItem value="srtf">Shortest Remaining Time First (SRTF)</SelectItem>
                  <SelectItem value="rr">Round Robin (RR)</SelectItem>
                  <SelectItem value="priority">Priority Scheduling</SelectItem>
                  <SelectItem value="priority-preemptive">Priority (Preemptive)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {algorithm === "rr" && (
              <div>
                <Label htmlFor="quantum">Time Quantum</Label>
                <Input
                  id="quantum"
                  type="number"
                  min="1"
                  value={timeQuantum}
                  onChange={(e) => setTimeQuantum(Number.parseInt(e.target.value) || 1)}
                />
              </div>
            )}

            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-3">Add Process</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="arrival">Arrival Time</Label>
                  <Input
                    id="arrival"
                    type="number"
                    min="0"
                    value={newProcess.arrivalTime}
                    onChange={(e) =>
                      setNewProcess({ ...newProcess, arrivalTime: Number.parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="burst">Burst Time</Label>
                  <Input
                    id="burst"
                    type="number"
                    min="1"
                    value={newProcess.burstTime}
                    onChange={(e) => setNewProcess({ ...newProcess, burstTime: Number.parseInt(e.target.value) || 1 })}
                  />
                </div>
                {needsPriority && (
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Input
                      id="priority"
                      type="number"
                      min="1"
                      value={newProcess.priority}
                      onChange={(e) => setNewProcess({ ...newProcess, priority: Number.parseInt(e.target.value) || 1 })}
                    />
                  </div>
                )}
                <Button onClick={addProcess} className="w-full" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Process
                </Button>
              </div>
            </div>

            <div className="pt-4 border-t space-y-2">
              <Button onClick={runSimulation} className="w-full" disabled={processes.length === 0}>
                <Play className="w-4 h-4 mr-2" />
                Run Simulation
              </Button>
              <Button onClick={reset} variant="outline" className="w-full bg-transparent">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Process Queue</h2>
            <ProcessTable processes={processes} onDelete={deleteProcess} showPriority={needsPriority} />
          </Card>

          {result && (
            <>
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Gantt Chart</h2>
                <GanttChart timeline={result.timeline} />
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Performance Metrics</h2>
                <MetricsDisplay metrics={result.metrics} processes={result.processMetrics} />
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
