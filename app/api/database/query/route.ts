import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { isFeatureEnabled } from '@/lib/config'

export async function POST(request: NextRequest) {
  try {
    // Check if database is enabled
    if (!isFeatureEnabled('database')) {
      return NextResponse.json(
        { error: 'Database is disabled' },
        { status: 400 }
      )
    }

    const { table, operation, data, filters } = await request.json()

    if (!table || !operation) {
      return NextResponse.json(
        { error: 'Table and operation are required' },
        { status: 400 }
      )
    }

    let result

    switch (operation) {
      case 'create':
        if (!data) {
          return NextResponse.json(
            { error: 'Data is required for create operation' },
            { status: 400 }
          )
        }
        result = await db.insert(table, data)
        break

      case 'update':
        if (!data.id || !data) {
          return NextResponse.json(
            { error: 'ID and data are required for update operation' },
            { status: 400 }
          )
        }
        const { id, ...updateData } = data
        result = await db.update(table, id, updateData)
        break

      case 'delete':
        if (!data.id) {
          return NextResponse.json(
            { error: 'ID is required for delete operation' },
            { status: 400 }
          )
        }
        await db.delete(table, data.id)
        result = { success: true }
        break

      case 'findById':
        if (!data.id) {
          return NextResponse.json(
            { error: 'ID is required for findById operation' },
            { status: 400 }
          )
        }
        result = await db.findById(table, data.id)
        break

      case 'findMany':
        result = await db.findMany(table, filters)
        break

      default:
        return NextResponse.json(
          { error: 'Invalid operation' },
          { status: 400 }
        )
    }

    return NextResponse.json({ result })
  } catch (error) {
    console.error('Database query error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
