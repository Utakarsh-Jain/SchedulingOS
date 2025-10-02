export interface Process {
  id: number
  arrivalTime: number
  burstTime: number
  priority: number
}

export interface TimelineEntry {
  processId: number
  start: number
  end: number
}

export interface ProcessMetrics {
  processId: number
  arrivalTime: number
  burstTime: number
  completionTime: number
  turnaroundTime: number
  waitingTime: number
  responseTime: number
}

export interface Metrics {
  avgWaitingTime: number
  avgTurnaroundTime: number
  avgResponseTime: number
  cpuUtilization: number
}

export interface SchedulingResult {
  timeline: TimelineEntry[]
  processMetrics: ProcessMetrics[]
  metrics: Metrics
}
