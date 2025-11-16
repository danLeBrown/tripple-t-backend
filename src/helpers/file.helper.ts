import { BadRequestException } from '@nestjs/common';
import { getMonth, getYear } from 'date-fns';

export function getFileMimeType(extension: string): string {
  return (
    {
      jpeg: 'image/jpeg',
      jpg: 'image/jpeg',
      png: 'image/png',
      pdf: 'application/pdf',
    }[extension] ?? 'application/octet-stream'
  );
}

export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop() || '' : '';
}

export function getFileExtensionFromMimeType(mimeType: string): string {
  const mimeTypePattern = /^[a-zA-Z0-9!#$&^_.+-]+\/[a-zA-Z0-9!#$&^_.+-]+$/;
  if (!mimeTypePattern.test(mimeType)) {
    return '';
  }
  return mimeType.split('/')[1];
}

export function getFileNameWithoutExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.slice(0, -1).join('.') : filename;
}

export function getFileNameWithExtension(
  filename: string,
  extension: string,
): string {
  return `${getFileNameWithoutExtension(filename)}.${extension}`;
}

export function generateObjectKey(file_mimetype: string): string {
  const random = Math.random().toString(36).substring(7);

  const extension = getFileExtensionFromMimeType(file_mimetype);

  if (!extension) {
    throw new BadRequestException('Invalid file mimetype provided');
  }

  const key = `${getYear(new Date())}/${(getMonth(new Date()) + 1).toString().padStart(2, '0')}/${random}.${extension}`;

  return key;
}

export function getFileMimeTypeFromKey(key: string): string {
  const extension = getFileExtension(key);
  return getFileMimeType(extension);
}
