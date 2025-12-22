/**
 * Permission Rule Evaluators
 */

import { EvaluationResult, PermissionContext, RuleConditions } from '@agent-auth/shared';

export interface Evaluator {
  evaluate(context: PermissionContext, conditionValue: any): Promise<EvaluationResult>;
}

/**
 * Duration Evaluator
 * Checks if event duration is within the allowed maximum
 */
export class DurationEvaluator implements Evaluator {
  async evaluate(context: PermissionContext, maxMinutes: number): Promise<EvaluationResult> {
    const { start, end } = context.requestBody;

    if (!start || !end) {
      return { allowed: true }; // No duration to check
    }

    // Extract dateTime from Google Calendar format
    const startTime = start.dateTime || start;
    const endTime = end.dateTime || end;

    const durationMs = new Date(endTime).getTime() - new Date(startTime).getTime();
    const durationMinutes = durationMs / 60000;

    if (durationMinutes > maxMinutes) {
      return {
        allowed: false,
        reason: `Event duration (${Math.round(durationMinutes)}min) exceeds limit (${maxMinutes}min)`,
        metadata: { actual: durationMinutes, limit: maxMinutes },
      };
    }

    return { allowed: true };
  }
}

/**
 * Attendee Evaluator
 * Checks if number of attendees is within the allowed maximum
 */
export class AttendeeEvaluator implements Evaluator {
  async evaluate(context: PermissionContext, maxAttendees: number): Promise<EvaluationResult> {
    const { attendees } = context.requestBody;

    if (!attendees || !Array.isArray(attendees)) {
      return { allowed: true }; // No attendees specified
    }

    const attendeeCount = attendees.length;

    if (attendeeCount > maxAttendees) {
      return {
        allowed: false,
        reason: `Event has ${attendeeCount} attendees, exceeding limit of ${maxAttendees}`,
        metadata: { count: attendeeCount, limit: maxAttendees },
      };
    }

    return { allowed: true };
  }
}

/**
 * Time Restriction Evaluator
 * Checks if event is scheduled during business hours
 */
export class TimeRestrictionEvaluator implements Evaluator {
  async evaluate(
    context: PermissionContext,
    businessHoursOnly: boolean
  ): Promise<EvaluationResult> {
    if (!businessHoursOnly) {
      return { allowed: true };
    }

    const { start } = context.requestBody;
    if (!start) {
      return { allowed: true }; // No start time to check
    }

    const startTime = start.dateTime || start;
    const startDate = new Date(startTime);
    const dayOfWeek = startDate.getUTCDay(); // 0 = Sunday
    const hour = startDate.getUTCHours();

    // Business hours: Monday-Friday (1-5), 9am-5pm UTC
    const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
    const isBusinessHours = hour >= 9 && hour < 17;

    if (!isWeekday || !isBusinessHours) {
      return {
        allowed: false,
        reason: 'Events can only be created during business hours (Mon-Fri, 9am-5pm UTC)',
        metadata: {
          startTime: startDate.toISOString(),
          dayOfWeek,
          hour,
        },
      };
    }

    return { allowed: true };
  }
}

/**
 * Evaluator Registry
 * Maps condition types to their evaluators
 */
export class EvaluatorRegistry {
  private evaluators: Map<string, Evaluator> = new Map();

  constructor() {
    this.evaluators.set('max_duration', new DurationEvaluator());
    this.evaluators.set('max_attendees', new AttendeeEvaluator());
    this.evaluators.set('business_hours_only', new TimeRestrictionEvaluator());
  }

  get(conditionType: string): Evaluator | undefined {
    return this.evaluators.get(conditionType);
  }

  async evaluateConditions(
    context: PermissionContext,
    conditions: RuleConditions
  ): Promise<EvaluationResult> {
    // Evaluate each condition (AND logic - all must pass)
    for (const [conditionType, conditionValue] of Object.entries(conditions)) {
      const evaluator = this.get(conditionType);
      if (!evaluator) {
        console.warn(`Unknown condition type: ${conditionType}`);
        continue;
      }

      const result = await evaluator.evaluate(context, conditionValue);
      if (!result.allowed) {
        return result; // Fail fast
      }
    }

    return { allowed: true };
  }
}
