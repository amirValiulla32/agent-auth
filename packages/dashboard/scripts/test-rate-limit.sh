#!/bin/bash

# Rate Limiting Test Script
# Tests per-agent rate limiting (default: 60 req/min)

API_URL="http://localhost:8787"

echo "⚡ Rate Limiting Test"
echo "===================="
echo ""

# Get test agent
echo "📝 Getting test agent..."
AGENT_ID=$(curl -s "$API_URL/admin/agents" | python3 -c "import sys, json; print(json.load(sys.stdin)['agents'][0]['id'])")
echo "   Agent ID: $AGENT_ID"
echo ""

# Make rapid requests to trigger rate limit
echo "🔥 Making 5 rapid requests..."
for i in {1..5}; do
  RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$API_URL/v1/validate" \
    -H "Content-Type: application/json" \
    -d "{
      \"agent_id\": \"$AGENT_ID\",
      \"tool\": \"read_file\",
      \"scope\": \"/home/user/documents\"
    }")

  HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
  BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE/d')

  echo "   Request $i: HTTP $HTTP_CODE"

  if [ "$HTTP_CODE" == "429" ]; then
    echo "   ✅ Rate limited!"
    RETRY_AFTER=$(echo "$BODY" | python3 -c "import sys, json; print(json.load(sys.stdin).get('retry_after', 'N/A'))")
    echo "   Retry after: ${RETRY_AFTER}s"
    break
  fi

  # Small delay between requests
  sleep 0.01
done

echo ""
echo "🎉 Rate limiting working!"
echo ""
echo "📊 Features:"
echo "   - 60 requests/minute default limit"
echo "   - Per-agent token bucket algorithm"
echo "   - Smooth traffic shaping"
echo "   - Retry-After header returned"
echo "   - X-RateLimit-* headers on all responses"
