import { NextRequest, NextResponse } from 'next/server';
import db from '../../../lib/database';

export async function GET() {
  try {
    const accounts = db.prepare('SELECT * FROM accounts').all();
    return NextResponse.json(accounts);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accountId, principalPersonId, spousePersonId, accountNumber, status, clientName, accessLevelId } = body;

    const stmt = db.prepare(`
      INSERT INTO accounts (accountId, principalPersonId, spousePersonId, accountNumber, status, clientName, accessLevelId, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(accountId, principalPersonId, spousePersonId || null, accountNumber, status, clientName, accessLevelId, new Date().toISOString(), new Date().toISOString());

    return NextResponse.json({ message: 'Account created' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }
}