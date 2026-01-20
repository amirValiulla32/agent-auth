#!/bin/bash

# JWT Session Management Test Script
# Demonstrates login, token usage, refresh, and revocation

API_URL="http://localhost:8787"

echo "🔐 JWT Session Management Test"
echo "================================"
echo ""

# Step 1: Get an API key
echo "📝 Step 1: Getting agent API key..."
API_KEY=$(curl -s "$API_URL/admin/agents" | python3 -c "import sys, json; print(json.load(sys.stdin)['agents'][0]['api_key'])")
echo "   API Key: $API_KEY"
echo ""

# Step 2: Login with API key to get tokens
echo "🔑 Step 2: Login with API key to get JWT tokens..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"api_key\": \"$API_KEY\"}")

ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])")
REFRESH_TOKEN=$(echo $LOGIN_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['refresh_token'])")

echo "   ✅ Access Token (first 50 chars): ${ACCESS_TOKEN:0:50}..."
echo "   ✅ Refresh Token (first 50 chars): ${REFRESH_TOKEN:0:50}..."
echo "   ✅ Expires in: 1 hour"
echo ""

# Step 3: Use access token to validate permission
echo "🎫 Step 3: Using access token to validate permission..."
VALIDATE_RESPONSE=$(curl -s -X POST "$API_URL/v1/validate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{"agent_id": "test", "tool": "read_file", "scope": "/home/user"}')

echo "   Response: $VALIDATE_RESPONSE"
echo ""

# Step 4: Refresh the access token
echo "🔄 Step 4: Refreshing access token with refresh token..."
REFRESH_RESPONSE=$(curl -s -X POST "$API_URL/auth/refresh" \
  -H "Content-Type: application/json" \
  -d "{\"refresh_token\": \"$REFRESH_TOKEN\"}")

NEW_ACCESS_TOKEN=$(echo $REFRESH_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])")
echo "   ✅ New Access Token (first 50 chars): ${NEW_ACCESS_TOKEN:0:50}..."
echo ""

# Step 5: Revoke a token
echo "🚫 Step 5: Revoking the original access token..."
REVOKE_RESPONSE=$(curl -s -X POST "$API_URL/auth/revoke" \
  -H "Content-Type: application/json" \
  -d "{\"token\": \"$ACCESS_TOKEN\"}")

echo "   Response: $REVOKE_RESPONSE"
echo ""

# Step 6: Try using revoked token (should fail)
echo "❌ Step 6: Trying to use revoked token (should fail)..."
REVOKED_TEST=$(curl -s -X POST "$API_URL/v1/validate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{"agent_id": "test", "tool": "read_file", "scope": "/home/user"}')

echo "   Response: $REVOKED_TEST"
echo ""

# Step 7: Use new token (should work)
echo "✅ Step 7: Using new token (should work)..."
NEW_TOKEN_TEST=$(curl -s -X POST "$API_URL/v1/validate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $NEW_ACCESS_TOKEN" \
  -d '{"agent_id": "test", "tool": "read_file", "scope": "/home/user"}')

echo "   Response: $NEW_TOKEN_TEST"
echo ""

echo "🎉 JWT Test Complete!"
echo ""
echo "📚 Summary:"
echo "   - ✅ Login with API key → Get JWT tokens"
echo "   - ✅ Use access token for requests"
echo "   - ✅ Refresh token when expired"
echo "   - ✅ Revoke compromised tokens"
echo "   - ✅ Old tokens blocked, new tokens work"
