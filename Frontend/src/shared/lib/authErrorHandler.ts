export function determineErrorContext(errorText: string, url: string): string {
  if (url.includes('/admin/')) return 'admin';
  if (url.includes('/hr/')) return 'hr';
  if (url.includes('/universities/')) return 'university';
  if (url.includes('/companies/')) return 'company';
  return 'general';
}
export function handleAuthError(_status: number, _response: Response, _context: string): void {
  if (_status === 401 || _status === 403) {
    // Handle auth errors
  }
}
