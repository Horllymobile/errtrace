import { NextRequest, NextResponse } from 'next/server'
import { getError, updateError, deleteError } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const error = await getError(id)
    
    if (!error?.id) {
      return NextResponse.json(
        { error: 'Error not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(error)
  } catch (error) {
    console.error('ErrTrace: Error fetching details:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const updates = await request.json()
    await updateError(id, updates)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('ErrTrace: Error updating:', error)
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await deleteError(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('ErrTrace: Error deleting:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}