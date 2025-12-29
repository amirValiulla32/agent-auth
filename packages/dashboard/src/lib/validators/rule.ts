/**
 * Permission Rule Validation Schemas
 * Zod schemas for creating and managing permission rules
 */

import { z } from 'zod';

/**
 * Schema for rule conditions
 * At least one condition must be specified
 */
export const ruleConditionsSchema = z
  .object({
    // Duration limit in minutes (1 min to 24 hours)
    max_duration: z
      .number()
      .int('Duration must be a whole number')
      .min(1, 'Duration must be at least 1 minute')
      .max(1440, 'Duration cannot exceed 24 hours (1440 minutes)')
      .optional(),

    // Attendee limit (1 to 1000)
    max_attendees: z
      .number()
      .int('Attendee count must be a whole number')
      .min(1, 'Must allow at least 1 attendee')
      .max(1000, 'Cannot exceed 1000 attendees')
      .optional(),

    // Business hours restriction (Mon-Fri, 9am-5pm UTC)
    business_hours_only: z.boolean().optional(),

    // Allowed actions (for future extensibility)
    allowed_actions: z.array(z.string()).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one condition must be specified',
  });

/**
 * Valid tools that can be proxied
 */
export const toolSchema = z.enum(['google_calendar'], {
  errorMap: () => ({ message: 'Invalid tool. Currently only google_calendar is supported' }),
});

/**
 * Valid actions for Google Calendar
 */
export const actionSchema = z.enum(
  ['create_event', 'update_event', 'delete_event', 'list_events'],
  {
    errorMap: () => ({
      message: 'Invalid action. Must be one of: create_event, update_event, delete_event, list_events',
    }),
  }
);

/**
 * Schema for creating a new rule
 */
export const createRuleSchema = z.object({
  agent_id: z
    .string()
    .min(1, 'Agent ID is required')
    .regex(/^[a-zA-Z0-9\-_]+$/, 'Invalid agent ID format'),

  tool: toolSchema,

  action: actionSchema,

  conditions: ruleConditionsSchema,
});

/**
 * Schema for updating an existing rule
 * Currently rules can only be deleted and recreated, not updated
 * But keeping this for future extensibility
 */
export const updateRuleSchema = z.object({
  conditions: ruleConditionsSchema.optional(),
});

/**
 * Type definitions inferred from schemas
 */
export type RuleConditions = z.infer<typeof ruleConditionsSchema>;
export type CreateRuleInput = z.infer<typeof createRuleSchema>;
export type UpdateRuleInput = z.infer<typeof updateRuleSchema>;
export type Tool = z.infer<typeof toolSchema>;
export type Action = z.infer<typeof actionSchema>;

/**
 * Constants for tools and actions
 */
export const TOOLS = {
  GOOGLE_CALENDAR: 'google_calendar',
} as const;

export const ACTIONS = {
  CREATE_EVENT: 'create_event',
  UPDATE_EVENT: 'update_event',
  DELETE_EVENT: 'delete_event',
  LIST_EVENTS: 'list_events',
} as const;

/**
 * Helper to get human-readable tool names
 */
export function getToolDisplayName(tool: Tool): string {
  const names: Record<Tool, string> = {
    google_calendar: 'Google Calendar',
  };
  return names[tool];
}

/**
 * Helper to get human-readable action names
 */
export function getActionDisplayName(action: Action): string {
  const names: Record<Action, string> = {
    create_event: 'Create Event',
    update_event: 'Update Event',
    delete_event: 'Delete Event',
    list_events: 'List Events',
  };
  return names[action];
}
