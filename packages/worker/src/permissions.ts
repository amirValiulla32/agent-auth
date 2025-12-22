/**
 * Permission Engine
 * Orchestrates rule loading and evaluation
 */

import { Agent, EvaluationResult, PermissionContext, RuleConditions } from '@agent-auth/shared';
import { storage } from './storage';
import { EvaluatorRegistry } from './evaluators';

export class PermissionEngine {
  private evaluatorRegistry: EvaluatorRegistry;

  constructor() {
    this.evaluatorRegistry = new EvaluatorRegistry();
  }

  async evaluate(context: PermissionContext): Promise<EvaluationResult> {
    // Load applicable rules for this agent/tool/action
    const rules = await storage.getRulesForAgent(
      context.agent.id,
      context.tool,
      context.action
    );

    // If no rules exist, deny by default
    if (rules.length === 0) {
      return {
        allowed: false,
        reason: `No permission rules defined for ${context.action} on ${context.tool}`,
      };
    }

    // Evaluate each rule (all must pass - AND logic)
    for (const rule of rules) {
      const conditions: RuleConditions = JSON.parse(rule.conditions);

      const result = await this.evaluatorRegistry.evaluateConditions(context, conditions);

      if (!result.allowed) {
        return result; // Fail fast
      }
    }

    // All rules passed
    return { allowed: true };
  }
}
