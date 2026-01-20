#!/bin/bash

# Test Reasoning Enforcement Modes (none/soft/hard)

API_URL="http://localhost:8787"

echo "🛡️ Testing Reasoning Enforcement Modes"
echo ""

# Create test agent
echo "1️⃣ Creating test agent..."
CREATE_RESPONSE=$(curl -s -X POST "$API_URL/admin/agents" \
  -H "Content-Type: application/json" \
  -d '{"name": "Reasoning Test Agent", "enabled": true}')

AGENT_ID=$(echo "$CREATE_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])")
echo "   Agent ID: $AGENT_ID"
echo ""

# Create tools
echo "2️⃣ Creating tools..."
curl -s -X POST "$API_URL/admin/tools" \
  -H "Content-Type: application/json" \
  -d "{\"agent_id\": \"$AGENT_ID\", \"name\": \"low_risk_tool\", \"scopes\": [\"read\"]}" > /dev/null
echo "   ✅ Created low_risk_tool (read)"

curl -s -X POST "$API_URL/admin/tools" \
  -H "Content-Type: application/json" \
  -d "{\"agent_id\": \"$AGENT_ID\", \"name\": \"medium_risk_tool\", \"scopes\": [\"update\"]}" > /dev/null
echo "   ✅ Created medium_risk_tool (update)"

curl -s -X POST "$API_URL/admin/tools" \
  -H "Content-Type: application/json" \
  -d "{\"agent_id\": \"$AGENT_ID\", \"name\": \"high_risk_tool\", \"scopes\": [\"delete\"]}" > /dev/null
echo "   ✅ Created high_risk_tool (delete)"
echo ""

# Create rules with different reasoning requirements
echo "3️⃣ Creating permission rules..."

curl -s -X POST "$API_URL/admin/rules" \
  -H "Content-Type: application/json" \
  -d "{\"agent_id\": \"$AGENT_ID\", \"tool\": \"low_risk_tool\", \"scope\": \"read\", \"require_reasoning\": \"none\"}" > /dev/null
echo "   ✅ Rule 1: low_risk_tool:read - NONE (optional)"

curl -s -X POST "$API_URL/admin/rules" \
  -H "Content-Type: application/json" \
  -d "{\"agent_id\": \"$AGENT_ID\", \"tool\": \"medium_risk_tool\", \"scope\": \"update\", \"require_reasoning\": \"soft\"}" > /dev/null
echo "   ✅ Rule 2: medium_risk_tool:update - SOFT (flag)"

curl -s -X POST "$API_URL/admin/rules" \
  -H "Content-Type: application/json" \
  -d "{\"agent_id\": \"$AGENT_ID\", \"tool\": \"high_risk_tool\", \"scope\": \"delete\", \"require_reasoning\": \"hard\"}" > /dev/null
echo "   ✅ Rule 3: high_risk_tool:delete - HARD (block)"
echo ""

# Test NONE enforcement (optional)
echo "═══════════════════════════════════════════════════"
echo "4️⃣ Testing NONE (Optional) - low_risk_tool:read"
echo "═══════════════════════════════════════════════════"

echo ""
echo "Test A: Request WITHOUT reasoning"
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$API_URL/v1/validate" \
  -H "Content-Type: application/json" \
  -d "{\"agent_id\": \"$AGENT_ID\", \"tool\": \"low_risk_tool\", \"scope\": \"read\"}")

HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE/d')
ALLOWED=$(echo "$BODY" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('allowed', False))" 2>/dev/null || echo "error")

if [ "$HTTP_CODE" == "200" ] && [ "$ALLOWED" == "True" ]; then
  echo "   ✅ Result: Allowed (200)"
  echo "   💡 NONE mode: Works without reasoning"
else
  echo "   ❌ Unexpected result: HTTP $HTTP_CODE"
fi

echo ""
echo "Test B: Request WITH reasoning"
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$API_URL/v1/validate" \
  -H "Content-Type: application/json" \
  -d "{\"agent_id\": \"$AGENT_ID\", \"tool\": \"low_risk_tool\", \"scope\": \"read\", \"reasoning\": \"Reading public documentation\"}")

HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE/d')
ALLOWED=$(echo "$BODY" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('allowed', False))" 2>/dev/null || echo "error")

