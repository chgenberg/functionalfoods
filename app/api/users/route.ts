import { NextResponse } from 'next/server';

// Simulerad databas
const users = [
  { id: '1', name: 'Anna Andersson', email: 'anna@example.com' },
  { id: '2', name: 'Erik Svensson', email: 'erik@example.com' },
];

export async function GET() {
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newUser = {
      id: String(users.length + 1),
      name: body.name,
      email: body.email,
    };
    users.push(newUser);
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Kunde inte skapa användare' },
      { status: 400 }
    );
  }
} 