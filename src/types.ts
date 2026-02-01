import { Readable } from 'stream';

export interface Config {
  account: string;
  accountKey?: string;
  sasToken?: string;
  serviceBaseURL?: string;
  containerName: string;
  defaultPath: string;
  cdnBaseURL?: string;
  defaultCacheControl?: string;
  removeCN?: string;
  publicContainer?: string;
  createContainerIfNotExist?: string;
  publicAccessType?: 'blob' | 'container';
}

export interface File {
  name: string;
  hash: string;
  ext: string;
  mime: string;
  size?: number;
  buffer?: Buffer;
  stream?: Readable;
  path?: string;
  tmpPath?: string;
  url?: string;
}
