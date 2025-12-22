/**
 * Audit Logger
 * Logs all agent requests (allowed and denied)
 */

import { Log, LogEntry } from '@agent-auth/shared';
import { storage } from './storage';
import { generateId } from './utils';

export class AuditLogger {
  async log(entry: LogEntry): Promise<void> {
    const log: Log = {
      id: generateId(),
      agent_id: entry.agentId,
      tool: entry.tool,
      action: entry.action,
      allowed: entry.allowed,
      deny_reason: entry.denyReason || null,
      request_details: JSON.stringify(entry.requestDetails),
      timestamp: Date.now(),
    };

    try {
      await storage.createLog(log);
      console.log(`[AUDIT] ${log.allowed ? 'ALLOWED' : 'DENIED'} - Agent: ${log.agent_id}, Action: ${log.action}${log.deny_reason ? `, Reason: ${log.deny_reason}` : ''}`);
    } catch (error) {
      console.error('Failed to write audit log:', error);
      // Don't throw - logging failures shouldn't break the request
    }
  }
}
