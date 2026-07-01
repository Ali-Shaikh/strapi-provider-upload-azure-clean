import { Config, File } from './types';

export function trimParam(input: any): string {
  return typeof input === 'string' ? input.trim() : '';
}

export function toBool(value: any): boolean {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    return value === 1;
  }

  if (typeof value === 'string') {
    return ['true', '1', 'yes'].includes(value.trim().toLowerCase());
  }

  return false;
}

export function getServiceBaseUrl(config: Config): string {
  return (
    trimParam(config.serviceBaseURL) ||
    `https://${trimParam(config.account)}.blob.core.windows.net`
  ).replace(/\/$/, '');
}

export function getFileName(defaultPath: string, file: File): string {
  const trimmedPath = trimParam(defaultPath).replace(/^\/+|\/+$/g, '');
  return trimmedPath
    ? `${trimmedPath}/${file.hash}${file.ext}` 
    : `${file.hash}${file.ext}`;
}
