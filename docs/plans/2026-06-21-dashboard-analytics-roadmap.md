# Dashboard Analytics & Insights Roadmap

**Date:** 2026-06-21
**Status:** Proposal / for review
**Author:** Product brainstorm (grounded in a backend data-capture audit + market research)

## TL;DR

The dashboard currently shows **4 raw counts** (`totalAgents`, `totalLogs`, `denialsToday`, `apiCallsToday`) and a raw log table. We capture far richer audit data than we surface, and there's a clear, low-risk path to turn the dashboard into a real **governance cockpit**.

One premise to correct up front: **OakAuth captures no cost, token, latency, or model data.** It validates permissions; it never proxies the actual LLM/tool call, so it physically cannot see tokens or dollars today. Our lane is **AI agent governance & audit**, not LLM observability. The most valuable additions build on the audit data we already have — not a cost clone of Helicone/Langfuse.

---

## 1. Positioning: which lane are we in?

| Lane | Representative players | What it requires | OakAuth fit |
|------|------------------------|------------------|-------------|
| LLM observability / cost | LangSmith, Langfuse, Helicone, Braintrust, Datadog | Must be a **proxy** that sees every model call (tokens, latency, cost) | ❌ Not a proxy — cannot see this today |
| **Agent governance / authorization / audit** | Straiker, Zenity, Galileo, Akira | Immutable audit trails, policy enforcement, violation alerting, compliance reports, approval workflows | ✅ **This is us** |

Governance dashboards in the market consistently feature: immutable audit trails, RBAC/policy enforcement, real-time alerting on policy violations, audit-ready/regulatory reports (SOC 2, EU AI Act, NIST AI 600-1, HIPAA, PCI-DSS), and approval workflows. OakAuth's data model already supports most of these cheaply.

## 2. What we capture today (data-capture audit)

Per validation, the `logs` table stores **11 fields** (`storage.ts` `createLog`, `types.ts` `Log`):

`id`, `agent_id`, `tool`, `scope`, `allowed`, `deny_reason`, `request_details`, `reasoning`, `reasoning_required`, `reasoning_provided`, `timestamp`.

Notes:
- **`request_details`** = `JSON.stringify(context || {})` — *only* the caller-supplied `context` object, not the full request body. Shape is entirely caller-defined and unvalidated (could hold `amount`, `customer_id`, etc.). Never parsed or aggregated anywhere.
- **`reasoning_required` / `reasoning_provided`** are explicitly labeled "for compliance tracking" in the code but **never aggregated**.
- **No** `cost` / `tokens` / `latency` / `duration` / `model` fields exist anywhere.
- **Rate-limiting** is in-memory only (token bucket `Map` in `rate-limiter.ts`); state is lost on worker restart. **429 rejections are not logged** — they return before `createLog`, leaving no audit trace.

`getStats(userId?)` computes only 4 row counts. No grouping by tool/scope/agent, no time-series, no allow-rate.

### Captured-but-unused signal (already on hand)
`tool`, `scope`, `deny_reason`, `reasoning`, `reasoning_required`, `reasoning_provided`, `request_details` (context), and `timestamp` as a time dimension — none feed any aggregate today.

## 3. Roadmap (tiered by effort)

### Tier 0 — Analytics on existing data (no backend schema changes)
Pure aggregation over the `logs` table. Highest impact, lowest risk. **Recommended first build.**

- **Allow vs. deny rate** — headline donut + trend line (from `allowed` + `timestamp`).
- **Activity over time** — calls & denials area chart (not just "today").
- **Top denied `tool:scope` pairs** — what agents repeatedly attempt without permission → tells customers exactly which rules to add.
- **Denial-reason breakdown** — bucket `deny_reason`: *no rule exists* vs *reasoning required* vs (later) *rate-limited*.
- **Per-agent leaderboard** — calls, denials, allow-rate per `agent_id` (riskiest/busiest agents).
- **Compliance coverage** — % of `soft`/`hard` calls that supplied reasoning (`reasoning_required` + `reasoning_provided`). Audit-ready KPI, data already present.
- **Policy hygiene** — "agents with zero rules," "tools never used," "scopes denied N× — add a rule?" (join agents/tools/rules).

