export function getCursor(record: Record<string, any>, sortField): string {
  return Buffer.from([record[sortField], record._id].join(':')).toString(
    'base64',
  );
}

export function parseCursor(cursor): any[] {
  return Buffer.from(cursor, 'base64').toString('ascii').split(':');
}
