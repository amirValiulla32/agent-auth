#!/bin/bash

# Agent Reasoning Context Test Script
# Demonstrates the new AI-native reasoning feature

API_URL="http://localhost:8787"

echo "🧠 Agent Reasoning Context Test"
echo "================================"
echo ""

# Get an agent ID from existing agents
echo "📝 Step 1: Getting test agent..."
AGENT_ID=$(curl -s "$API_URL/admin/agents" | python3 -c "import sys, json; print(json.load(sys.stdin)['agents'][0]['id'])")
echo "   Agent ID: $AGENT_ID"
echo ""

# Test 1: Validation with reasoning (allowed)
echo "✅ Step 2: Testing validation WITH reasoning (should be allowed)..."
RESPONSE=$(curl -s -X POST "$API_URL/v1/validate" \
  -H "Content-Type: application/json" \
  -d "{
    \"agent_id\": \"$AGENT_ID\",
    \"tool\": \"read_file\",
    \"scope\": \"/home/user\",
    \"reasoning\": \"User asked me to audit API keys for security review and verify they match our documented secrets\"
  }")

echo "   Response: $RESPONSE"
echo ""

# Test 2: Validation without reasoning (should also work)
echo "📝 Step 3: Testing validation WITHOUT reasoning (backward compatible)..."
RESPONSE=$(curl -s -X POST "$API_URL/v1/validate" \
  -H "Content-Type: application/json" \
  -d "{
    \"agent_id\": \"$AGENT_ID\",
    \"tool\": \"read_file\",
    \"scope\": \"/home/user\"
  }")

echo "   Response: $RESPONSE"
echo ""

# Test 3: Check logs to see reasoning
echo "🔍 Step 4: Fetching audit logs to verify reasoning is stored..."
LOGS=$(curl -s "$API_URL/admin/logs?limit=2")
echo "$LOGS" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print('   Total logs:', data['total'])
for log in data['logs'][:2]:
    print(f\"   - Tool: {log['tool']}, Reasoning: {log.get('reasoning', 'None')}\")
"
echo ""

echo "🎉 Test Complete!"
echo ""
echo "💡 Key Feature:"
echo "   - AI agents can now explain WHY they need permissions"
echo "   - Reasoning is optional (backward compatible)"
echo "   - Shows in dashboard with 💭 icon"
echo "   - Your competitive advantage over permit.io!"
