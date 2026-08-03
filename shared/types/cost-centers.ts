import type { Entity } from './common.js'

export type CostCenterType = 'project' | 'operation'
export type CostCenterStatus = 'active' | 'completed' | 'cancelled'

/**
 * CostCenter DTO (data transfer object)
 * Used for API requests/responses
 */
export interface CostCenter extends Entity {
  name: string
  description?: string
  type: CostCenterType
  status: CostCenterStatus
}

export interface CreateCostCenterInput {
  name: string
  description?: string
  type: CostCenterType
  status?: CostCenterStatus // Defaults to 'active' if not provided
}

export interface UpdateCostCenterInput {
  name?: string
  description?: string
  type?: CostCenterType
  status?: CostCenterStatus
}
