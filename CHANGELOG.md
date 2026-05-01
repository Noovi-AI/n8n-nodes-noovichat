# Changelog

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
