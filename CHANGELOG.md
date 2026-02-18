# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.8] - 2026-02-18

### Fixed
- **`conversation.create`**: campos `assigneeId`/`teamId` agora são mapeados para `assignee_id`/`team_id` antes de enviar à API (antes eram enviados em camelCase e ignorados)
- **`conversation.update`**: operação simplificada para aceitar apenas `priority` via `PATCH /conversations/:id` — único campo que a API aceita neste endpoint; status, assignee e team já possuem operações dedicadas (`Toggle Status`, `Assign`)
- **`leadScoring.createRule` / `updateRule`**: campos completamente corrigidos para corresponder ao modelo real da API:
  - `score` → `points` (campo correto no modelo `LeadScoreRule`)
  - `conditionType` → `eventType` com enum correto (`message_received`, `card_created`, `stage_changed`, etc.)
  - `conditionValue` → `conditions` (JSONB flexível com operadores: `eq`, `neq`, `in`, etc.)
  - Removida opção `deal_stage` que não existe na API

## [0.3.7] - 2026-02-18

### Fixed
- **Follow-up member operations** (`get`, `update`, `delete`, `cancel`) now use conversation-scoped URLs (`/conversations/:id/follow-ups/:id`) — account-level member endpoints do not exist in the API
- Added required `Conversation ID` field to follow-up `get`, `update`, `delete`, `cancel` operations in the UI
- **Bulk card operations** (`bulkUpdate`, `bulkMove`, `bulkDelete`) rewritten as loops over individual API calls — bulk endpoints do not exist in the NooviChat API
- **Message `content_type`** options corrected to the actual Chatwoot enum values: `text`, `input_text`, `input_textarea`, `input_email`, `input_select`, `cards`, `form`, `article` (were incorrectly set to attachment file types)
- `ActivityDescription`: field name `dealId` → `cardId` to match handler (card_id was never sent to the API)
- `AgentDescription`: removed `availability` from the `create` operation (API does not accept it at agent creation)

## [0.3.6] - 2026-02-18

### Changed
- **Breaking**: Renamed resource `deal` → `card` throughout (field `dealId` → `cardId`, `dealIds` → `cardIds`, file `DealDescription.ts` → `CardDescription.ts`)
- Trigger events renamed: "Deal Created/Won/Lost/Updated/Stage Changed" → "Card Created/Won/Lost/Updated/Stage Changed"
- README updated to reflect Card terminology

### Fixed
- All remaining Portuguese text in description files (Pipeline, FollowUp, Waha, SLA, CannedResponse)

## [0.2.0] - 2026-02-18

### Added
- Convert date/time fields to `dateTime` type for proper date picker UI
- Replace comma-separated ID fields with `fixedCollection` (multipleValues)
- New operations: `followUp.get`, `leadScoring.getRule`, `deal.bulkDelete`, `campaign.pause`, `campaign.resume`
- Group optional fields under `additionalFields` collections (Deal, Activity, Campaign)

### Changed
- Account ID moved from credentials to node parameter (supports expressions for multi-account workflows)

### Fixed
- GenericFunctions test mock updated for `getNodeParameter` method

## [0.1.2] - 2026-02-17

### Added
- Bulk stage creation in `createStage` using `fixedCollection` with multiple values

## [0.1.1] - 2026-02-17

### Changed
- Account ID moved from credential to node parameter to support n8n expressions

## [0.1.0] - 2026-02-17

### Added
- Initial release with 18 resources and 100+ operations
- Resources: Conversation, Message, Contact, Inbox, Agent, Team, Label, Canned Response, Custom Attribute, Webhook, Pipeline, Deal, Follow-up, Activity, Lead Scoring, Campaign, SLA, WAHA
- NooviChat Trigger node with 21 webhook events
- Webhook signature validation support
