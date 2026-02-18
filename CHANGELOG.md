# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
