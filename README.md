# n8n-nodes-noovichat

[![npm version](https://badge.fury.io/js/@nooviai%2Fn8n-nodes-noovichat.svg)](https://badge.fury.io/js/@nooviai%2Fn8n-nodes-noovichat)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

n8n community node for **NooviChat** — customer engagement, pipeline CRM, lead scoring and WhatsApp integration.

Covers all standard Chatwoot-compatible endpoints **plus** exclusive NooviChat features: Pipeline/CRM, Follow-ups, Lead Scoring, Activities, WAHA, Campaigns and SLA — none of which are available in existing Chatwoot nodes.

---

## Features

### Base Resources (Chatwoot compatible)

| Resource | Operations |
|----------|------------|
| **Conversation** | Create, Get, Get Many, Update, Delete, Assign, Toggle Status, Add Label, Filter |
| **Message** | Send (text / template / attachment), Get Many, Delete |
| **Contact** | Create, Get, Get Many, Update, Delete, Search, Filter, Merge, Get Conversations |
| **Inbox** | Create, Get, Get Many, Update, Delete, Get Agents, Update Agents |
| **Agent** | Create, Get Many, Update, Delete |
| **Team** | Create, Get Many, Update, Delete, Get Members, Add Members |
| **Label** | Create, Get Many, Update, Delete |
| **Canned Response** | Create, Get Many, Delete |
| **Custom Attribute** | Create, Get Many, Update, Delete |
| **Webhook** | Create, Get Many, Update, Delete |

### Exclusive NooviChat Features

| Resource | Operations |
|----------|------------|
| **Pipeline** | Create, Get, Get Many, Update, Delete + Stage CRUD + Stage Reorder + Analytics (dashboard, win rate, conversion, velocity, team performance, lost reasons) |
| **Deal** | Create, Get, Get Many, Update, Delete, Move to Stage, Mark Won, Mark Lost, Reopen, Get Timeline, Bulk Update, Bulk Move |
| **Follow-up** | Create, Get Many, Update, Delete, Cancel + Template CRUD + Template Preview |
| **Activity** | Create, Get, Get Many, Update, Delete, Start, Complete, Cancel, Get Analytics |
| **Lead Scoring** | Create Rule, Get Many Rules, Update Rule, Delete Rule, Create Defaults, Get Dashboard |
| **Campaign** | Create, Get, Get Many, Update, Delete (one_off and ongoing types) |
| **SLA** | Create Policy, Get Policy, Get Many Policies, Update Policy, Delete Policy, Get Applied, Get Metrics, Export CSV |
| **WAHA** | Get Status, Refresh QR, Start, Stop, Reconnect, Disconnect, Update Config, Get Settings, Update Meta Tracking |

### Trigger Node

Automatically registers and removes webhooks via the NooviChat API when you activate/deactivate a workflow. Supports all 21 events:

**Standard events:** `conversation_created`, `conversation_status_changed`, `conversation_updated`, `conversation_typing_on`, `conversation_typing_off`, `message_created`, `message_updated`, `contact_created`, `contact_updated`, `webwidget_triggered`

**Exclusive NooviChat events:** `pipeline_card_created`, `pipeline_card_updated`, `pipeline_card_stage_changed`, `pipeline_card_won`, `pipeline_card_lost`, `follow_up_due`, `follow_up_overdue`, `activity_due`, `sla_breach`, `waha_status_changed`, `campaign_completed`

Optional filters by Inbox ID, Team ID, and Pipeline ID. Optional webhook signature validation via shared secret.

---

## Installation

### Via n8n Community Nodes (Recommended)

1. Go to **Settings** > **Community Nodes**
2. Click **Install**
3. Enter `@nooviai/n8n-nodes-noovichat`
4. Click **Install**

### Via npm (self-hosted n8n)

```bash
npm install @nooviai/n8n-nodes-noovichat
```

---

## Configuration

### Credentials — NooviChat API

1. Go to **Credentials** > **Add Credential** > search **NooviChat API**
2. Fill in:
   - **Base URL** — Your NooviChat instance (e.g. `https://chat.yourdomain.com`)
   - **API Access Token** — Found in NooviChat under Settings > Account Settings
   - **Account ID** — Your numeric account ID (usually `1`)

### Credentials — NooviChat Webhook API (optional)

Used only with the **NooviChat Trigger** node to validate incoming webhook signatures.

1. Add Credential > search **NooviChat Webhook API**
2. Fill in **Webhook Secret** — The same secret you configure in NooviChat webhooks settings

---

## Workflow Examples

### 1. Lead Qualification Automation

```
Trigger: NooviChat Trigger — Contact Created
  → NooviChat — Deal: Create (in "Leads" pipeline)
  → NooviChat — Follow-up: Create (due in 3 days)
  → NooviChat — Deal: Get Lead Score
  → IF score >= 70
    → NooviChat — Deal: Move to Stage ("Qualified")
    → NooviChat — Conversation: Assign (to Sales team)
  → ELSE
    → NooviChat — Conversation: Add Label ("nurturing")
```

### 2. Automatic Follow-up

```
Trigger: NooviChat Trigger — Follow-up Due
  → NooviChat — Conversation: Get
  → IF last message older than 24h
    → NooviChat — Message: Send (template "follow_up_24h")
    → NooviChat — Follow-up: Create (due in 48h)
  → ELSE
    → NooviChat — Follow-up: Cancel
```

### 3. Pipeline + WhatsApp (Deal Won)

```
Trigger: NooviChat Trigger — Deal Won
  → NooviChat — Contact: Get (contact linked to deal)
  → NooviChat — Message: Send ("Congratulations! Your order was confirmed.")
  → NooviChat — Conversation: Add Label ("active-client")
  → NooviChat — Conversation: Toggle Status (resolved)
```

### 4. WAHA Session Monitoring

```
Schedule Trigger: Every 5 minutes
  → NooviChat — WAHA: Get Status (your WhatsApp inbox)
  → IF status != "WORKING"
    → NooviChat — WAHA: Reconnect
    → Wait: 30 seconds
    → NooviChat — WAHA: Get Status again
    → IF still != "WORKING"
      → Slack — Send message to #alerts: "WAHA disconnected on inbox X"
```

### 5. Weekly SLA Report

```
Schedule Trigger: Every Monday at 9am
  → NooviChat — SLA: Get Metrics (last 7 days)
  → IF hit_rate < 80%
    → Email — Send report to manager
    → NooviChat — Activity: Create ("Review SLA compliance")
```

---

## Development

```bash
# Clone
git clone https://github.com/nooviai/n8n-nodes-noovichat.git
cd n8n-nodes-noovichat

# Install dependencies
npm install

# Build
npm run build

# Watch mode
npm run dev

# Lint
npm run lint

# Tests
npm test
npm test -- --coverage
```

### Local Testing with n8n

```bash
# Build
npm run build

# Link package globally
npm link

# In your n8n directory
npm link @nooviai/n8n-nodes-noovichat
```

---

## Compatibility

| Requirement | Version |
|-------------|---------|
| n8n | >= 1.0.0 |
| Node.js | >= 18.0.0 |
| NooviChat API | >= v4.10.0 |

---

## Resources

- [NooviChat Documentation](https://doc.nooviai.com)
- [NooviChat API Reference](https://doc.nooviai.com/docs/noovichat/reference/)
- [n8n Community Nodes Guide](https://docs.n8n.io/integrations/community-nodes/build-community-nodes/)
- [n8n Documentation](https://docs.n8n.io)

---

## License

MIT — see [LICENSE](LICENSE) for details.

## Support

- **Issues**: [GitHub Issues](https://github.com/nooviai/n8n-nodes-noovichat/issues)
- **Email**: contato@nooviai.com
- **Website**: [nooviai.com](https://nooviai.com)
