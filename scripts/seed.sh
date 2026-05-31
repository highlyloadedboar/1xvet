#!/usr/bin/env bash
# Seeds the 1xVet API with demo data: 5 vets with slots, 3 owners with pets,
# a couple of pre-booked slots and one ongoing chat.
#
# Usage:
#   ./scripts/seed.sh [BASE_URL]
#
# Defaults to http://111.88.254.81:8080 (dev stand). Requires curl and jq.
# Safe to re-run — conflicts on existing emails / slots / pets are skipped.

set -uo pipefail

BASE_URL="${1:-http://111.88.254.81:8080}"
PASSWORD="TestPass1234"

if ! command -v jq >/dev/null 2>&1; then
  echo "jq is required" >&2
  exit 1
fi

# --- API helpers -------------------------------------------------------------

api_request() {
  local method="$1"
  local path="$2"
  local token="${3:-}"
  local body="${4:-}"
  local args=(-sS -X "$method" -w "\n%{http_code}" "$BASE_URL$path"
    -H "Content-Type: application/json")
  [[ -n "$token" ]] && args+=(-H "Authorization: Bearer $token")
  [[ -n "$body" ]] && args+=(-d "$body")
  curl "${args[@]}"
}

# Echoes "<json>\n<status>". Caller separates with `tail -n1` and `sed '$d'`.
http_status() { tail -n1 <<<"$1"; }
http_body() { sed '$d' <<<"$1"; }

register_or_login() {
  local email="$1"
  local first="$2"
  local last="$3"
  local role="$4"
  local body
  body=$(jq -nc \
    --arg email "$email" --arg password "$PASSWORD" \
    --arg first "$first" --arg last "$last" --arg role "$role" \
    '{email:$email,password:$password,firstName:$first,lastName:$last,role:$role}')
  local resp status
  resp=$(api_request POST /api/auth/register "" "$body")
  status=$(http_status "$resp")
  if [[ "$status" == "201" ]]; then
    http_body "$resp"
    return
  fi
  if [[ "$status" == "409" ]]; then
    body=$(jq -nc --arg email "$email" --arg password "$PASSWORD" \
      '{email:$email,password:$password}')
    resp=$(api_request POST /api/auth/login "" "$body")
    if [[ "$(http_status "$resp")" == "200" ]]; then
      http_body "$resp"
      return
    fi
  fi
  echo "Failed to register or login $email: $resp" >&2
  return 1
}

# Update vet profile (idempotent — service auto-creates on first PUT).
upsert_vet_profile() {
  local token="$1"
  local specialty="$2"
  local exp="$3"
  local desc="$4"
  local edu="$5"
  local price="$6"
  local body
  body=$(jq -nc \
    --arg s "$specialty" --argjson e "$exp" \
    --arg d "$desc" --arg edu "$edu" --argjson p "$price" \
    '{specialty:$s,experienceYears:$e,description:$d,education:$edu,priceRub:$p,available:true}')
  api_request PUT /api/vet/profile "$token" "$body" >/dev/null
}

create_slot() {
  local token="$1"
  local iso="$2"
  local body
  body=$(jq -nc --arg t "$iso" '{startTime:$t}')
  local resp status
  resp=$(api_request POST /api/vet/slots "$token" "$body")
  status=$(http_status "$resp")
  case "$status" in
    201) jq -r '.id' <<<"$(http_body "$resp")" ;;
    409) echo "skip" ;;
    *) echo "slot create failed [$status]: $(http_body "$resp")" >&2; echo "fail" ;;
  esac
}

# Idempotent pet creation: skip if a pet with the same name already exists.
upsert_pet() {
  local token="$1"
  local name="$2"
  local species="$3"
  local breed="$4"
  local existing
  existing=$(api_request GET /api/pets "$token" "")
  if [[ "$(http_status "$existing")" == "200" ]]; then
    local found
    found=$(http_body "$existing" | jq -r --arg n "$name" '.[] | select(.name == $n) | .id' | head -n1)
    if [[ -n "$found" ]]; then
      echo "$found"
      return
    fi
  fi
  local body
  body=$(jq -nc --arg n "$name" --arg s "$species" --arg b "$breed" \
    '{name:$n,species:$s,breed:$b}')
  local resp
  resp=$(api_request POST /api/pets "$token" "$body")
  if [[ "$(http_status "$resp")" == "201" ]]; then
    jq -r '.id' <<<"$(http_body "$resp")"
  else
    echo "pet create failed: $resp" >&2
    echo "0"
  fi
}

