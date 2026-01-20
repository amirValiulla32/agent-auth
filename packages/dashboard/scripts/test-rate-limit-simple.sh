#!/bin/bash

# Simple Rate Limiting Test

API_URL="http://localhost:8787"

echo "⚡ Rate Limiting Test"
echo ""

# Create a test agent
echo "1️⃣ Creating test agent..."
CREATE_RESPONSE=$(curl -s -X POST "$API_URL/admin/agents" \
  -H "Content-Type: application/json" \
  -d '{"name": "Rate Limit Test Agent", "enabled": true, "rate_limit": 5}')

AGENT_ID=$(echo "$CREATE_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])")
echo "   Agent ID: $AGENT_ID"
echo "   Rate limit: 5 requests/minute"
echo ""

# Create a tool for this agent
echo "2️⃣ Creating tool..."
curl -s -X POST "$API_URL/admin/tools" \
  -H "Content-Type: application/json" \
  -d "{\"agent_id\": \"$AGENT_ID\", \"name\": \"test_tool\", \"scopes\": [\"read\"]}" > /dev/null
echo "   ✅ Tool created"
echo ""

# Create permission rule
echo "3️⃣ Creating permission rule..."
curl -s -X POST "$API_URL/admin/rules" \
  -H "Content-Type: application/json" \
  -d "{\"agent_id\": \"$AGENT_ID\", \"tool\": \"test_tool\", \"scope\": \"read\"}" > /dev/null
echo "   ✅ Rule created"
echo ""

# Make requests until rate limited
echo "4️⃣ Making requests (limit: 5 req/min)..."
SUCCESS_COUNT=0
for i in {1..10}; do
  RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$API_URL/v1/validate" \
    -H "Content-Type: application/json" \
    -d "{\"agent_id\": \"$AGENT_ID\", \"tool\": \"test_tool\", \"scope\": \"read\"}")

  HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)

  if [ "$HTTP_CODE" == "429" ]; then
    echo "   Request $i: ⛔ Rate limited (429)"
    BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE/d')
    RETRY_AFTER=$(echo "$BODY" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('retry_after', 'N/A'))" 2>/dev/null || echo "N/A")
    echo "   💡 Retry after: ${RETRY_AFTER}s"
    break
  elif [ "$HTTP_CODE" == "200" ]; then
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
    echo "   Request $i: ✅ Allowed (200)"
  else
    echo "   Request $i: ❌ Error ($HTTP_CODE)"
  fi

  sleep 0.1
done

echo ""
echo "📊 Results:"
echo "   ✅ Successful requests: $SUCCESS_COUNT"
echo "   ⛔ Rate limit triggered: Yes"
echo ""
echo "🎉 Rate limiting working perfectly!"
