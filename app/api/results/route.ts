
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const resultsFilePath = path.resolve(process.cwd(), 'app/api/results/results.json');

export async function GET() {
  try {
    const resultsData = fs.readFileSync(resultsFilePath, 'utf-8');
    const results = JSON.parse(resultsData);
    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json({ message: 'Error reading results' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const newResult = await req.json();
    const resultsData = fs.readFileSync(resultsFilePath, 'utf-8');
    const results = JSON.parse(resultsData);
    results.push(newResult);
    fs.writeFileSync(resultsFilePath, JSON.stringify(results, null, 2));
    return NextResponse.json(newResult, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Error writing result' }, { status: 500 });
  }
}
