import type { Process, SchedulingResult, TimelineEntry, ProcessMetrics } from "./types"

export function calculateScheduling(processes: Process[], algorithm: string, timeQuantum = 2): SchedulingResult {
  switch (algorithm) {
    case "fcfs":
      return fcfs(processes)
    case "sjf":
      return sjf(processes)
    case "srtf":
      return srtf(processes)
    case "rr":
      return roundRobin(processes, timeQuantum)
    case "priority":
      return priorityScheduling(processes, false)
    case "priority-preemptive":
      return priorityScheduling(processes, true)
    default:
      return fcfs(processes)
  }
}

function fcfs(processes: Process[]): SchedulingResult {
  const sorted = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime)
  const timeline: TimelineEntry[] = []
  const processMetrics: ProcessMetrics[] = []

  let currentTime = 0

  sorted.forEach((process) => {
    if (currentTime < process.arrivalTime) {
      currentTime = process.arrivalTime
    }

    const startTime = currentTime
    const completionTime = currentTime + process.burstTime

    timeline.push({
      processId: process.id,
      start: startTime,
      end: completionTime,
    })

    const turnaroundTime = completionTime - process.arrivalTime
    const waitingTime = turnaroundTime - process.burstTime

    processMetrics.push({
      processId: process.id,
      arrivalTime: process.arrivalTime,
      burstTime: process.burstTime,
      completionTime,
      turnaroundTime,
      waitingTime,
      responseTime: waitingTime,
    })

    currentTime = completionTime
  })

  return {
    timeline,
    processMetrics,
    metrics: calculateMetrics(processMetrics, currentTime),
  }
}

function sjf(processes: Process[]): SchedulingResult {
  const timeline: TimelineEntry[] = []
  const processMetrics: ProcessMetrics[] = []
  const remaining = [...processes]

  let currentTime = 0

  while (remaining.length > 0) {
    const available = remaining.filter((p) => p.arrivalTime <= currentTime)

    if (available.length === 0) {
      currentTime = Math.min(...remaining.map((p) => p.arrivalTime))
      continue
    }

    const shortest = available.reduce((min, p) => (p.burstTime < min.burstTime ? p : min))

    const startTime = currentTime
    const completionTime = currentTime + shortest.burstTime

    timeline.push({
      processId: shortest.id,
      start: startTime,
      end: completionTime,
    })

    const turnaroundTime = completionTime - shortest.arrivalTime
    const waitingTime = turnaroundTime - shortest.burstTime

    processMetrics.push({
      processId: shortest.id,
      arrivalTime: shortest.arrivalTime,
      burstTime: shortest.burstTime,
      completionTime,
      turnaroundTime,
      waitingTime,
      responseTime: waitingTime,
    })

    currentTime = completionTime
    remaining.splice(remaining.indexOf(shortest), 1)
  }

  return {
    timeline,
    processMetrics,
    metrics: calculateMetrics(processMetrics, currentTime),
  }
}

function srtf(processes: Process[]): SchedulingResult {
  const timeline: TimelineEntry[] = []
  const processMetrics: ProcessMetrics[] = []

  const remaining = processes.map((p) => ({
    ...p,
    remainingTime: p.burstTime,
    startTime: -1,
  }))

  let currentTime = 0
  const maxTime = Math.max(...processes.map((p) => p.arrivalTime + p.burstTime)) * 2

  while (remaining.some((p) => p.remainingTime > 0) && currentTime < maxTime) {
    const available = remaining.filter((p) => p.arrivalTime <= currentTime && p.remainingTime > 0)

    if (available.length === 0) {
      currentTime++
      continue
    }

    const shortest = available.reduce((min, p) => (p.remainingTime < min.remainingTime ? p : min))

    if (shortest.startTime === -1) {
      shortest.startTime = currentTime
    }

    const lastEntry = timeline[timeline.length - 1]
    if (lastEntry && lastEntry.processId === shortest.id) {
      lastEntry.end = currentTime + 1
    } else {
      timeline.push({
        processId: shortest.id,
        start: currentTime,
        end: currentTime + 1,
      })
    }

    shortest.remainingTime--
    currentTime++

    if (shortest.remainingTime === 0) {
      const turnaroundTime = currentTime - shortest.arrivalTime
      const waitingTime = turnaroundTime - shortest.burstTime

      processMetrics.push({
        processId: shortest.id,
        arrivalTime: shortest.arrivalTime,
        burstTime: shortest.burstTime,
        completionTime: currentTime,
        turnaroundTime,
        waitingTime,
        responseTime: shortest.startTime - shortest.arrivalTime,
      })
    }
  }

  return {
    timeline,
    processMetrics,
    metrics: calculateMetrics(processMetrics, currentTime),
  }
}