Implementation sketch: add aggregation methods to `storage.ts` (e.g. `getAnalytics(userId, range)`), expose via a new `/admin/analytics` route (wrapped with `withCors`), consume in the dashboard overview with a lightweight chart lib.

### Tier 1 — Cheap instrumentation (small schema/column additions)
- **Authorization latency** — measure OakAuth's own decision time (`performance.now()` start/end) → honest P50/P99 of auth overhead. Real latency without becoming a proxy.
- **Log rate-limit 429s** — currently invisible; logging them unlocks usage-vs-limit analytics and closes an audit gap.
- **Tag-based attribution** — index optional `context` keys (model, session_id, user) for "group by feature/user/model," matching market expectations.

### Tier 2 — Governance features (the moat)
- **Alerting** — Slack / email / webhook on denial spikes, a new deny-reason, or rate-limit hits.
- **Approval workflows** — route `require_reasoning: hard` actions to a human **pending-approval queue** instead of only logging. Genuine differentiator.
- **Audit-ready / scheduled compliance reports** — signed, tamper-evident, framework-mapped exports (extends existing CSV/JSON export).

### Tier 3 — Enter the cost/observability lane (architectural)
Become an actual **proxy** (note: a `proxy.ts` existed previously and was removed — see git history). Only then can we capture real tokens/cost/latency of downstream calls. Large lift; pursue only as a deliberate strategic move to compete with Helicone/Langfuse.

## 4. The "cost" question, answered honestly

Three distinct meanings of "cost":
1. **LLM token cost** — ❌ impossible without Tier 3 (proxying). Do not fake it.
2. **Business value gated** — ✅ *if* customers populate `context.amount` (which we already store), we can show "value of actions authorized/denied" (e.g. "$420K of refunds gated this month"). Opt-in, grounded, compelling governance narrative.
3. **Usage of OakAuth itself** — ✅ validate-call volume per agent *is* their usage/cost of OakAuth — useful for their capacity planning and our future billing.

## 5. Recommendation & sequencing

1. **Build Tier 0 now** — turns "4 counts" into a governance cockpit; zero backend risk; directly answers "what do I do about my agents?"
2. **Then Tier 1's 429-logging + auth latency** — small, closes a real audit gap, adds an honest latency metric.
3. **Roadmap Tier 2 (alerting + approval workflows)** as the differentiators.
4. **Tier 3** only if we deliberately choose to compete in observability/cost.

## 6. Open questions

- Do we want to formalize `context` schema conventions (e.g. reserved keys `amount`, `currency`, `user_id`) so "value gated" and tag-based attribution are reliable rather than best-effort?
- Persist rate-limit state (Cloudflare KV / Durable Objects) — prerequisite for trustworthy usage-vs-limit analytics.
- Which compliance frameworks matter most to early customers (drives the report templates)?

## Sources

- [15 AI Agent Observability Tools in 2026 (aimultiple)](https://aimultiple.com/agentic-monitoring)
- [Best tools for tracking LLM costs 2026 (Braintrust)](https://www.braintrust.dev/articles/best-tools-tracking-llm-costs-2026)
- [Token & Cost Tracking (Langfuse docs)](https://langfuse.com/docs/observability/features/token-and-cost-tracking)
- [LangSmith observability](https://www.langchain.com/langsmith/observability)
- [AI Agent Compliance & Governance (Straiker)](https://www.straiker.ai/solution/ai-compliance-governance)
- [AI Agent Compliance, Governance & Audit Trails (Galileo)](https://galileo.ai/blog/ai-agent-compliance-governance-audit-trails-risk-management)

## Related

- `docs/plans/2026-02-06-production-roadmap.md` — production roadmap
- Idea backlog: "create an import agent tab in the dashboard"; deep-link agent routes (`/dashboard/agents/[id]/permissions`) from the command palette / quick actions
