import { Config, File } from './types';

export function trimParam(input: any): string {
  return typeof input === 'string' ? input.trim() : '';
}

/**
 * Normalizes truthy values from various input types (env vars, booleans, strings)
 */
export function toBool(value: any): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return ['true', '1', 'yes'].includes(normalized);
  }
  if (typeof value === 'number') return value === 1;
  return false;
}

export function getServiceBaseUrl(config: Config): string {
  return (
    trimParam(config.serviceBaseURL) ||
    `https://${trimParam(config.account)}.blob.core.windows.net`
  );
}

export function getFileName(defaultPath: string, file: File): string {
  const trimmedPath = trimParam(defaultPath).replace(/^\/+|\/+$/g, ''); // Remove leading and trailing slashes
  return trimmedPath !== '' 
    ? `${trimmedPath}/${file.hash}${file.ext}` 
    : `${file.hash}${file.ext}`;
}
