import { NextRequest, NextResponse } from 'next/server'
import { getError, updateError, deleteError } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const error = await getError(params.id)
    
    if (!error?.id) {
      return NextResponse.json(
        { error: 'Error not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(error)
  } catch (error) {
    console.error('Error fetching error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updates = await request.json()
    await updateError(params.id, updates)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await deleteError(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}