function roundRobin(processes: Process[], timeQuantum: number): SchedulingResult {
  const timeline: TimelineEntry[] = []
  const processMetrics: ProcessMetrics[] = []

  const queue = processes
    .map((p) => ({
      ...p,
      remainingTime: p.burstTime,
      startTime: -1,
    }))
    .sort((a, b) => a.arrivalTime - b.arrivalTime)

  let currentTime = 0
  const readyQueue: typeof queue = []
  let index = 0

  while (queue.some((p) => p.remainingTime > 0)) {
    while (index < queue.length && queue[index].arrivalTime <= currentTime) {
      if (queue[index].remainingTime > 0) {
        readyQueue.push(queue[index])
      }
      index++
    }

    if (readyQueue.length === 0) {
      currentTime = queue[index]?.arrivalTime || currentTime + 1
      continue
    }

    const process = readyQueue.shift()!

    if (process.startTime === -1) {
      process.startTime = currentTime
    }

    const executeTime = Math.min(timeQuantum, process.remainingTime)

    timeline.push({
      processId: process.id,
      start: currentTime,
      end: currentTime + executeTime,
    })

    process.remainingTime -= executeTime
    currentTime += executeTime

    while (index < queue.length && queue[index].arrivalTime <= currentTime) {
      if (queue[index].remainingTime > 0) {
        readyQueue.push(queue[index])
      }
      index++
    }

    if (process.remainingTime > 0) {
      readyQueue.push(process)
    } else {
      const turnaroundTime = currentTime - process.arrivalTime
      const waitingTime = turnaroundTime - process.burstTime

      processMetrics.push({
        processId: process.id,
        arrivalTime: process.arrivalTime,
        burstTime: process.burstTime,
        completionTime: currentTime,
        turnaroundTime,
        waitingTime,
        responseTime: process.startTime - process.arrivalTime,
      })
    }
  }

  return {
    timeline,
    processMetrics,
    metrics: calculateMetrics(processMetrics, currentTime),
  }
}

function priorityScheduling(processes: Process[], preemptive: boolean): SchedulingResult {
  if (!preemptive) {
    const timeline: TimelineEntry[] = []
    const processMetrics: ProcessMetrics[] = []
    const remaining = [...processes]

    let currentTime = 0

    while (remaining.length > 0) {
      const available = remaining.filter((p) => p.arrivalTime <= currentTime)

      if (available.length === 0) {
        currentTime = Math.min(...remaining.map((p) => p.arrivalTime))
        continue
      }

      const highest = available.reduce((max, p) => (p.priority < max.priority ? p : max))

      const startTime = currentTime
      const completionTime = currentTime + highest.burstTime

      timeline.push({
        processId: highest.id,
        start: startTime,
        end: completionTime,
      })

      const turnaroundTime = completionTime - highest.arrivalTime
      const waitingTime = turnaroundTime - highest.burstTime

      processMetrics.push({
        processId: highest.id,
        arrivalTime: highest.arrivalTime,
        burstTime: highest.burstTime,
        completionTime,
        turnaroundTime,
        waitingTime,
        responseTime: waitingTime,
      })

      currentTime = completionTime
      remaining.splice(remaining.indexOf(highest), 1)
    }

    return {
      timeline,
      processMetrics,
      metrics: calculateMetrics(processMetrics, currentTime),
    }
  } else {
    const timeline: TimelineEntry[] = []
    const processMetrics: ProcessMetrics[] = []

    const remaining = processes.map((p) => ({
      ...p,
      remainingTime: p.burstTime,
      startTime: -1,
    }))

    let currentTime = 0
    const maxTime = Math.max(...processes.map((p) => p.arrivalTime + p.burstTime)) * 2

    while (remaining.some((p) => p.remainingTime > 0) && currentTime < maxTime) {
      const available = remaining.filter((p) => p.arrivalTime <= currentTime && p.remainingTime > 0)

      if (available.length === 0) {
        currentTime++
        continue
      }

      const highest = available.reduce((max, p) => (p.priority < max.priority ? p : max))

      if (highest.startTime === -1) {
        highest.startTime = currentTime
      }

      const lastEntry = timeline[timeline.length - 1]
      if (lastEntry && lastEntry.processId === highest.id) {
        lastEntry.end = currentTime + 1
      } else {
        timeline.push({
          processId: highest.id,
          start: currentTime,
          end: currentTime + 1,
        })
      }

      highest.remainingTime--
      currentTime++

      if (highest.remainingTime === 0) {
        const turnaroundTime = currentTime - highest.arrivalTime
        const waitingTime = turnaroundTime - highest.burstTime

        processMetrics.push({
          processId: highest.id,
          arrivalTime: highest.arrivalTime,
          burstTime: highest.burstTime,
          completionTime: currentTime,
          turnaroundTime,
          waitingTime,
          responseTime: highest.startTime - highest.arrivalTime,
        })
      }
    }

    return {
      timeline,
      processMetrics,
      metrics: calculateMetrics(processMetrics, currentTime),
    }
  }
}

function calculateMetrics(processMetrics: ProcessMetrics[], totalTime: number) {
  const n = processMetrics.length

  return {
    avgWaitingTime: processMetrics.reduce((sum, p) => sum + p.waitingTime, 0) / n,
    avgTurnaroundTime: processMetrics.reduce((sum, p) => sum + p.turnaroundTime, 0) / n,
    avgResponseTime: processMetrics.reduce((sum, p) => sum + p.responseTime, 0) / n,
    cpuUtilization: (processMetrics.reduce((sum, p) => sum + p.burstTime, 0) / totalTime) * 100,
  }
}
