import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { isProviderEnabled } from '@/lib/config'

// GET /api/supabase/files - Get all files
export async function GET(request: NextRequest) {
  try {
    if (!isProviderEnabled('supabase')) {
      return NextResponse.json(
        { error: 'Supabase is not configured' },
        { status: 400 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const folder = searchParams.get('folder') || ''

    let query = supabase.storage
      .from('files')
      .list(folder, {
        limit,
        offset: (page - 1) * limit,
        sortBy: { column: 'created_at', order: 'desc' }
      })

    const { data, error } = await query

    if (error) {
      console.error('Supabase storage error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch files' },
        { status: 500 }
      )
    }

    // Get public URLs for each file
    const filesWithUrls = await Promise.all(
      (data || []).map(async (file) => {
        const { data: urlData } = supabase.storage
          .from('files')
          .getPublicUrl(`${folder}/${file.name}`)
        
        return {
          ...file,
          url: urlData.publicUrl
        }
      })
    )

    return NextResponse.json({
      files: filesWithUrls,
      pagination: {
        page,
        limit,
        // Note: Supabase storage doesn't provide total count
        // You might want to implement a separate counter
      }
    })
  } catch (error) {
    console.error('Files API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/supabase/files - Upload a file
export async function POST(request: NextRequest) {
  try {
    if (!isProviderEnabled('supabase')) {
      return NextResponse.json(
        { error: 'Supabase is not configured' },
        { status: 400 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || 'uploads'
    const userId = formData.get('userId') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `${folder}/${fileName}`

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from('files')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false
      })

    if (error) {
      console.error('Supabase storage error:', error)
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('files')
      .getPublicUrl(filePath)

    // Optionally save file metadata to database
    if (userId) {
      await supabase
        .from('file_uploads')
        .insert({
          user_id: userId,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          file_type: file.type,
          url: urlData.publicUrl,
          created_at: new Date().toISOString()
        })
    }

    return NextResponse.json({
      file: {
        name: file.name,
        path: filePath,
        size: file.size,
        type: file.type,
        url: urlData.publicUrl
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Upload file error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