book_slot() {
  local owner_token="$1"
  local slot_id="$2"
  local pet_id="$3"
  local reason="$4"
  local body
  body=$(jq -nc --argjson s "$slot_id" --argjson p "$pet_id" --arg r "$reason" \
    '{slotId:$s,petId:$p,reason:$r}')
  local resp
  resp=$(api_request POST /api/appointments "$owner_token" "$body")
  case "$(http_status "$resp")" in
    201) echo "  booked slot $slot_id" ;;
    409) echo "  slot $slot_id already booked (skip)" ;;
    *) echo "  booking failed: $resp" >&2 ;;
  esac
}

create_conversation() {
  local token="$1"
  local other_user_id="$2"
  local body
  body=$(jq -nc --argjson u "$other_user_id" '{otherUserId:$u}')
  local resp
  resp=$(api_request POST /api/conversations "$token" "$body")
  if [[ "$(http_status "$resp")" == "200" ]]; then
    jq -r '.id' <<<"$(http_body "$resp")"
  else
    echo "conversation failed: $resp" >&2
    echo "0"
  fi
}

send_message() {
  local token="$1"
  local conv_id="$2"
  local content="$3"
  local body
  body=$(jq -nc --arg c "$content" '{content:$c}')
  api_request POST "/api/conversations/$conv_id/messages" "$token" "$body" >/dev/null
}

# Returns "<token> <userId>" given a register/login response body.
parse_account() {
  jq -r '"\(.token) \(.user.id)"' <<<"$1"
}

# --- Data --------------------------------------------------------------------

echo "Seeding $BASE_URL"

# Future timestamps for slots (UTC, ISO 8601).
gen_slot_times() {
  local vet_index="$1"
  local base_hour=$((9 + vet_index)) # vet 0 starts 09:00 UTC, vet 4 at 13:00
  for day in 1 2 3 4 5; do
    for hour_offset in 0 3; do
      local h=$((base_hour + hour_offset))
      # macOS / GNU date both accept -u + -v / -d. Use python for portability.
      python3 -c "
import datetime as dt
t = dt.datetime.now(dt.UTC).replace(minute=0, second=0, microsecond=0) + dt.timedelta(days=$day)
t = t.replace(hour=$h)
print(t.strftime('%Y-%m-%dT%H:%M:%S') + 'Z')
"
    done
  done
}

# Vets
VETS=(
  "Анна Соколова|Терапевт|12|Опытный терапевт. Кошки, собаки. Профилактика и хронические состояния.|МГАВМиБ им. Скрябина, 2012|2000"
  "Михаил Орлов|Дерматолог|9|Кожные заболевания, аллергии, паразитарные инфекции.|СПбГАВМ, 2015|2500"
  "Елена Воронова|Офтальмолог|15|Болезни глаз у мелких животных. Микрохирургия.|МГАВМиБ им. Скрябина, 2009|3000"
  "Дмитрий Семёнов|Педиатр|7|Малыши и подростки: щенки, котята, грызуны. Прививки и сопровождение.|КГАВМ им. Баумана, 2017|1800"
  "Ольга Назарова|Онколог|11|Диагностика и сопровождение онкологии. Паллиативная помощь.|МГАВМиБ им. Скрябина, 2013|3500"
)

declare -a VET_TOKENS
declare -a VET_USER_IDS

for i in "${!VETS[@]}"; do
  IFS='|' read -r full specialty exp desc edu price <<<"${VETS[$i]}"
  first="${full%% *}"
  last="${full##* }"
  email="vet$((i+1))@1xvet.test"
  echo
  echo "Vet $((i+1)): $full ($specialty)"

  account=$(register_or_login "$email" "$first" "$last" "VET") || continue
  read -r token user_id <<<"$(parse_account "$account")"
  VET_TOKENS[$i]="$token"
  VET_USER_IDS[$i]="$user_id"

  upsert_vet_profile "$token" "$specialty" "$exp" "$desc" "$edu" "$price"

  created=0; skipped=0
  while IFS= read -r ts; do
    result=$(create_slot "$token" "$ts")
    if [[ "$result" == "skip" ]]; then ((skipped++)); else ((created++)); fi
  done < <(gen_slot_times "$i")
  echo "  slots: +$created (skipped $skipped)"
done

