/**
 * Shared types between client and server.
 *
 * Convention:
 * - DTO types use ISO strings for dates (JSON serialization)
 * - Server converts to/from Date objects when working with Firestore
 */

export interface Entity {
  id: string
  createdAt: string
  updatedAt?: string
}

export type WithoutTimestamps<T extends Entity> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>
