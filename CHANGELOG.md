# Changelog

## 0.14.0 (2026-06-17)

### Added

- **Agent → Custom Role ID**: optional field on the Agent **Create** and
  **Update** operations to assign a NooviChat-native Custom Role (Funcao
  Personalizada) to an agent, layering granular permissions on top of the base
  `agent`/`administrator` role. The id is sent at the request body root (outside
  the `agent` wrapper), matching how Chatwoot reads `custom_role_id`; `0` skips
  it and foreign-account ids are ignored server-side. Manage the roles
  themselves via the `/custom_roles` API (documented in the Site reference).

## 0.13.0 (2026-06-17)

### Added

- **Follow-up → Create Template Item**: new operation to add a step to a
  follow-up template (`POST /follow-up-templates/:id/items`). Supports the step
  types text/image/audio/video/document and the new **whatsapp_template** type —
  a step that references a Meta-approved WhatsApp template (name/language/
  namespace + a BODY parameter mapping via JSON) and sends it on an official
  WhatsApp inbox outside the 24h window, falling back to the Content text on
  non-official providers (WAHA/UazAPI) or inside the window. Mirrors the Chatwoot
  follow-up template item contract.

## 0.12.0 (2026-06-13)

### Added (downstream parity with the API docs + MCP audit 2026-06-13)

- **Commercial Analysis** resource: Generate (async, 202 + report id),
  Get Many (filter by inbox, paginated), Get Status (poll), Get (full
  9-section report) and Delete. Mirrors `/api/v1/accounts/:id/commercial-analyses`.
  The PDF export is intentionally not exposed (binary payload).
- **Sequence** resource (pipeline activity-sequences attached to a card):
  Get Many, Start, Start (External, with free-form context), Pause, Resume,
  Complete Step and Cancel. Closes the parity gap with the MCP server, which
  already exposed these. Requires the `pipeline_sequences` operational account authorization (403
  otherwise); a duplicate active sequence of the same definition returns 422.
