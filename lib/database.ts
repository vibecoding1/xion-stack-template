/**
 * Supabase-First Database System
 * 
 * Primary database: Supabase PostgreSQL
 * Fallback: Local Storage (development only)
 */

import { config, isFeatureEnabled, isProviderEnabled } from './config'
import { supabase } from './supabase'

// Types
export interface DatabaseProvider {
  query: (sql: string, params?: any[]) => Promise<any[]>
  insert: (table: string, data: Record<string, any>) => Promise<any>
  update: (table: string, id: string, data: Record<string, any>) => Promise<any>
  delete: (table: string, id: string) => Promise<void>
  findById: (table: string, id: string) => Promise<any | null>
  findMany: (table: string, filters?: Record<string, any>) => Promise<any[]>
}

// Supabase Database Provider
class SupabaseDatabaseProvider implements DatabaseProvider {
  private supabaseClient: any

  constructor() {
    this.supabaseClient = supabase
  }

  async query(sql: string, params?: any[]): Promise<any[]> {
    if (!this.supabaseClient) throw new Error('Supabase not configured')
    
    const { data, error } = await this.supabaseClient.rpc('execute_sql', {
      query: sql,
      params: params || []
    })
    
    if (error) throw error
    return data || []
  }

  async insert(table: string, data: Record<string, any>): Promise<any> {
    if (!this.supabaseClient) throw new Error('Supabase not configured')
    
    const { data: result, error } = await this.supabaseClient
      .from(table)
      .insert(data)
      .select()
      .single()
    
    if (error) throw error
    return result
  }

  async update(table: string, id: string, data: Record<string, any>): Promise<any> {
    if (!this.supabaseClient) throw new Error('Supabase not configured')
    
    const { data: result, error } = await this.supabaseClient
      .from(table)
      .update(data)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return result
  }

  async delete(table: string, id: string): Promise<void> {
    if (!this.supabaseClient) throw new Error('Supabase not configured')
    
    const { error } = await this.supabaseClient
      .from(table)
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }

  async findById(table: string, id: string): Promise<any | null> {
    if (!this.supabaseClient) throw new Error('Supabase not configured')
    
    const { data, error } = await this.supabaseClient
      .from(table)
      .select('*')
      .eq('id', id)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  async findMany(table: string, filters?: Record<string, any>): Promise<any[]> {
    if (!this.supabaseClient) throw new Error('Supabase not configured')
    
    let query = this.supabaseClient.from(table).select('*')
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value)
      })
    }
    
    const { data, error } = await query
    
    if (error) throw error
    return data || []
  }
}

// Local Storage Database Provider (fallback)
class LocalStorageDatabaseProvider implements DatabaseProvider {
  private storage: Storage

  constructor() {
    this.storage = typeof window !== 'undefined' ? localStorage : {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {}
    } as Storage
  }

  private getTableData(table: string): any[] {
    const data = this.storage.getItem(`db_${table}`)
    return data ? JSON.parse(data) : []
  }

  private setTableData(table: string, data: any[]): void {
    this.storage.setItem(`db_${table}`, JSON.stringify(data))
  }

  async query(sql: string, params?: any[]): Promise<any[]> {
    // Simple SQL-like operations for local storage
    console.warn('Local storage does not support SQL queries')
    return []
  }

  async insert(table: string, data: Record<string, any>): Promise<any> {
    const tableData = this.getTableData(table)
    const newItem = {
      id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    tableData.push(newItem)
    this.setTableData(table, tableData)
    return newItem
  }

  async update(table: string, id: string, data: Record<string, any>): Promise<any> {
    const tableData = this.getTableData(table)
    const index = tableData.findIndex((item: any) => item.id === id)
    
    if (index === -1) throw new Error(`Record with id ${id} not found`)
    
    tableData[index] = {
      ...tableData[index],
      ...data,
      updated_at: new Date().toISOString()
    }
    
    this.setTableData(table, tableData)
    return tableData[index]
  }

  async delete(table: string, id: string): Promise<void> {
    const tableData = this.getTableData(table)
    const filteredData = tableData.filter((item: any) => item.id !== id)
    this.setTableData(table, filteredData)
  }

  async findById(table: string, id: string): Promise<any | null> {
    const tableData = this.getTableData(table)
    return tableData.find((item: any) => item.id === id) || null
  }

  async findMany(table: string, filters?: Record<string, any>): Promise<any[]> {
    let tableData = this.getTableData(table)
    
    if (filters) {
      tableData = tableData.filter((item: any) => {
        return Object.entries(filters).every(([key, value]) => item[key] === value)
      })
    }
    
    return tableData
  }
}

// No Database Provider (when database is disabled)
class NoDatabaseProvider implements DatabaseProvider {
  async query(): Promise<any[]> {
    throw new Error('Database is disabled')
  }

  async insert(): Promise<any> {
    throw new Error('Database is disabled')
  }

  async update(): Promise<any> {
    throw new Error('Database is disabled')
  }

  async delete(): Promise<void> {
    throw new Error('Database is disabled')
  }

  async findById(): Promise<any | null> {
    throw new Error('Database is disabled')
  }

  async findMany(): Promise<any[]> {
    throw new Error('Database is disabled')
  }
}

// Factory function to get the appropriate database provider
export const getDatabaseProvider = (): DatabaseProvider => {
  if (!isFeatureEnabled('database')) {
    return new NoDatabaseProvider()
  }

  // Supabase is the primary database
  if (isProviderEnabled('supabase')) {
    return new SupabaseDatabaseProvider()
  }

  // Fallback to local storage for development only
  if (process.env.NODE_ENV === 'development') {
    console.warn('Supabase not configured, using local storage fallback')
    return new LocalStorageDatabaseProvider()
  }

  // In production, require Supabase
  throw new Error('Supabase is required for database functionality')
}

// Export the database provider instance
export const db = getDatabaseProvider()

// Helper functions for common operations
export const createRecord = async (table: string, data: Record<string, any>) => {
  return await db.insert(table, data)
}

export const updateRecord = async (table: string, id: string, data: Record<string, any>) => {
  return await db.update(table, id, data)
}

export const deleteRecord = async (table: string, id: string) => {
  return await db.delete(table, id)
}

export const getRecord = async (table: string, id: string) => {
  return await db.findById(table, id)
}

export const getRecords = async (table: string, filters?: Record<string, any>) => {
  return await db.findMany(table, filters)
}

// React hook for database operations
export const useDatabase = () => {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const execute = async <T>(operation: () => Promise<T>): Promise<T | null> => {
    try {
      setLoading(true)
      setError(null)
      const result = await operation()
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Database error')
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    execute,
    isDatabaseEnabled: isFeatureEnabled('database')
  }
}
