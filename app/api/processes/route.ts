
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const processesFilePath = path.resolve(process.cwd(), 'app/api/processes/processes.json');

export async function GET() {
  try {
    const processesData = fs.readFileSync(processesFilePath, 'utf-8');
    const processes = JSON.parse(processesData);
    return NextResponse.json(processes);
  } catch (error) {
    return NextResponse.json({ message: 'Error reading processes' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const newProcess = await req.json();
    const processesData = fs.readFileSync(processesFilePath, 'utf-8');
    const processes = JSON.parse(processesData);
    processes.push(newProcess);
    fs.writeFileSync(processesFilePath, JSON.stringify(processes, null, 2));
    return NextResponse.json(newProcess, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Error writing process' }, { status: 500 });
  }
}
