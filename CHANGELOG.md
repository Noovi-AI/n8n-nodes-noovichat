# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2024-01-15

### Added
- Initial release
- Base resources (Chatwoot compatible)
  - Conversation: Create, Get, Get Many, Update, Delete, Assign, Toggle Status, Add Label, Filter
  - Message: Send, Get Many, Delete
  - Contact: Create, Get, Get Many, Update, Delete, Search, Filter, Merge, Get Conversations
  - Inbox: Create, Get, Get Many, Update, Delete, Get Agents, Update Agents
  - Agent: Create, Get Many, Update, Delete
  - Team: Create, Get Many, Update, Delete, Get Members, Add Members
  - Label: Create, Get Many, Update, Delete
  - Canned Response: Create, Get Many, Delete
  - Custom Attribute: Create, Get Many, Update, Delete
  - Webhook: Create, Get Many, Update, Delete
- Exclusive NooviChat resources
  - Pipeline: Full CRUD + stages management
  - Deal: Full CRUD + move to stage, mark won/lost, timeline, bulk operations
  - Follow-up: Full CRUD + templates
  - Activity: Full CRUD + start/complete/cancel + analytics
  - Lead Scoring: Rules management + score calculation + dashboard
  - Campaign: Full CRUD
  - SLA: Policies + applied SLAs + metrics
  - WAHA: Status + connection management + configuration
  - Pipeline Analytics: Dashboard, win rate, conversion, velocity, team performance
- Trigger node with webhook support for all events
- Credentials: NooviChat API and Webhook API