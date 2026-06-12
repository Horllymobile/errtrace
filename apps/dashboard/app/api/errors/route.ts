import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { saveError, getErrors } from '@/lib/db'

// POST /api/errors - Log a new error
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      message,
      stack_trace,
      level = 'error',
      environment = 'production',
      url,
      user_agent,
      metadata = {}
    } = body

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    const id = uuidv4()
    const ip_address = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown'

    const error = {
      id,
      message,
      stack_trace: stack_trace || '',
      level,
      environment,
      url: url || '',
      user_agent: user_agent || '',
      ip_address,
      metadata: JSON.stringify(metadata),
      created_at: new Date().toISOString(),
      resolved: 0
    }

    await saveError(error)

    return NextResponse.json(
      {
        success: true,
        error_id: id,
        message: 'Error logged successfully'
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error logging error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/errors - List errors
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const level = searchParams.get('level') || undefined
    const resolved = searchParams.get('resolved') || undefined
    const search = searchParams.get('search') || undefined

    const result = await getErrors({ limit, offset, level, resolved, search })
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching errors:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-ErrTrace-Key',
      'Access-Control-Max-Age': '86400',
    },
  });
}