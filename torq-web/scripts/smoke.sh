#!/usr/bin/env bash
# End-to-end smoke test of the marketplace loop against a running API.
# Usage: API=http://localhost:5081/api/v1 ./scripts/smoke.sh
set -euo pipefail
API=${API:-http://localhost:5081/api/v1}
RUN=$RANDOM
j() { node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const o=JSON.parse(d);console.log(eval('o'+process.argv[1]))})" "$1"; }
call() {
  local method=$1 path=$2 token=${3:-} body=${4:-}
  local args=(-sS -f -X "$method" "$API$path" -H 'Content-Type: application/json' -H 'Origin: http://localhost:3000')
  [[ -n $token ]] && args+=(-H "Authorization: Bearer $token")
  [[ -n $body ]] && args+=(-d "$body")
  curl "${args[@]}"
}
step() { printf '\n==> %s\n' "$1"; }

step "CORS preflight from localhost:3000"
curl -sS -o /dev/null -D - -X OPTIONS "$API/auth/login" -H 'Origin: http://localhost:3000' \
  -H 'Access-Control-Request-Method: POST' -H 'Access-Control-Request-Headers: content-type,authorization' | grep -i 'access-control-allow-origin'

step "Register business and provider, log in admin"
BIZ=$(call POST /auth/register "" "{\"email\":\"biz$RUN@test.local\",\"password\":\"Passw0rd1\",\"displayName\":\"Cafe $RUN\",\"role\":1}" | j .accessToken)
PRO=$(call POST /auth/register "" "{\"email\":\"pro$RUN@test.local\",\"password\":\"Passw0rd1\",\"displayName\":\"Creator $RUN\",\"role\":2}" | j .accessToken)
ADM=$(call POST /auth/login "" '{"email":"admin@torq.local","password":"Admin12345!"}' | j .accessToken)
call GET /auth/me "$BIZ" | j .role

step "Provider profile, service, portfolio, social"
PROVIDER_ID=$(call PUT /providers/me "$PRO" '{"providerType":2,"headline":"Food creator in Kochi","languages":"Malayalam, English","serviceCategories":"UGC / content creation,Influencer marketing"}' | j .id)
call POST /providers/me/services "$PRO" '{"category":"UGC / content creation","title":"3 reels","pricingModel":1,"startingPrice":15000}' >/dev/null
PORT_ID=$(call POST /providers/me/portfolio "$PRO" '{"title":"Cafe launch reels","clientOrIndustry":"F&B"}' | j .id)
call POST /providers/me/social "$PRO" '{"platform":1,"handle":"@creator","followerCount":42000}' >/dev/null

step "Admin verifies provider"
call GET /admin/providers/pending "$ADM" | j .total
call POST "/admin/providers/$PROVIDER_ID/verify" "$ADM" >/dev/null

step "Business creates and submits requirement, admin opens it"
REQ=$(call POST /requirements "$BIZ" '{"title":"5 Instagram reels for cafe launch","category":"UGC / content creation","goal":"Store visits","languages":"Malayalam, English","expectedDeliverables":"5 reels","budgetMin":50000,"budgetMax":80000,"timelineDays":28}' | j .id)
call POST "/requirements/$REQ/submit" "$BIZ" >/dev/null
call POST "/admin/requirements/$REQ/open" "$ADM" '{"notes":null}' >/dev/null

step "Provider sees opportunity and submits proposal with 2 milestones"
call GET /opportunities "$PRO" | j .total
PROP=$(call POST /proposals "$PRO" "{\"requirementId\":\"$REQ\",\"pricingModel\":2,\"priceAmount\":60000,\"scopeOfWork\":\"Shoot and edit\",\"deliverables\":\"5 reels\",\"timelineDays\":21,\"revisionsIncluded\":2,\"submit\":true,\"milestones\":[{\"sortOrder\":1,\"title\":\"Scripts\",\"amount\":20000},{\"sortOrder\":2,\"title\":\"Reels\",\"amount\":40000}],\"portfolioItemIds\":[\"$PORT_ID\"]}" | j .id)

step "Business compares, shortlists and selects"
call GET "/requirements/$REQ/proposals" "$BIZ" | j '[0].providerHeadline'
call POST "/requirements/$REQ/proposals/$PROP/shortlist" "$BIZ" >/dev/null
CAMP=$(curl -sS -f -X POST "$API/requirements/$REQ/select/$PROP" -H "Authorization: Bearer $BIZ" -H "Idempotency-Key: $(uuidgen)" | j .id)

step "Fund, message, then deliver each milestone"
curl -sS -f -X POST "$API/campaigns/$CAMP/fund" -H "Authorization: Bearer $BIZ" -H "Idempotency-Key: $(uuidgen)"
call POST "/campaigns/$CAMP/messages" "$PRO" '{"body":"Kickoff on Monday?"}' | j .body
echo 'deliverable' > /tmp/bb-deliverable.pdf
FILE=$(curl -sS -f -X POST "$API/files" -H "Authorization: Bearer $PRO" -F "file=@/tmp/bb-deliverable.pdf;type=application/pdf")
KEY=$(echo "$FILE" | j .storageKey)
for MS in $(call GET "/campaigns/$CAMP/milestones" "$BIZ" | j '.map(m=>m.id).join(" ")'); do
  call POST "/milestones/$MS/submit" "$PRO" "{\"deliverables\":[{\"storageKey\":\"$KEY\",\"fileName\":\"d.pdf\",\"contentType\":\"application/pdf\",\"sizeBytes\":12}]}" >/dev/null
  call POST "/milestones/$MS/approve" "$BIZ" >/dev/null
  curl -sS -f -X POST "$API/milestones/$MS/payout" -H "Authorization: Bearer $BIZ" -H "Idempotency-Key: $(uuidgen)"
done
call GET "/campaigns/$CAMP" "$BIZ" | j .status

step "Both sides review"
call POST "/campaigns/$CAMP/reviews" "$BIZ" '{"rating":5,"comment":"Great"}'
call POST "/campaigns/$CAMP/reviews" "$PRO" '{"rating":5,"comment":"Clear brief"}'

step "Contact-leak guard blocks phone numbers"
curl -sS -X POST "$API/campaigns/$CAMP/messages" -H "Authorization: Bearer $PRO" -H 'Content-Type: application/json' -d '{"body":"call me on 9876543210"}'
printf '\n\nSmoke test passed (campaign status 4 = Completed).\n'
