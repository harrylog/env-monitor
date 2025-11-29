#!/bin/bash
# API Testing Script for Environment Monitor
# Tests all CRUD operations

BASE_URL="http://localhost:3000"
API_URL="$BASE_URL/api/environments"

echo "🧪 Environment Monitor - API Test Suite"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test 1: Health Check
echo -e "${BLUE}Test 1: Health Check${NC}"
response=$(curl -s "$BASE_URL/health")
if echo "$response" | grep -q "ok"; then
    echo -e "${GREEN}✅ PASSED${NC} - Server is healthy"
    echo "$response" | jq . 2>/dev/null || echo "$response"
else
    echo -e "${RED}❌ FAILED${NC} - Server not responding"
    echo "$response"
fi
echo ""

# Test 2: Get All Environments
echo -e "${BLUE}Test 2: GET /api/environments${NC}"
response=$(curl -s "$API_URL")
count=$(echo "$response" | jq '. | length' 2>/dev/null)
if [ "$count" -gt 0 ]; then
    echo -e "${GREEN}✅ PASSED${NC} - Retrieved $count environments"
    echo "$response" | jq '.[0:2]' 2>/dev/null || echo "$response"
else
    echo -e "${RED}❌ FAILED${NC}"
    echo "$response"
fi
echo ""

# Test 3: Get Single Environment
echo -e "${BLUE}Test 3: GET /api/environments/1${NC}"
response=$(curl -s "$API_URL/1")
if echo "$response" | grep -q "id"; then
    echo -e "${GREEN}✅ PASSED${NC}"
    echo "$response" | jq . 2>/dev/null || echo "$response"
else
    echo -e "${RED}❌ FAILED${NC}"
    echo "$response"
fi
echo ""

# Test 4: Create New Environment
echo -e "${BLUE}Test 4: POST /api/environments (Create)${NC}"
new_env='{
  "name": "Test API Server",
  "url": "https://test-api.example.com",
  "version": "v1.2.3",
  "status": "working",
  "notes": "Created via test script"
}'
response=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "$new_env")

new_id=$(echo "$response" | jq -r '.id' 2>/dev/null)
if [ -n "$new_id" ] && [ "$new_id" != "null" ]; then
    echo -e "${GREEN}✅ PASSED${NC} - Created environment with ID: $new_id"
    echo "$response" | jq . 2>/dev/null || echo "$response"
else
    echo -e "${RED}❌ FAILED${NC}"
    echo "$response"
    exit 1
fi
echo ""

# Test 5: Update Environment
echo -e "${BLUE}Test 5: PUT /api/environments/$new_id (Update)${NC}"
update_data='{
  "status": "degraded",
  "notes": "Updated via test script - simulating degraded state"
}'
response=$(curl -s -X PUT "$API_URL/$new_id" \
  -H "Content-Type: application/json" \
  -d "$update_data")

if echo "$response" | jq -e '.status == "degraded"' >/dev/null 2>&1; then
    echo -e "${GREEN}✅ PASSED${NC} - Environment updated successfully"
    echo "$response" | jq . 2>/dev/null || echo "$response"
else
    echo -e "${RED}❌ FAILED${NC}"
    echo "$response"
fi
echo ""

# Test 6: Delete Environment
echo -e "${BLUE}Test 6: DELETE /api/environments/$new_id${NC}"
status_code=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$API_URL/$new_id")

if [ "$status_code" = "204" ]; then
    echo -e "${GREEN}✅ PASSED${NC} - Environment deleted successfully (HTTP $status_code)"
else
    echo -e "${RED}❌ FAILED${NC} - HTTP $status_code"
fi
echo ""

# Test 7: Verify Deletion
echo -e "${BLUE}Test 7: Verify deletion (should return 404)${NC}"
status_code=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/$new_id")

if [ "$status_code" = "404" ]; then
    echo -e "${GREEN}✅ PASSED${NC} - Environment confirmed deleted (HTTP $status_code)"
else
    echo -e "${RED}❌ FAILED${NC} - HTTP $status_code"
fi
echo ""

echo "========================================"
echo -e "${GREEN}✅ All tests completed!${NC}"
echo ""
echo "To view the database contents:"
echo "  cd env-monitor-backend"
echo "  ./monitor-db.sh"
echo ""
echo "Or manually:"
echo "  sqlite3 env-monitor-backend/data/environments.db 'SELECT * FROM environments'"
