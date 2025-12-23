#!/bin/bash

BASE_URL="http://localhost:8080/api"

echo "=========================================="
echo "Testing CrowdFunding Platform Endpoints"
echo "=========================================="

echo -e "\n[1] Creating a new Project..."
curl -s -X POST "$BASE_URL/projects" \
-H "Content-Type: application/json" \
-d '{
    "name": "Eco Friendly Water Bottle",
    "description": "Values sustainability",
    "targetAmount": 5000.0
}' | json_pp
# json_pp pretty prints if available, otherwise it just pipes through. 
# actually plain curl might be safer if json_pp missing, but let's assume it might not format.
# I will standard curl -i to show status.

echo -e "\n\n[2] Making an Investment of 100.0 by John Doe..."
curl -s -X POST "$BASE_URL/investments" \
-H "Content-Type: application/json" \
-d '{
    "projectId": 1,
    "investorName": "John Doe",
    "amount": 100.0
}'

echo -e "\n\n[3] Verifying Project Status (Raised Amount)..."
curl -s -X GET "$BASE_URL/projects/1"

echo -e "\n\n[4] Getting Investments by John Doe..."
curl -s -X GET "$BASE_URL/investments/investor/John%20Doe"

echo -e "\n\nDONE."
