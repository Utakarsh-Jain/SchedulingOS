"use client"

import { useState, useEffect } from "react"
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

interface StoredSchedulingResult extends SchedulingResult {
  processes: Process[];
  algorithm: string;
  timeQuantum?: number;
}

export default function SchedulerSimulator() {
  const [processes, setProcesses] = useState<Process[]>([])
  const [algorithm, setAlgorithm] = useState<string>("fcfs")
  const [timeQuantum, setTimeQuantum] = useState<number>(2)
  const [results, setResults] = useState<StoredSchedulingResult[]>([])
  const [newProcess, setNewProcess] = useState({
    arrivalTime: "0",
    burstTime: "1",
    priority: "1",
  })

  useEffect(() => {
    const fetchProcesses = async () => {
      const res = await fetch('/api/processes');
      const data = await res.json();
      setProcesses(data);
    };
    fetchProcesses();
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      const res = await fetch('/api/results');
      const data = await res.json();
      setResults(data);
    };
    fetchResults();
  }, []);

  const addProcess = async () => {
    const newId = processes.length > 0 ? Math.max(...processes.map((p) => p.id)) + 1 : 1
    const processToAdd = {
        id: newId,
        arrivalTime: Number(newProcess.arrivalTime),
        burstTime: Number(newProcess.burstTime),
        priority: Number(newProcess.priority),
    };
    const res = await fetch('/api/processes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(processToAdd),
    });
    const addedProcess = await res.json();
    setProcesses([...processes, addedProcess]);
    setNewProcess({ arrivalTime: "0", burstTime: "1", priority: "1" });
  }

  const deleteProcess = (id: number) => {
    setProcesses(processes.filter((p) => p.id !== id))
  }

  const runSimulation = async () => {
    if (processes.length === 0) return
    const schedulingResult = calculateScheduling(processes, algorithm, timeQuantum)
    const resultToStore: StoredSchedulingResult = {
      ...schedulingResult,
      processes: [...processes],
      algorithm: algorithm,
      ...(algorithm === 'rr' && { timeQuantum: timeQuantum })
    }

    const res = await fetch('/api/results', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(resultToStore),
    });
    const newResult = await res.json();
    setResults([...results, newResult]);
  }

  const reset = () => {
    setProcesses([])
    setResults([])
    setAlgorithm("fcfs")
    setTimeQuantum(2)
  }

  const handleNumericInputChange = (
    field: "arrivalTime" | "burstTime" | "priority",
    value: string
  ) => {
    if (/^\d*$/.test(value)) {
      setNewProcess({ ...newProcess, [field]: value });
    }
  };

  const needsPriority = algorithm === "priority" || algorithm === "priority-preemptive"
  const latestResult = results.length > 0 ? results[results.length - 1] : null;

  const isAddProcessDisabled = 
    newProcess.burstTime === '' || 
    Number(newProcess.burstTime) <= 0 || 
    newProcess.arrivalTime === '' || 
    (needsPriority && (newProcess.priority === '' || Number(newProcess.priority) <= 0));


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
                  type="text"
                  inputMode="numeric"
                  value={timeQuantum}
                  onChange={(e) => {
                    if (/^\d*$/.test(e.target.value)) {
                      setTimeQuantum(Number(e.target.value))
                    }
                  }}
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
                    type="text"
                    inputMode="numeric"
                    value={newProcess.arrivalTime}
                    onChange={(e) => handleNumericInputChange('arrivalTime', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="burst">Burst Time</Label>
                  <Input
                    id="burst"
                    type="text"
                    inputMode="numeric"
                    value={newProcess.burstTime}
                    onChange={(e) => handleNumericInputChange('burstTime', e.target.value)}
                  />
                </div>
                {needsPriority && (
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Input
                      id="priority"
                      type="text"
                      inputMode="numeric"
                      value={newProcess.priority}
                      onChange={(e) => handleNumericInputChange('priority', e.target.value)}
                    />
                  </div>
                )}
                <Button onClick={addProcess} className="w-full" size="sm" disabled={isAddProcessDisabled}>
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

          {latestResult && (
            <>
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Gantt Chart</h2>
                <GanttChart timeline={latestResult.timeline} />
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Performance Metrics</h2>
                <MetricsDisplay metrics={latestResult.metrics} processes={latestResult.processMetrics} />
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
