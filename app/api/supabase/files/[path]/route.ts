import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { isProviderEnabled } from '@/lib/config'

// GET /api/supabase/files/[path] - Get file by path
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string } }
) {
  try {
    if (!isProviderEnabled('supabase')) {
      return NextResponse.json(
        { error: 'Supabase is not configured' },
        { status: 400 }
      )
    }

    const filePath = decodeURIComponent(params.path)

    // Get file info
    const { data: fileInfo, error: fileError } = await supabase.storage
      .from('files')
      .list(filePath.split('/').slice(0, -1).join('/'), {
        search: filePath.split('/').pop()
      })

    if (fileError || !fileInfo || fileInfo.length === 0) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('files')
      .getPublicUrl(filePath)

    return NextResponse.json({
      file: {
        ...fileInfo[0],
        path: filePath,
        url: urlData.publicUrl
      }
    })
  } catch (error) {
    console.error('Get file error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/supabase/files/[path] - Delete file
export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string } }
) {
  try {
    if (!isProviderEnabled('supabase')) {
      return NextResponse.json(
        { error: 'Supabase is not configured' },
        { status: 400 }
      )
    }

    const filePath = decodeURIComponent(params.path)

    const { error } = await supabase.storage
      .from('files')
      .remove([filePath])

    if (error) {
      console.error('Supabase storage error:', error)
      return NextResponse.json(
        { error: 'Failed to delete file' },
        { status: 500 }
      )
    }

    // Optionally remove from database
    await supabase
      .from('file_uploads')
      .delete()
      .eq('file_path', filePath)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete file error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
