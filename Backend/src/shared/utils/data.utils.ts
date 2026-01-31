/**
 * Utility functions for data transformation and filtering
 */

/**
 * Removes undefined values from an object
 */
export function filterUndefinedFields<T extends Record<string, any>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value !== undefined)
  ) as Partial<T>;
}

/**
 * Type-safe profile data builder for different profile types
 */
export function buildProfileUpdateData<T extends Record<string, any>>(
  data: T,
  requiredFields: (keyof T)[]
): Partial<T> {
  const filtered = filterUndefinedFields(data);
  
  // Ensure required fields have default values
  const result: Partial<T> = {};
  for (const field of requiredFields) {
    if (filtered[field] !== undefined) {
      result[field] = filtered[field];
    } else if (typeof data[field] === 'string') {
      result[field] = '' as T[keyof T];
    } else {
      result[field] = data[field];
    }
  }
  
  return result;
}

/**
 * Safe type casting with validation
 */
export function safeCast<T>(value: any, type: 'string' | 'number' | 'boolean' | 'date'): T | undefined {
  if (value === undefined || value === null) return undefined;
  
  switch (type) {
    case 'string':
      return (typeof value === 'string' ? value : String(value)) as T;
    case 'number':
      return (typeof value === 'number' ? value : Number(value)) as T;
    case 'boolean':
      return (typeof value === 'boolean' ? value : Boolean(value)) as T;
    case 'date':
      return (value instanceof Date ? value : new Date(value)) as T;
    default:
      return value as T;
  }
}

/**
 * Builds date filter for Prisma queries
 */
export function buildDateFilter(startDate?: string, endDate?: string) {
  const filter: any = {};
  
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.gte = new Date(startDate);
    if (endDate) filter.createdAt.lte = new Date(endDate);
  }
  
  return filter;
}