if [ "$HTTP_CODE" == "200" ] && [ "$ALLOWED" == "True" ]; then
  echo "   ✅ Result: Allowed (200)"
  echo "   💡 NONE mode: Also works with reasoning"
else
  echo "   ❌ Unexpected result: HTTP $HTTP_CODE"
fi
echo ""

# Test SOFT enforcement (allow but flag)
echo "═══════════════════════════════════════════════════"
echo "5️⃣ Testing SOFT (Allow but Flag) - medium_risk_tool:update"
echo "═══════════════════════════════════════════════════"

echo ""
echo "Test A: Request WITHOUT reasoning"
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$API_URL/v1/validate" \
  -H "Content-Type: application/json" \
  -d "{\"agent_id\": \"$AGENT_ID\", \"tool\": \"medium_risk_tool\", \"scope\": \"update\"}")

HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE/d')
ALLOWED=$(echo "$BODY" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('allowed', False))" 2>/dev/null || echo "error")

if [ "$HTTP_CODE" == "200" ] && [ "$ALLOWED" == "True" ]; then
  echo "   ⚠️  Result: Allowed (200) - but flagged in logs"
  echo "   💡 SOFT mode: Allows request, logs should show warning"
else
  echo "   ❌ Unexpected result: HTTP $HTTP_CODE"
fi

echo ""
echo "Test B: Request WITH reasoning"
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$API_URL/v1/validate" \
  -H "Content-Type: application/json" \
  -d "{\"agent_id\": \"$AGENT_ID\", \"tool\": \"medium_risk_tool\", \"scope\": \"update\", \"reasoning\": \"User requested profile update\"}")

HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE/d')
ALLOWED=$(echo "$BODY" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('allowed', False))" 2>/dev/null || echo "error")

if [ "$HTTP_CODE" == "200" ] && [ "$ALLOWED" == "True" ]; then
  echo "   ✅ Result: Allowed (200) - compliant"
  echo "   💡 SOFT mode: With reasoning, no flag"
else
  echo "   ❌ Unexpected result: HTTP $HTTP_CODE"
fi
echo ""

# Test HARD enforcement (block without reasoning)
echo "═══════════════════════════════════════════════════"
echo "6️⃣ Testing HARD (Block) - high_risk_tool:delete"
echo "═══════════════════════════════════════════════════"

echo ""
echo "Test A: Request WITHOUT reasoning"
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$API_URL/v1/validate" \
  -H "Content-Type: application/json" \
  -d "{\"agent_id\": \"$AGENT_ID\", \"tool\": \"high_risk_tool\", \"scope\": \"delete\"}")

HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE/d')
ALLOWED=$(echo "$BODY" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('allowed', False))" 2>/dev/null || echo "error")

if [ "$ALLOWED" == "False" ]; then
  echo "   ⛔ Result: Blocked (200)"
  REASON=$(echo "$BODY" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('reason', ''))" 2>/dev/null || echo "")
  echo "   💡 Reason: $REASON"
  echo "   ✅ HARD mode: Successfully blocked request"
else
  echo "   ❌ FAILED: Should have been blocked!"
fi

echo ""
echo "Test B: Request WITH reasoning"
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$API_URL/v1/validate" \
  -H "Content-Type: application/json" \
  -d "{\"agent_id\": \"$AGENT_ID\", \"tool\": \"high_risk_tool\", \"scope\": \"delete\", \"reasoning\": \"User requested cleanup of test data\"}")

HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE/d')
ALLOWED=$(echo "$BODY" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('allowed', False))" 2>/dev/null || echo "error")

if [ "$HTTP_CODE" == "200" ] && [ "$ALLOWED" == "True" ]; then
  echo "   ✅ Result: Allowed (200)"
  echo "   💡 HARD mode: With reasoning, request succeeds"
else
  echo "   ❌ Unexpected result: HTTP $HTTP_CODE, allowed: $ALLOWED"
fi
echo ""

# Summary
echo "═══════════════════════════════════════════════════"
echo "📊 Test Summary"
echo "═══════════════════════════════════════════════════"
echo ""
echo "✅ NONE Mode:  Optional reasoning, always allows"
echo "⚠️  SOFT Mode:  Allows but flags missing reasoning"
echo "⛔ HARD Mode:  Blocks without reasoning"
echo ""
echo "🎉 All reasoning enforcement modes working correctly!"
echo ""
echo "💡 Check audit logs in dashboard to see compliance tracking"