# Owners
OWNERS=(
  "Мария Кузнецова|Барсик|CAT|Британская короткошёрстная"
  "Денис Ковалёв|Туман|DOG|Сибирский хаски"
  "Ольга Петрова|Локи|CAT|Шотландский вислоухий"
)

declare -a OWNER_TOKENS
declare -a OWNER_USER_IDS
declare -a OWNER_PET_IDS

for i in "${!OWNERS[@]}"; do
  IFS='|' read -r full pet_name pet_species pet_breed <<<"${OWNERS[$i]}"
  first="${full%% *}"
  last="${full##* }"
  email="owner$((i+1))@1xvet.test"
  echo
  echo "Owner $((i+1)): $full"

  account=$(register_or_login "$email" "$first" "$last" "OWNER") || continue
  read -r token user_id <<<"$(parse_account "$account")"
  OWNER_TOKENS[$i]="$token"
  OWNER_USER_IDS[$i]="$user_id"

  pet_id=$(upsert_pet "$token" "$pet_name" "$pet_species" "$pet_breed")
  OWNER_PET_IDS[$i]="$pet_id"
  echo "  pet: $pet_name (id $pet_id)"
done

# Pre-book a couple of slots: owner1 → vet1, owner2 → vet2.
echo
echo "Bookings"
fetch_first_available_slot() {
  local vet_user_id="$1"
  # Public list uses vet_profile.id, but the response includes id we can book.
  # We need vet profile id, so look up via search filter — easier: use /api/vet/slots from vet token.
  local vet_token="$2"
  local resp
  resp=$(api_request GET /api/vet/slots "$vet_token" "")
  if [[ "$(http_status "$resp")" == "200" ]]; then
    http_body "$resp" | jq -r '.[] | select(.booked == false) | .id' | head -n1
  fi
}

if [[ -n "${VET_TOKENS[0]:-}" && -n "${OWNER_TOKENS[0]:-}" ]]; then
  slot=$(fetch_first_available_slot "${VET_USER_IDS[0]}" "${VET_TOKENS[0]}")
  [[ -n "$slot" ]] && book_slot "${OWNER_TOKENS[0]}" "$slot" "${OWNER_PET_IDS[0]}" "Кашель уже неделю, не ест"
fi
if [[ -n "${VET_TOKENS[1]:-}" && -n "${OWNER_TOKENS[1]:-}" ]]; then
  slot=$(fetch_first_available_slot "${VET_USER_IDS[1]}" "${VET_TOKENS[1]}")
  [[ -n "$slot" ]] && book_slot "${OWNER_TOKENS[1]}" "$slot" "${OWNER_PET_IDS[1]}" "Зуд и красные пятна на животе"
fi

# Sample chat: owner3 ↔ vet3 with a few messages (only if conversation has none yet).
echo
echo "Chat"
if [[ -n "${OWNER_TOKENS[2]:-}" && -n "${VET_USER_IDS[2]:-}" ]]; then
  conv_id=$(create_conversation "${OWNER_TOKENS[2]}" "${VET_USER_IDS[2]}")
  if [[ "$conv_id" != "0" ]]; then
    existing=$(api_request GET "/api/conversations/$conv_id/messages" "${OWNER_TOKENS[2]}" "")
    if [[ "$(http_status "$existing")" == "200" ]]; then
      msg_count=$(http_body "$existing" | jq 'length')
      if [[ "$msg_count" == "0" ]]; then
        send_message "${OWNER_TOKENS[2]}" "$conv_id" "Здравствуйте! Локи второй день щурит правый глаз и трёт лапой."
        send_message "${VET_TOKENS[2]}" "$conv_id" "Здравствуйте. Прикрепите, пожалуйста, фото — и расскажите, есть ли выделения."
        send_message "${OWNER_TOKENS[2]}" "$conv_id" "Выделений нет, только лёгкое покраснение."
        echo "  seeded 3 messages in conversation $conv_id"
      else
        echo "  conversation $conv_id already has $msg_count messages (skip)"
      fi
    fi
  fi
fi

echo
echo "Done."
echo
echo "Test accounts (password: $PASSWORD):"
for i in "${!VETS[@]}"; do
  IFS='|' read -r full _ <<<"${VETS[$i]}"
  echo "  VET   vet$((i+1))@1xvet.test — $full"
done
for i in "${!OWNERS[@]}"; do
  IFS='|' read -r full _ <<<"${OWNERS[$i]}"
  echo "  OWNER owner$((i+1))@1xvet.test — $full"
done
