# Changelog

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

- Atendimentos module on the Chatwoot side requires
  `account.enable_features!(:appointments_module)`. Without the flag,
  endpoints return `403 feature_not_enabled`.
- The plan tier (trimestral+) auto-enables via heartbeat from Site backend;
  alternatively SuperAdmin enables manually per account.
- Refs: Roadmap/internal/chatwoot/fase-07-atendimentos.md (FX2)

---

## 0.6.1 and earlier

See git log for previous change history.