- **Contact**: `Source ID` field on Create (sets the contact_inbox external id
  alongside Inbox ID) and an `Include Contact Inboxes` toggle on Get / Get Many
  / Search (adds each contact's inbox associations to the response).

## 0.8.4 (2026-05-24)

### Fixed (medium-severity bugs from the audit pass)

- **Trigger · HMAC signature validation**: was reading `x-hub-signature`
  and signing with `JSON.stringify(body)` (body-only). Backend
  (`lib/webhooks/trigger.rb:46-50`) sends `X-Chatwoot-Signature` +
  `X-Chatwoot-Timestamp` and signs `"${timestamp}.${body}"`. When a
  `webhookSecret` was configured, the trigger silently dropped 100%
  of events. The credential is optional and rarely configured, so
  most users were not affected — but it was a latent bomb.
  Fix: read canonical headers, sign with timestamp prefix, fail-closed
  when timestamp missing.
- **Conversation · ID label**: renamed "Conversation ID" → "Conversation
  Display ID" with placeholder + description clarifying that the
  backend (`conversations_controller.rb:232`) looks up by `display_id`
  (the short public number in the URL like `/conversations/12345`),
  not the internal primary key. Users who passed the internal `id`
  returned by other endpoints saw confusing 404s.
- **Campaign · ID label**: same fix — backend uses `display_id`
  (`campaigns_controller.rb:30`).
- **Appointment · Update**: removed `professionalId` and `serviceId`
  fields from the Update Fields collection. Backend `update_params`
  (`appointments_controller.rb:287-291`) intentionally excludes them
  (only `scheduled_at, ends_at, notes, partner_id, custom_attributes`
  are permitted). Sending them was silently dropped — workflows
  "changing the professional" saw 200 OK but no actual change.
  To change professional or service, cancel the appointment and
  create a new one. Added `customAttributes` field that backend
  actually accepts.

### Notes

- All 4 fixes are backwards-compatible at the workflow level
  (the removed/relabelled fields never produced the result users
  expected). HMAC fix only affects users with `nooviChatWebhookApi`
  credential configured — and those were silently broken in 0.8.3.
- 4 regression tests added (1 HMAC valid signature, 1 HMAC missing
  timestamp, 2 appointment.update body shape). Test suite total:
  143 → 147.

---

## 0.8.3 (2026-05-24)

### Fixed (6 silent data-loss bugs surfaced by full audit)

- **SLA · Create/Update Policy**: node was sending `first_response_time`,
  `resolution_time`, `inbox_ids` — but backend strong params accept
  `first_response_time_threshold`, `next_response_time_threshold`,
  `resolution_time_threshold`, `only_during_business_hours`, `description`.
  All three fields the node sent were silently dropped by Rails, leaving
  every SLA created via n8n with no thresholds at all (only `name` persisted).
  Field names renamed to match backend; `inboxIds` removed (never existed in
  schema); new fields exposed: `nextResponseTimeThreshold`,
  `onlyDuringBusinessHours`, `policyDescription`.
- **SLA · Get Metrics + Export CSV**: node sent `start_date`/`end_date`
  query params but backend (`applied_slas_controller.rb` +
  `DateRangeHelper`) reads `since`/`until` in unix epoch seconds. Date
  filter silently ignored, both endpoints returned full historical data
  regardless of UI selection. Now converts ISO strings to epoch seconds
  and sends `since`/`until`. Numeric epoch values pass through unchanged.
- **Activity · Get Analytics**: same shape of bug — node sent
  `start_date`/`end_date`, backend reads `date_from`/`date_to`. Analytics
  always defaulted to last 30 days instead of selected window. Renamed.
- **Service · Reminder Templates**: 4 standalone operations
  (`listReminders`, `createReminder`, `updateReminder`, `deleteReminder`)
  were calling `/services/:id/reminder_templates[/:id]` routes that **do
  not exist** in `config/routes.rb` — every call returned 404 (Rails
  RoutingError). Removed the 4 broken operations. The actual backend
  contract is: submit `reminder_templates: [...]` array nested in the
  `service.create`/`service.update` payload, and backend's
  `sync_reminder_templates` replaces the entire set. Exposed via a new
  `Reminder Templates` fixedCollection on create/update.
- **Card · Get Many**: filters `assigneeId` and `status` were sent as
  query params but backend (`pipeline_cards_controller.rb`
  `SUPPORTED_INDEX_FILTERS`) only accepts `pipeline_id, pipeline_stage,
  contact_id, conversation_display_id, exclude_id, limit, offset, cursor`.
  Backend silently logs an unsupported-filter warning and proceeds — the
  workflow received ALL cards in the account, not the filtered set.
  This is the same class of bug as incident
  2026-04-14-pipeline-cards-contact-id-filter-ignored. The unsupported
  filters were removed from the UI; added `contactId` and
  `conversationDisplayId` filters which the backend actually supports.
- **Card · Get Many** pagination: node was sending `per_page` but legacy
  controller honors `limit`/`offset`/`cursor` (ignores `per_page`).
  Renamed query param to `limit`.

### Notes

- **All 6 are silent data-loss bugs** — backend returned 200/204 OK so
  the user never saw any error, but the operation didn't do what the
  UI promised. This is the worst class of bug because workflows pass
  CI/smoke tests yet produce wrong production data.
- **Backwards-incompatible UI changes** (acceptable because the broken
  fields didn't work anyway): SLA `firstResponseTime` →
  `firstResponseTimeThreshold` (etc.); SLA `inboxIds` removed; Service
  reminder ops 4× removed; Card filters `assigneeId`/`status` removed.
  Workflows that referenced these never worked correctly in 0.8.x;
  the rename surfaces a clear error in the n8n editor instead of
  silently passing.
- **No behaviour change for endpoints that already worked**. Other
  resources untouched.
- 8 regression tests added covering all 6 fixes. Test suite total:
  135 → 143.

### Audit methodology

Auditoria de payloads, IDs, query params e headers validada diretamente
contra os controllers antes de aceitar cada achado. False positives foram
filtrados — apenas bugs confirmados entraram neste patch.

---

## 0.8.2 (2026-05-24)

### Fixed

- **Webhook · Get Many returned empty**: backend `webhooks#index` returns
  `{ payload: { webhooks: [...] } }` (nested object, not array), which the
  pagination helper didn't recognize — `Get Many` returned `[]` even when
  webhooks existed. As a downstream consequence, the Trigger node's
  `checkExists` failed → tried to recreate the same URL → backend rejected
  with `422 — Url has already been taken`. Fix: generic `extractItems()`
  helper now walks the response and accepts:
  - `{ data: { payload: [...] } }`
  - `{ data: [...] }`
  - `{ payload: [...] }`
  - `{ payload: { <resource>: [...] } }` ← **new (covers webhooks)**
  - `{ activities: [...], meta: {...} }`
  - `{ <resource>: [...], meta: {...} }` ← **new (covers teams, etc)**
  - `[...]` bare array

### Notes

- This unblocks workflows that subscribe webhooks via the Trigger node
  on accounts that already had any webhook registered (the silent empty
  response made the Trigger think no webhook existed and try to create a
  duplicate, hitting the unique-URL constraint).
- 2 regression tests added (1 for webhooks shape, 1 for teams-like shape).
  Test suite total: 133 → 135.
- No behaviour change for endpoints that already worked; the new
  `extractItems()` checks the previous fallbacks in the same order before
  falling through to the new tiers.

---

## 0.8.1 (2026-05-24)

### Fixed

- **WhatsApp Templates · Delete**: operation was hitting `/whatsapp_templates/0`
  which doesn't exist (Rails router has `delete :destroy` on the collection,
  not the member). Fixed to call `DELETE /whatsapp_templates?inbox_id=…&template_name=…`.
- **WAHA · Update Config / Update Meta Tracking**: replaced two broken
  operations (both returned 404 — endpoints never existed on the backend)
  with three operations that match the real backend routes:
  - `Update Chatwoot App Settings` → `PATCH /waha/:id/settings/chatwoot_app`
  - `Update Session Settings` → `PATCH /waha/:id/settings/session`
  - `Update Webhook Settings` → `PATCH /waha/:id/settings/webhook`
  Each accepts a JSON body with hint listing the allowed keys.
- **Activity · Get Many**: returnAll was returning only the first page because
  the backend response shape `{ activities: [...], meta: {...} }` didn't match
  any of the helper's fallbacks. Added `response.activities` to the fallback list.
- **Contacts / Notifications / Audit Logs · Get Many with returnAll**: pagination
  silently truncated to 15 records because the backend ignores `per_page` on
  those endpoints (`RESULTS_PER_PAGE = 15` hardcoded in `contacts_controller.rb`).
  Added per-endpoint page size override table so the `length < pageSize`
  termination check works correctly.
- **Appointment · Export**: removed. Backend returns 501 Not Implemented
  (the CSV export is a TODO without an ETA). Will be re-added when the
  backend implements it.

### Improved

- **Pagination MAX_PAGES sentinel**: when pagination hits the 10000-record
  safety cap, the returned array now ends with a sentinel item
  `{ _truncated: true, _truncated_reason, _truncated_endpoint }` so
  downstream workflows can detect silent truncation. Previously the cap
  was hit without warning.
- **Credential test diagnostics**: the credential test now provides
  specific guidance for 401 ("token rejected"), 403 ("token lacks
  permission"), and 404 ("baseUrl is wrong") responses instead of n8n's
  generic "Authentication failed" message.

### Notes

- All 7 fixes are backwards compatible at the workflow level. The only
  user-visible removal (`Appointment.export`) was non-functional in v0.8.0
  (501 from backend); no working workflow depended on it.
- The two WAHA operations renamed in this release (`updateConfig`,
  `updateMetaTracking`) were also non-functional in v0.8.0 (404 from
  backend); workflows that used them were already broken.
- 9 new tests added covering: WAHA settings paths, WhatsApp templates
  delete collection route, contacts/notifications/audit_logs page size
  override, activities response shape fallback, MAX_PAGES sentinel.
  Test suite total: 124 → 133.

---

## 0.8.0 (2026-05-01)

### Added

- New operation: `Get Contact History` on Appointment resource — fetches
  paginated chronological appointment history for a contact via
  `GET /api/v1/accounts/:id/contacts/:contact_id/appointment_history`
- New filter: `pipeline_card_id` on Appointment List operation — fetch
  appointments linked to a specific pipeline card (Pipeline Pro
  integration)

### Notes

- Server-side feature additions match Chatwoot release adding the
  `appointment_history` endpoint and `pipeline_card_id` filter
- Webhook events `reminder.sent` and `reminder.failed` (declared in
  v0.7.0) are now functionally dispatched by the server-side cron job
- Past `scheduled_at` and invalid status transitions return 422 errors;
  workflows should handle these as user-correctable validation errors

---

## 0.7.0 (2026-04-30)

### Added

- New resource: **Appointment** (10 operations: create, get, list, update, cancel,
  confirm, complete, noShow, availability, export)
- New resource: **Professional** (6 operations: create, get, list, update, delete, availability)
- New resource: **Service** (9 operations: create, get, list, update, delete +
  nested reminder_templates subresource: listReminders, createReminder, updateReminder,
  deleteReminder)
- New resource: **Partner** (5 operations: create, get, list, update, delete)
- 13 new trigger events:
  - `appointment.created`, `appointment.updated`, `appointment.confirmed`,
    `appointment.completed`, `appointment.cancelled`, `appointment.no_show`,
    `appointment.rescheduled`
  - `reminder.sent`, `reminder.failed`
  - `professional.created`, `professional.updated`
  - `service.created`, `service.updated`

### Notes

- Atendimentos is authorized by the NooviChat license/account operational
  state. When the account is not authorized, the API may return HTTP 403.
- Plans do not change the feature set; the Site heartbeat or SuperAdmin can
  synchronize the operational authorization state for the account.
- Referência interna de implementação removida da documentação pública.

---

## 0.6.1 and earlier

See git log for previous change history.
