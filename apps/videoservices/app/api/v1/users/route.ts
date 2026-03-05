import { NextResponse } from 'next/server';
import { mockDatabase } from '../../../../lib/mock/data';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    const users = search
        ? mockDatabase.users.search(search)
        : mockDatabase.users.getAll();

    return NextResponse.json({ users });
}
