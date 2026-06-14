# n8n-nodes-noovichat

[![npm version](https://badge.fury.io/js/@nooviai%2Fn8n-nodes-noovichat.svg)](https://badge.fury.io/js/@nooviai%2Fn8n-nodes-noovichat)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

n8n community node for **[NooviChat](https://noovichat.com)** — an integration for Chatwoot-based platforms with NooviChat CRM, sales pipeline, lead scoring and WhatsApp automation features.

> **Works with supported Chatwoot-compatible APIs too.** Base operations (Conversations, Contacts, Messages, Inboxes, Agents, Teams, Labels, etc.) target the Chatwoot API shape. NooviChat-only resources require NooviChat.

---

## Why NooviChat instead of other Chatwoot nodes?

| Feature | Other Chatwoot nodes | This node |
|---------|---------------------|-----------|
| Conversations, Contacts, Messages | ✅ | ✅ |
| Inboxes, Agents, Teams, Labels | ✅ | ✅ |
| Canned Responses, Custom Attributes, Webhooks | ✅ | ✅ |
| **Sales Pipeline & Cards** | ❌ | ✅ |
| **Follow-ups & Templates** | ❌ | ✅ |
| **Lead Scoring** | ❌ | ✅ |
| **Activities** | ❌ | ✅ |
| **Campaigns (one-off & ongoing)** | ❌ | ✅ |
| **SLA Policies & Metrics** | ❌ | ✅ |
| **WhatsApp/WAHA Session Management** | ❌ | ✅ |
| **Expanded webhook trigger events** | ❌ (4–6 events) | ✅ |
| **Pipeline & Card webhook events** | ❌ | ✅ |
| **Bulk operations (update, move, delete)** | ❌ | ✅ |
| **Pipeline analytics (win rate, velocity, conversion)** | ❌ | ✅ |

---

## Features

### Base Resources (Chatwoot & NooviChat compatible)

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

### ⭐ Exclusive NooviChat Features

> These resources are **not available in Chatwoot** and are unique to NooviChat. They power a full CRM and sales automation layer on top of the customer engagement platform.

#### 🏆 Sales Pipeline & Cards
Full CRM pipeline management directly from n8n. Create pipelines, manage stages, move cards through the funnel and track every interaction.

| Resource | Operations |
|----------|------------|
| **Pipeline** | Create, Get, Get Many, Update, Delete · Stage CRUD · Stage Reorder · Analytics: dashboard, win rate, conversion rate, velocity, team performance, lost reasons |
| **Card** | Create, Get, Get Many, Update, Delete · Move to Stage · Mark Won / Lost / Reopen · Get Timeline · **Bulk Update · Bulk Move · Bulk Delete** |

#### 📅 Follow-ups & Activities
Never miss a follow-up again. Schedule tasks, track activities and automate reminders tied to cards and conversations.

| Resource | Operations |
|----------|------------|
| **Follow-up** | Create, Get, Get Many, Update, Delete, Cancel · Template CRUD · Template Preview |
| **Activity** | Create, Get, Get Many, Update, Delete · Start · Complete · Cancel · Get Analytics |

#### 🎯 Lead Scoring
Score contacts automatically based on rules and conditions. Build rule-based scoring engines and monitor results via dashboard.

| Resource | Operations |
|----------|------------|
| **Lead Scoring** | Create Rule · Get Many Rules · Update Rule · Delete Rule · Create Defaults · Get Dashboard |

#### 📣 Campaigns
Send targeted messages at scale. Supports both one-off blasts and ongoing automated campaigns.

| Resource | Operations |
|----------|------------|
| **Campaign** | Create, Get, Get Many, Update, Delete, Pause, Resume _(one_off and ongoing types)_ |

#### ⏱ SLA Policies
Define, monitor and export SLA compliance metrics. Set resolution and first-response time targets per inbox.

| Resource | Operations |
|----------|------------|
| **SLA** | Create Policy · Get Policy · Get Many Policies · Update Policy · Delete Policy · Get Applied · Get Metrics · Export CSV |

#### 💬 WhatsApp / WAHA Session Management
Manage WhatsApp sessions directly from your n8n workflows. Monitor connection status, reconnect automatically and configure Meta tracking.

| Resource | Operations |
|----------|------------|
| **WAHA** | Get Status · Refresh QR · Start · Stop · Reconnect · Disconnect · Update Config · Get Settings · Update Meta Tracking |

---

### Trigger Node

Automatically registers and removes webhooks via the NooviChat API when you activate/deactivate a workflow. Supports base Chatwoot events plus NooviChat pipeline, follow-up, broadcast, appointment, SLA and WAHA events.

**Standard events (Chatwoot compatible):**
`conversation_created`, `conversation_status_changed`, `conversation_updated`, `conversation_typing_on`, `conversation_typing_off`, `message_created`, `message_updated`, `contact_created`, `contact_updated`, `webwidget_triggered`

**⭐ Exclusive NooviChat events:**
`pipeline_card_created`, `pipeline_card_updated`, `pipeline_card_stage_changed`, `pipeline_card_won`, `pipeline_card_lost`, `follow_up_due`, `follow_up_overdue`, `activity_due`, `sla_breach`, `waha_status_changed`

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

**Restart n8n** after installing for the node to appear.

#### Docker self-hosted

Install inside the running container:

```bash
docker exec -it <n8n_container> npm install @nooviai/n8n-nodes-noovichat
docker restart <n8n_container>
```

Or add to your `docker-compose.yml` with a custom extensions volume:

```yaml
environment:
  - N8N_CUSTOM_EXTENSIONS=/home/node/.n8n/custom
volumes:
  - n8n_custom:/home/node/.n8n/custom
```

#### Verifying the installation

After restarting n8n, search for **"NooviChat"** in the node selector. If it doesn't appear, check the n8n logs:

```bash
docker logs <n8n_container> | grep -i noovichat
```

---

## Troubleshooting

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for a full guide covering:

- Field mapping reference (camelCase UI → snake_case API)
- API compatibility matrix (NooviChat version vs node version)
- Common errors and solutions (401, 404, 422, webhook issues)

---

## Configuration

### Credentials — NooviChat API

1. Go to **Credentials** > **Add Credential** > search **NooviChat API**
2. Fill in:
   - **Base URL** — Your NooviChat instance (e.g. `https://chat.yourdomain.com`)
   - **API Access Token** — Found in NooviChat under Settings > Account Settings

> **Note:** Account ID is configured **per node instance** (not in credentials), which allows you to use expressions for multi-account workflows.

### Credentials — NooviChat Webhook API (optional)

Used only with the **NooviChat Trigger** node to validate incoming webhook signatures.

1. Add Credential > search **NooviChat Webhook API**
2. Fill in **Webhook Secret** — The same secret you configure in NooviChat webhooks settings

---

## Workflow Examples

### 1. Lead Qualification Automation

```
Trigger: NooviChat Trigger — Contact Created
  → NooviChat — Card: Create (in "Leads" pipeline)
  → NooviChat — Follow-up: Create (due in 3 days)
  → NooviChat — Card: Get Lead Score
  → IF score >= 70
    → NooviChat — Card: Move to Stage ("Qualified")
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

### 3. Pipeline + WhatsApp (Card Won)

```
Trigger: NooviChat Trigger — Card Won
  → NooviChat — Contact: Get (contact linked to card)
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
git clone https://github.com/Noovi-AI/n8n-nodes-noovichat.git
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
- **Website**: [noovichat.com](https://noovichat.com)
