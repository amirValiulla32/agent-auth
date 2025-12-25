/**
 * Agent Validation Schemas
 * Zod schemas for agent creation and updates
 */

import { z } from 'zod';

/**
 * Schema for creating a new agent
 */
export const createAgentSchema = z.object({
  name: z
    .string()
    .min(1, 'Agent name is required')
    .max(100, 'Agent name must be less than 100 characters')
    .regex(
      /^[a-zA-Z0-9\s\-_]+$/,
      'Agent name can only contain letters, numbers, spaces, hyphens, and underscores'
    )
    .transform((str) => str.trim()), // Sanitize by trimming whitespace
  enabled: z.boolean().default(true),
});

/**
 * Schema for updating an existing agent
 * All fields are optional for partial updates
 */
export const updateAgentSchema = z.object({
  name: z
    .string()
    .min(1, 'Agent name is required')
    .max(100, 'Agent name must be less than 100 characters')
    .regex(
      /^[a-zA-Z0-9\s\-_]+$/,
      'Agent name can only contain letters, numbers, spaces, hyphens, and underscores'
    )
    .transform((str) => str.trim())
    .optional(),
  enabled: z.boolean().optional(),
});

/**
 * Type definitions inferred from schemas
 */
export type CreateAgentInput = z.infer<typeof createAgentSchema>;
export type UpdateAgentInput = z.infer<typeof updateAgentSchema>;

/**
 * Validation helper for API key format
 * API keys should start with "ak_" or "test-key-"
 */
export const apiKeySchema = z
  .string()
  .regex(
    /^(ak_[a-zA-Z0-9]{32}|test-key-[a-zA-Z0-9]+)$/,
    'Invalid API key format'
  );
