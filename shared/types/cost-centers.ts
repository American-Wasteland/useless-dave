import type { Entity } from './common.js'

export type CostCenterType = 'project' | 'operation'

/**
 * CostCenter DTO (data transfer object)
 * Used for API requests/responses
 */
export interface CostCenter extends Entity {
  name: string
  description?: string
  type: CostCenterType
}

export interface CreateCostCenterInput {
  name: string
  description?: string
  type: CostCenterType
}

export interface UpdateCostCenterInput {
  name?: string
  description?: string
  type?: CostCenterType
}
