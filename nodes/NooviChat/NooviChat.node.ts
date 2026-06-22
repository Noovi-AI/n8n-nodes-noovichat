import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

import { nooviChatApiRequest, nooviChatApiRequestAllItems, nooviChatApiRequestRaw, formatExecutionData, parseJsonValue } from './GenericFunctions';

// Import all descriptions
import { ConversationOperations, ConversationFields } from './descriptions/ConversationDescription';
import { MessageOperations, MessageFields } from './descriptions/MessageDescription';
import { ContactOperations, ContactFields } from './descriptions/ContactDescription';
import { InboxOperations, InboxFields } from './descriptions/InboxDescription';
import { AgentOperations, AgentFields } from './descriptions/AgentDescription';
import { TeamOperations, TeamFields } from './descriptions/TeamDescription';
import { LabelOperations, LabelFields } from './descriptions/LabelDescription';
import { CannedResponseOperations, CannedResponseFields } from './descriptions/CannedResponseDescription';
import { CustomAttributeOperations, CustomAttributeFields } from './descriptions/CustomAttributeDescription';
import { WebhookOperations, WebhookFields } from './descriptions/WebhookDescription';
import { PipelineOperations, PipelineFields } from './descriptions/PipelineDescription';
import { CardOperations, CardFields } from './descriptions/CardDescription';
import { FollowUpOperations, FollowUpFields } from './descriptions/FollowUpDescription';
import { ActivityOperations, ActivityFields } from './descriptions/ActivityDescription';
import { LeadScoringOperations, LeadScoringFields } from './descriptions/LeadScoringDescription';
import { CampaignOperations, CampaignFields } from './descriptions/CampaignDescription';
import { SlaOperations, SlaFields } from './descriptions/SlaDescription';
import { WahaOperations, WahaFields } from './descriptions/WahaDescription';
import { WhatsappTemplateOperations, WhatsappTemplateFields } from './descriptions/WhatsappTemplateDescription';
import { AppointmentOperations, AppointmentFields } from './descriptions/AppointmentDescription';
import { ProfessionalOperations, ProfessionalFields } from './descriptions/ProfessionalDescription';
import { ServiceOperations, ServiceFields } from './descriptions/ServiceDescription';
import { PartnerOperations, PartnerFields } from './descriptions/PartnerDescription';
import { BroadcastOperations, BroadcastFields, BroadcastBlacklistOperations, BroadcastBlacklistFields } from './descriptions/BroadcastDescription';
import { CommercialAnalysisOperations, CommercialAnalysisFields } from './descriptions/CommercialAnalysisDescription';
import { SequenceOperations, SequenceFields } from './descriptions/SequenceDescription';
import { WhatsAppHubOperations, WhatsAppHubFields } from './descriptions/WhatsAppHubDescription';

export class NooviChat implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'NooviChat',
		name: 'nooviChat',
		icon: 'file:noovichat.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["resource"] + " → " + $parameter["operation"]}}',
		description: 'Interact with NooviChat — manage conversations, contacts, pipeline CRM, lead scoring, campaigns and WhatsApp',
		documentationUrl: 'https://doc.nooviai.com/docs/noovichat/reference/',
		defaults: {
			name: 'NooviChat',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'nooviChatApi',
				required: true,
			},
		],
		properties: [
			// Account ID (supports expressions for multi-account workflows)
			{
				displayName: 'Account ID',
				name: 'accountId',
				type: 'number',
				default: 1,
				required: true,
				description: 'NooviChat account ID. Supports expressions for multi-account workflows.',
			},
			// Resource selector
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Conversation', value: 'conversation' },
					{ name: 'Message', value: 'message' },
					{ name: 'Contact', value: 'contact' },
					{ name: 'Inbox', value: 'inbox' },
					{ name: 'Agent', value: 'agent' },
					{ name: 'Team', value: 'team' },
					{ name: 'Label', value: 'label' },
					{ name: 'Canned Response', value: 'cannedResponse' },
					{ name: 'Custom Attribute', value: 'customAttribute' },
					{ name: 'Webhook', value: 'webhook' },
					{ name: 'Pipeline', value: 'pipeline' },
					{ name: 'Card', value: 'card' },
					{ name: 'Follow-up', value: 'followUp' },
					{ name: 'Activity', value: 'activity' },
					{ name: 'Lead Scoring', value: 'leadScoring' },
					{ name: 'Campaign', value: 'campaign' },
					{ name: 'SLA', value: 'sla' },
					{ name: 'WAHA', value: 'waha' },
					{ name: 'WhatsApp Template', value: 'whatsappTemplate' },
					{ name: 'Appointment', value: 'appointment' },
					{ name: 'Professional', value: 'professional' },
					{ name: 'Service', value: 'service' },
					{ name: 'Partner', value: 'partner' },
					{ name: 'Broadcast', value: 'broadcast' },
					{ name: 'Broadcast Blacklist', value: 'broadcastBlacklist' },
					{ name: 'Commercial Analysis', value: 'commercialAnalysis' },
					{ name: 'Sequence', value: 'sequence' },
					{ name: 'WhatsApp Hub (NooviConnect)', value: 'whatsAppHub' },
				],
				default: 'conversation',
			},
			// Operations and fields for each resource
			...ConversationOperations,
			...ConversationFields,
			...MessageOperations,
			...MessageFields,
			...ContactOperations,
			...ContactFields,
			...InboxOperations,
			...InboxFields,
			...AgentOperations,
			...AgentFields,
			...TeamOperations,
			...TeamFields,
			...LabelOperations,
			...LabelFields,
			...CannedResponseOperations,
			...CannedResponseFields,
			...CustomAttributeOperations,
			...CustomAttributeFields,
			...WebhookOperations,
			...WebhookFields,
			...PipelineOperations,
			...PipelineFields,
			...CardOperations,
			...CardFields,
			...FollowUpOperations,
			...FollowUpFields,
			...ActivityOperations,
			...ActivityFields,
			...LeadScoringOperations,
			...LeadScoringFields,
			...CampaignOperations,
			...CampaignFields,
			...SlaOperations,
			...SlaFields,
			...WahaOperations,
			...WahaFields,
			...WhatsappTemplateOperations,
			...WhatsappTemplateFields,
			...AppointmentOperations,
			...AppointmentFields,
			...ProfessionalOperations,
			...ProfessionalFields,
			...ServiceOperations,
			...ServiceFields,
			...PartnerOperations,
			...PartnerFields,
			...BroadcastOperations,
			...BroadcastFields,
			...BroadcastBlacklistOperations,
			...BroadcastBlacklistFields,
			...CommercialAnalysisOperations,
			...CommercialAnalysisFields,
			...SequenceOperations,
			...SequenceFields,
			...WhatsAppHubOperations,
			...WhatsAppHubFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			const resource = this.getNodeParameter('resource', i) as string;
			const operation = this.getNodeParameter('operation', i) as string;
			try {
				let responseData: any;

				switch (resource) {
					case 'conversation':
						responseData = await handleConversationOperation.call(this, operation, i);
						break;
					case 'message':
						responseData = await handleMessageOperation.call(this, operation, i);
						break;
					case 'contact':
						responseData = await handleContactOperation.call(this, operation, i);
						break;
					case 'inbox':
						responseData = await handleInboxOperation.call(this, operation, i);
						break;
					case 'agent':
						responseData = await handleAgentOperation.call(this, operation, i);
						break;
					case 'team':
						responseData = await handleTeamOperation.call(this, operation, i);
						break;
					case 'label':
						responseData = await handleLabelOperation.call(this, operation, i);
						break;
					case 'cannedResponse':
						responseData = await handleCannedResponseOperation.call(this, operation, i);
						break;
					case 'customAttribute':
						responseData = await handleCustomAttributeOperation.call(this, operation, i);
						break;
					case 'webhook':
						responseData = await handleWebhookOperation.call(this, operation, i);
						break;
					case 'pipeline':
						responseData = await handlePipelineOperation.call(this, operation, i);
						break;
					case 'card':
						responseData = await handleCardOperation.call(this, operation, i);
						break;
					case 'followUp':
						responseData = await handleFollowUpOperation.call(this, operation, i);
						break;
					case 'activity':
						responseData = await handleActivityOperation.call(this, operation, i);
						break;
					case 'leadScoring':
						responseData = await handleLeadScoringOperation.call(this, operation, i);
						break;
					case 'campaign':
						responseData = await handleCampaignOperation.call(this, operation, i);
						break;
					case 'sla':
						responseData = await handleSlaOperation.call(this, operation, i);
						break;
					case 'waha':
						responseData = await handleWahaOperation.call(this, operation, i);
						break;
					case 'whatsappTemplate':
						responseData = await handleWhatsappTemplateOperation.call(this, operation, i);
						break;
					case 'appointment':
						responseData = await handleAppointmentOperation.call(this, operation, i);
						break;
					case 'professional':
						responseData = await handleProfessionalOperation.call(this, operation, i);
						break;
					case 'service':
						responseData = await handleServiceOperation.call(this, operation, i);
						break;
					case 'partner':
						responseData = await handlePartnerOperation.call(this, operation, i);
						break;
					case 'broadcast':
						responseData = await handleBroadcastOperation.call(this, operation, i);
						break;
					case 'broadcastBlacklist':
						responseData = await handleBroadcastBlacklistOperation.call(this, operation, i);
						break;
					case 'commercialAnalysis':
						responseData = await handleCommercialAnalysisOperation.call(this, operation, i);
						break;
					case 'sequence':
						responseData = await handleSequenceOperation.call(this, operation, i);
						break;
					case 'whatsAppHub':
						responseData = await handleWhatsAppHubOperation.call(this, operation, i);
						break;
					default:
						throw new NodeOperationError(this.getNode(), `Unknown resource: "${resource}"`, { itemIndex: i });
				}

				returnData.push(...formatExecutionData(responseData, i));
			} catch (error: any) {
				if (this.continueOnFail()) {
					const statusCode = (error as any)?.response?.statusCode;
					returnData.push({
						json: {
							error: statusCode
								? `NooviChat API error (HTTP ${statusCode})`
								: error.message,
							statusCode,
						},
						pairedItem: { item: i },
					});
				} else {
					throw new NodeOperationError(this.getNode(), error.message, { itemIndex: i });
				}
			}
		}

		return [returnData];
	}
}

// Conversation handlers
async function handleConversationOperation(this: IExecuteFunctions, operation: string, index: number): Promise<any> {
	const conversationId = this.getNodeParameter('conversationId', index, '') as string;
	const returnAll = this.getNodeParameter('returnAll', index, false) as boolean;
	const limit = this.getNodeParameter('limit', index, 50) as number;

	switch (operation) {
		case 'create': {
			const sourceId = this.getNodeParameter('sourceId', index) as string;
			const inboxId = this.getNodeParameter('inboxId', index) as string;
			const additionalFields = this.getNodeParameter('additionalFields', index, {}) as any;
			const body: any = { source_id: sourceId, inbox_id: inboxId };
			if (additionalFields.status) body.status = additionalFields.status;
			if (additionalFields.assigneeId) body.assignee_id = additionalFields.assigneeId;
			if (additionalFields.teamId) body.team_id = additionalFields.teamId;
			return await nooviChatApiRequest.call(this, 'POST', '/conversations', body);
		}
		case 'get':
			return await nooviChatApiRequest.call(this, 'GET', `/conversations/${conversationId}`);
		case 'getAll': {
			const filters = this.getNodeParameter('filters', index, {}) as any;
			if (returnAll) {
				return await nooviChatApiRequestAllItems.call(this, 'GET', '/conversations', {}, filters);
			}
			return await nooviChatApiRequest.call(this, 'GET', '/conversations', {}, { ...filters, per_page: limit });
		}
		case 'update': {
			const priority = this.getNodeParameter('priority', index, '') as string;
			const body: any = {};
			if (priority) body.priority = priority;
			return await nooviChatApiRequest.call(this, 'PATCH', `/conversations/${conversationId}`, body);
		}
		case 'delete':
			return await nooviChatApiRequest.call(this, 'DELETE', `/conversations/${conversationId}`);
		case 'assign': {
			const assigneeId = this.getNodeParameter('assigneeId', index, 0) as number;
			const teamId = this.getNodeParameter('teamId', index, 0) as number;
			return await nooviChatApiRequest.call(this, 'POST', `/conversations/${conversationId}/assignments`, {
				assignee_id: assigneeId || undefined,
				team_id: teamId || undefined,
			});
		}
		case 'toggleStatus': {
			const status = this.getNodeParameter('status', index) as string;
			return await nooviChatApiRequest.call(this, 'POST', `/conversations/${conversationId}/toggle_status`, { status });
		}
		case 'addLabel': {
			const labels = this.getNodeParameter('labels', index) as string;
			const labelArray = labels
				.split(',')
				.map((l: string) => l.trim())
				.filter((l: string) => l.length > 0);
			return await nooviChatApiRequest.call(this, 'POST', `/conversations/${conversationId}/labels`, {
				labels: labelArray,
			});
		}
		case 'filter': {
			const filterPayload = this.getNodeParameter('filterPayload', index) as any;
			const parsed = parseJsonValue(filterPayload);
			if (returnAll) {
				return await nooviChatApiRequestAllItems.call(this, 'POST', '/conversations/filter', parsed);
			}
			return await nooviChatApiRequest.call(this, 'POST', '/conversations/filter', parsed, { per_page: limit });
		}
		case 'getSummary':
			return await nooviChatApiRequest.call(this, 'GET', `/conversations/${conversationId}/summary`);
		case 'generateSummary':
			return await nooviChatApiRequest.call(this, 'POST', `/conversations/${conversationId}/summarize`);
		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: "${operation}"`, { itemIndex: index });
	}
}

// Message handlers
async function handleMessageOperation(this: IExecuteFunctions, operation: string, index: number): Promise<any> {
	const conversationId = this.getNodeParameter('conversationId', index) as string;

	switch (operation) {
		case 'send': {
			const content = this.getNodeParameter('content', index) as string;
			const messageType = this.getNodeParameter('messageType', index, 'outgoing') as string;
			const isPrivate = this.getNodeParameter('private', index, false) as boolean;
			const additionalFields = this.getNodeParameter('additionalFields', index, {}) as any;
			const body: any = {
				content,
				message_type: messageType,
				private: isPrivate,
			};
			if (additionalFields.templateName) {
				body.template = { name: additionalFields.templateName };
				if (additionalFields.templateVariables) {
					body.template.variables = additionalFields.templateVariables.split(',');
				}
			}
			if (additionalFields.contentType) {
				body.content_type = additionalFields.contentType;
			}
			if (additionalFields.attachment) {
				body.attachments = [{ url: additionalFields.attachment }];
			}
			return await nooviChatApiRequest.call(this, 'POST', `/conversations/${conversationId}/messages`, body);
		}
		case 'getAll': {
			const returnAll = this.getNodeParameter('returnAll', index, false) as boolean;
			const limit = this.getNodeParameter('limit', index, 50) as number;
			const before = this.getNodeParameter('before', index, '') as string;
			const qs: any = {};
			if (before) qs.before = before;
			if (!returnAll) qs.per_page = limit;
			
			if (returnAll) {
				return await nooviChatApiRequestAllItems.call(this, 'GET', `/conversations/${conversationId}/messages`, {}, qs);
			}
			return await nooviChatApiRequest.call(this, 'GET', `/conversations/${conversationId}/messages`, {}, qs);
		}
		case 'edit': {
			const messageId = this.getNodeParameter('messageId', index) as string;
			const content = this.getNodeParameter('content', index) as string;
			return await nooviChatApiRequest.call(this, 'POST', `/conversations/${conversationId}/messages/${messageId}/edit`, { content });
		}
		case 'delete': {
			const messageId = this.getNodeParameter('messageId', index) as string;
			return await nooviChatApiRequest.call(this, 'DELETE', `/conversations/${conversationId}/messages/${messageId}`);
		}
		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: "${operation}"`, { itemIndex: index });
	}
}

// Contact handlers
async function handleContactOperation(this: IExecuteFunctions, operation: string, index: number): Promise<any> {
	const contactId = this.getNodeParameter('contactId', index, '') as string;
	const returnAll = this.getNodeParameter('returnAll', index, false) as boolean;
	const limit = this.getNodeParameter('limit', index, 50) as number;

	switch (operation) {
		case 'create': {
			const name = this.getNodeParameter('name', index) as string;
			const additionalFields = this.getNodeParameter('additionalFields', index, {}) as any;
			const body: any = { name };
			if (additionalFields.email) body.email = additionalFields.email;
			if (additionalFields.phoneNumber) body.phone_number = additionalFields.phoneNumber;
			if (additionalFields.inboxId) body.inbox_id = additionalFields.inboxId;
			if (additionalFields.sourceId) body.source_id = additionalFields.sourceId;
			if (additionalFields.identifier) body.identifier = additionalFields.identifier;
			if (additionalFields.customAttributes) {
				body.custom_attributes = parseJsonValue(additionalFields.customAttributes);
			}
			return await nooviChatApiRequest.call(this, 'POST', '/contacts', body);
		}
		case 'get': {
			// The backend DEFAULTS to including contact_inboxes when the param is absent
			// (contacts_controller#set_include_contact_inboxes), so the off state must be
			// sent explicitly as false — otherwise the toggle can never turn it off.
			const includeContactInboxes = this.getNodeParameter('includeContactInboxes', index, false) as boolean;
			return await nooviChatApiRequest.call(this, 'GET', `/contacts/${contactId}`, {}, { include_contact_inboxes: includeContactInboxes });
		}
		case 'getAll': {
			const sort = this.getNodeParameter('sort', index, 'name') as string;
			const includeContactInboxes = this.getNodeParameter('includeContactInboxes', index, false) as boolean;
			const qs: any = { sort, include_contact_inboxes: includeContactInboxes };
			if (!returnAll) qs.per_page = limit;
			if (returnAll) {
				return await nooviChatApiRequestAllItems.call(this, 'GET', '/contacts', {}, qs);
			}
			return await nooviChatApiRequest.call(this, 'GET', '/contacts', {}, qs);
		}
		case 'update': {
			const updateFields = this.getNodeParameter('updateFields', index, {}) as any;
			const body: any = {};
			if (updateFields.name) body.name = updateFields.name;
			if (updateFields.email) body.email = updateFields.email;
			if (updateFields.phoneNumber) body.phone_number = updateFields.phoneNumber;
			if (updateFields.priority) body.priority = updateFields.priority;
			if (updateFields.customAttributes) {
				body.custom_attributes = parseJsonValue(updateFields.customAttributes);
			}
			return await nooviChatApiRequest.call(this, 'PUT', `/contacts/${contactId}`, body);
		}
		case 'delete':
			return await nooviChatApiRequest.call(this, 'DELETE', `/contacts/${contactId}`);
		case 'search': {
			const query = this.getNodeParameter('query', index) as string;
			const includeContactInboxes = this.getNodeParameter('includeContactInboxes', index, false) as boolean;
			const qs: any = { q: query, include_contact_inboxes: includeContactInboxes };
			if (!returnAll) qs.per_page = limit;
			if (returnAll) {
				return await nooviChatApiRequestAllItems.call(this, 'GET', '/contacts/search', {}, qs);
			}
			return await nooviChatApiRequest.call(this, 'GET', '/contacts/search', {}, qs);
		}
		case 'filter': {
			const filterPayload = this.getNodeParameter('filterPayload', index) as any;
			const parsed = parseJsonValue(filterPayload);
			if (returnAll) {
				return await nooviChatApiRequestAllItems.call(this, 'POST', '/contacts/filter', parsed);
			}
			return await nooviChatApiRequest.call(this, 'POST', '/contacts/filter', parsed, { per_page: limit });
		}
		case 'merge': {
			const baseContactId = this.getNodeParameter('baseContactId', index) as number;
			const mergeeContactId = this.getNodeParameter('mergeeContactId', index) as number;
			return await nooviChatApiRequest.call(this, 'POST', '/actions/contact_merge', {
				base_contact_id: baseContactId,
				mergee_contact_id: mergeeContactId,
			});
		}
		case 'getConversations':
			return await nooviChatApiRequest.call(this, 'GET', `/contacts/${contactId}/conversations`);
		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: "${operation}"`, { itemIndex: index });
	}
}

// Inbox handlers
async function handleInboxOperation(this: IExecuteFunctions, operation: string, index: number): Promise<any> {
	const inboxId = this.getNodeParameter('inboxId', index, '') as string;
	const returnAll = this.getNodeParameter('returnAll', index, false) as boolean;
	const limit = this.getNodeParameter('limit', index, 50) as number;

	switch (operation) {
		case 'create': {
			const name = this.getNodeParameter('name', index) as string;
			const channelType = this.getNodeParameter('channel', index) as string;
			return await nooviChatApiRequest.call(this, 'POST', '/inboxes', { name, channel: { type: channelType } });
		}
		case 'get':
			return await nooviChatApiRequest.call(this, 'GET', `/inboxes/${inboxId}`);
		case 'getAll': {
			if (returnAll) {
				return await nooviChatApiRequestAllItems.call(this, 'GET', '/inboxes');
			}
			return await nooviChatApiRequest.call(this, 'GET', '/inboxes', {}, { per_page: limit });
		}
		case 'update': {
			const name = this.getNodeParameter('name', index) as string;
			return await nooviChatApiRequest.call(this, 'PUT', `/inboxes/${inboxId}`, { name });
		}
		case 'delete':
			return await nooviChatApiRequest.call(this, 'DELETE', `/inboxes/${inboxId}`);
		case 'getAgents':
			return await nooviChatApiRequest.call(this, 'GET', `/inbox_members/${inboxId}`);
		case 'updateAgents': {
			const agentIds = this.getNodeParameter('agentIds', index) as string;
			const agentIdArray = agentIds
				.split(',')
				.map((id: string) => parseInt(id.trim(), 10))
				.filter((id: number) => !isNaN(id) && id > 0);
			if (agentIdArray.length === 0) {
				throw new NodeOperationError(this.getNode(), 'No valid IDs provided', { itemIndex: index });
			}
			return await nooviChatApiRequest.call(this, 'POST', '/inbox_members', {
				inbox_id: inboxId,
				user_ids: agentIdArray,
			});
		}
		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: "${operation}"`, { itemIndex: index });
	}
}

// Agent handlers
async function handleAgentOperation(this: IExecuteFunctions, operation: string, index: number): Promise<any> {
	const agentId = this.getNodeParameter('agentId', index, '') as string;
	const returnAll = this.getNodeParameter('returnAll', index, false) as boolean;
	const limit = this.getNodeParameter('limit', index, 50) as number;

	switch (operation) {
		case 'create': {
			const name = this.getNodeParameter('name', index) as string;
			const email = this.getNodeParameter('email', index) as string;
			const role = this.getNodeParameter('role', index, 'agent') as string;
			const customRoleId = this.getNodeParameter('customRoleId', index, 0) as number;
			const body: any = { name, email, role };
			// custom_role_id is read at the body root by Chatwoot (outside the agent wrapper)
			if (customRoleId) body.custom_role_id = customRoleId;
			return await nooviChatApiRequest.call(this, 'POST', '/agents', body);
		}
		case 'getAll': {
			if (returnAll) {
				return await nooviChatApiRequestAllItems.call(this, 'GET', '/agents');
			}
			return await nooviChatApiRequest.call(this, 'GET', '/agents', {}, { per_page: limit });
		}
		case 'update': {
			const name = this.getNodeParameter('name', index, '') as string;
			const role = this.getNodeParameter('role', index, '') as string;
			const availability = this.getNodeParameter('availability', index, '') as string;
			const body: any = {};
			if (name) body.name = name;
			if (role) body.role = role;
			if (availability) body.availability = availability;
			const customRoleId = this.getNodeParameter('customRoleId', index, 0) as number;
			// custom_role_id is read at the body root by Chatwoot (outside the agent wrapper)
			if (customRoleId) body.custom_role_id = customRoleId;
			return await nooviChatApiRequest.call(this, 'PATCH', `/agents/${agentId}`, body);
		}
		case 'delete':
			return await nooviChatApiRequest.call(this, 'DELETE', `/agents/${agentId}`);
		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: "${operation}"`, { itemIndex: index });
	}
}

// Team handlers
async function handleTeamOperation(this: IExecuteFunctions, operation: string, index: number): Promise<any> {
	const teamId = this.getNodeParameter('teamId', index, '') as string;
	const returnAll = this.getNodeParameter('returnAll', index, false) as boolean;
	const limit = this.getNodeParameter('limit', index, 50) as number;

	switch (operation) {
		case 'create': {
			const name = this.getNodeParameter('name', index) as string;
			const description = this.getNodeParameter('description', index, '') as string;
			return await nooviChatApiRequest.call(this, 'POST', '/teams', { name, description });
		}
		case 'getAll': {
			if (returnAll) {
				return await nooviChatApiRequestAllItems.call(this, 'GET', '/teams');
			}
			return await nooviChatApiRequest.call(this, 'GET', '/teams', {}, { per_page: limit });
		}
		case 'update': {
			const name = this.getNodeParameter('name', index, '') as string;
			const description = this.getNodeParameter('description', index, '') as string;
			const body: any = {};
			if (name) body.name = name;
			if (description) body.description = description;
			return await nooviChatApiRequest.call(this, 'PATCH', `/teams/${teamId}`, body);
		}
		case 'delete':
			return await nooviChatApiRequest.call(this, 'DELETE', `/teams/${teamId}`);
		case 'getMembers':
			return await nooviChatApiRequest.call(this, 'GET', `/teams/${teamId}/team_members`);
		case 'addMembers': {
			const memberIds = this.getNodeParameter('memberIds', index) as string;
			const memberIdArray = memberIds
				.split(',')
				.map((id: string) => parseInt(id.trim(), 10))
				.filter((id: number) => !isNaN(id) && id > 0);
			if (memberIdArray.length === 0) {
				throw new NodeOperationError(this.getNode(), 'No valid IDs provided', { itemIndex: index });
			}
			return await nooviChatApiRequest.call(this, 'POST', `/teams/${teamId}/team_members`, {
				user_ids: memberIdArray,
			});
		}
		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: "${operation}"`, { itemIndex: index });
	}
}

// Label handlers
async function handleLabelOperation(this: IExecuteFunctions, operation: string, index: number): Promise<any> {
	const labelId = this.getNodeParameter('labelId', index, '') as string;
	const returnAll = this.getNodeParameter('returnAll', index, false) as boolean;
	const limit = this.getNodeParameter('limit', index, 50) as number;

	switch (operation) {
		case 'create': {
			const title = this.getNodeParameter('title', index) as string;
			const color = this.getNodeParameter('color', index, '#0066FF') as string;
			const description = this.getNodeParameter('description', index, '') as string;
			return await nooviChatApiRequest.call(this, 'POST', '/labels', { title, color, description });
		}
		case 'getAll': {
			if (returnAll) {
				return await nooviChatApiRequestAllItems.call(this, 'GET', '/labels');
			}
			return await nooviChatApiRequest.call(this, 'GET', '/labels', {}, { per_page: limit });
		}
		case 'update': {
			const title = this.getNodeParameter('title', index, '') as string;
			const color = this.getNodeParameter('color', index, '') as string;
			const description = this.getNodeParameter('description', index, '') as string;
			const body: any = {};
			if (title) body.title = title;
			if (color) body.color = color;
			if (description) body.description = description;
			return await nooviChatApiRequest.call(this, 'PATCH', `/labels/${labelId}`, body);
		}
		case 'delete':
			return await nooviChatApiRequest.call(this, 'DELETE', `/labels/${labelId}`);
		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: "${operation}"`, { itemIndex: index });
	}
}

// Canned Response handlers
async function handleCannedResponseOperation(this: IExecuteFunctions, operation: string, index: number): Promise<any> {
	const cannedResponseId = this.getNodeParameter('cannedResponseId', index, '') as string;
	const returnAll = this.getNodeParameter('returnAll', index, false) as boolean;
	const limit = this.getNodeParameter('limit', index, 50) as number;

	switch (operation) {
		case 'create': {
			const shortCode = this.getNodeParameter('shortCode', index) as string;
			const content = this.getNodeParameter('content', index) as string;
			return await nooviChatApiRequest.call(this, 'POST', '/canned_responses', { short_code: shortCode, content });
		}
		case 'getAll': {
			if (returnAll) {
				return await nooviChatApiRequestAllItems.call(this, 'GET', '/canned_responses');
			}
			return await nooviChatApiRequest.call(this, 'GET', '/canned_responses', {}, { per_page: limit });
		}
		case 'update': {
			const updateFields = this.getNodeParameter('updateFields', index, {}) as any;
			const body: any = {};
			if (updateFields.shortCode) body.short_code = updateFields.shortCode;
			if (updateFields.content) body.content = updateFields.content;
			return await nooviChatApiRequest.call(this, 'PATCH', `/canned_responses/${cannedResponseId}`, body);
		}
		case 'delete':
			return await nooviChatApiRequest.call(this, 'DELETE', `/canned_responses/${cannedResponseId}`);
		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: "${operation}"`, { itemIndex: index });
	}
}

// Custom Attribute handlers
async function handleCustomAttributeOperation(this: IExecuteFunctions, operation: string, index: number): Promise<any> {
	const attributeId = this.getNodeParameter('attributeId', index, '') as string;
	const returnAll = this.getNodeParameter('returnAll', index, false) as boolean;
	const limit = this.getNodeParameter('limit', index, 50) as number;

	switch (operation) {
		case 'create': {
			const attributeName = this.getNodeParameter('attributeName', index) as string;
			const displayName = this.getNodeParameter('displayName', index) as string;
			const attributeType = this.getNodeParameter('attributeType', index) as string;
			const model = this.getNodeParameter('model', index) as string;
			return await nooviChatApiRequest.call(this, 'POST', '/custom_attribute_definitions', {
				attribute_key: attributeName,
				attribute_display_name: displayName,
				attribute_display_type: attributeType,
				attribute_model: model,
			});
		}
		case 'getAll': {
			if (returnAll) {
				return await nooviChatApiRequestAllItems.call(this, 'GET', '/custom_attribute_definitions');
			}
			return await nooviChatApiRequest.call(this, 'GET', '/custom_attribute_definitions', {}, { per_page: limit });
		}
		case 'update': {
			const displayName = this.getNodeParameter('displayName', index, '') as string;
			const body: any = {};
			if (displayName) body.attribute_display_name = displayName;
			return await nooviChatApiRequest.call(this, 'PATCH', `/custom_attribute_definitions/${attributeId}`, body);
		}
		case 'delete':
			return await nooviChatApiRequest.call(this, 'DELETE', `/custom_attribute_definitions/${attributeId}`);
		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: "${operation}"`, { itemIndex: index });
	}
}

// Webhook handlers
async function handleWebhookOperation(this: IExecuteFunctions, operation: string, index: number): Promise<any> {
	const webhookId = this.getNodeParameter('webhookId', index, '') as string;
	const returnAll = this.getNodeParameter('returnAll', index, false) as boolean;
	const limit = this.getNodeParameter('limit', index, 50) as number;

	switch (operation) {
		case 'create': {
			const webhookUrl = this.getNodeParameter('webhookUrl', index) as string;
			const events = this.getNodeParameter('events', index) as string[];
			return await nooviChatApiRequest.call(this, 'POST', '/webhooks', { url: webhookUrl, subscriptions: events });
		}
		case 'getAll': {
			if (returnAll) {
				return await nooviChatApiRequestAllItems.call(this, 'GET', '/webhooks');
			}
			return await nooviChatApiRequest.call(this, 'GET', '/webhooks', {}, { per_page: limit });
		}
		case 'update': {
			const webhookUrl = this.getNodeParameter('webhookUrl', index, '') as string;
			const events = this.getNodeParameter('events', index, []) as string[];
			const body: any = {};
			if (webhookUrl) body.url = webhookUrl;
			if (events.length > 0) body.subscriptions = events;
			return await nooviChatApiRequest.call(this, 'PUT', `/webhooks/${webhookId}`, body);
		}
		case 'delete':
			return await nooviChatApiRequest.call(this, 'DELETE', `/webhooks/${webhookId}`);
		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: "${operation}"`, { itemIndex: index });
	}
}

// Pipeline handlers
async function handlePipelineOperation(this: IExecuteFunctions, operation: string, index: number): Promise<any> {
	const pipelineId = this.getNodeParameter('pipelineId', index, '') as string;
	const stageId = this.getNodeParameter('stageId', index, '') as string;
	const returnAll = this.getNodeParameter('returnAll', index, false) as boolean;
	const limit = this.getNodeParameter('limit', index, 50) as number;
	const startDate = this.getNodeParameter('startDate', index, '') as string;
	const endDate = this.getNodeParameter('endDate', index, '') as string;

	switch (operation) {
		case 'create': {
			const name = this.getNodeParameter('name', index) as string;
			const description = this.getNodeParameter('description', index, '') as string;
			const initialStagesCollection = this.getNodeParameter('initialStages.values', index, []) as Array<{
				stageName: string;
				stageColor: string;
				stagePosition: number;
			}>;
			if (initialStagesCollection.length === 0) {
				throw new NodeOperationError(this.getNode(), 'At least one initial stage is required to create a pipeline.', { itemIndex: index });
			}
			// Build stages as a hash (object) keyed by slug — required by the NooviChat API.
			// The API expects stages as { "stage_key": { name, color, position } }, NOT an array.
			const stages: Record<string, { name: string; color: string; position: number }> = {};
			initialStagesCollection.forEach((stage, idx) => {
				const slug = stage.stageName
					.toLowerCase()
					.replace(/[^a-z0-9\s]/g, '')
					.replace(/\s+/g, '_')
					.replace(/^_+|_+$/g, '') || `stage_${idx + 1}`;
				stages[slug] = {
					name: stage.stageName,
					color: stage.stageColor || '#3B82F6',
					position: stage.stagePosition ?? idx + 1,
				};
			});
			return await nooviChatApiRequest.call(this, 'POST', '/pipelines', { name, description, stages });
		}
		case 'get':
			return await nooviChatApiRequest.call(this, 'GET', `/pipelines/${pipelineId}`);
		case 'getAll': {
			if (returnAll) {
				return await nooviChatApiRequestAllItems.call(this, 'GET', '/pipelines');
			}
			return await nooviChatApiRequest.call(this, 'GET', '/pipelines', {}, { per_page: limit });
		}
		case 'update': {
			const name = this.getNodeParameter('name', index, '') as string;
			const description = this.getNodeParameter('description', index, '') as string;
			const body: any = {};
			if (name) body.name = name;
			if (description) body.description = description;
			return await nooviChatApiRequest.call(this, 'PATCH', `/pipelines/${pipelineId}`, body);
		}
		case 'delete':
			return await nooviChatApiRequest.call(this, 'DELETE', `/pipelines/${pipelineId}`);
		case 'getStages':
			return await nooviChatApiRequest.call(this, 'GET', `/pipelines/${pipelineId}/stages`);
		case 'createStage': {
			const stagesCollection = this.getNodeParameter('stages.values', index, []) as Array<{ stageName: string; stageColor: string }>;
			if (stagesCollection.length === 0) {
				throw new NodeOperationError(this.getNode(), 'At least one stage must be added.', { itemIndex: index });
			}
			// Stages are stored as a JSONB hash on the Pipeline model — there is no dedicated
			// POST /stages endpoint. We must GET the pipeline, merge new stages, then PATCH.
			const pipeline: any = await nooviChatApiRequest.call(this, 'GET', `/pipelines/${pipelineId}`);
			const currentStages: Record<string, any> = pipeline.stages || {};
			const maxPosition = Object.values(currentStages).reduce((max: number, s: any) => Math.max(max, s.position ?? 0), 0);
			stagesCollection.forEach((stage, idx) => {
				const slug = stage.stageName
					.toLowerCase()
					.replace(/[^a-z0-9\s]/g, '')
					.replace(/\s+/g, '_')
					.replace(/^_+|_+$/g, '') || `stage_${Date.now()}_${idx}`;
				currentStages[slug] = {
					name: stage.stageName,
					color: stage.stageColor || '#0066FF',
					position: maxPosition + idx + 1,
				};
			});
			return await nooviChatApiRequest.call(this, 'PATCH', `/pipelines/${pipelineId}`, { stages: currentStages });
		}
		case 'updateStage': {
			const stageName = this.getNodeParameter('stageName', index, '') as string;
			const stageColor = this.getNodeParameter('stageColor', index, '') as string;
			// Stages are stored as a JSONB hash on the Pipeline model.
			// There is no individual stage route; we must GET the pipeline, modify the stage, then PATCH.
			const pipeline: any = await nooviChatApiRequest.call(this, 'GET', `/pipelines/${pipelineId}`);
			const stages = pipeline.stages || {};
			if (!stages[stageId]) {
				throw new NodeOperationError(this.getNode(), `Stage "${stageId}" not found in pipeline ${pipelineId}`, { itemIndex: index });
			}
			if (stageName) stages[stageId].name = stageName;
			if (stageColor) stages[stageId].color = stageColor;
			return await nooviChatApiRequest.call(this, 'PATCH', `/pipelines/${pipelineId}`, { stages });
		}
		case 'deleteStage': {
			// Same pattern: GET pipeline, remove the stage entry, PATCH with modified stages hash.
			const pipeline: any = await nooviChatApiRequest.call(this, 'GET', `/pipelines/${pipelineId}`);
			const stages = pipeline.stages || {};
			delete stages[stageId];
			return await nooviChatApiRequest.call(this, 'PATCH', `/pipelines/${pipelineId}`, { stages });
		}
		case 'reorderStages': {
			// There is no dedicated reorder endpoint. Stages are a JSONB hash ordered by the
			// 'position' key inside each stage object. To reorder: GET pipeline, then PATCH
			// with updated position values matching the provided order.
			const stageOrderValues = this.getNodeParameter('stageOrder.values', index, []) as Array<{ id: string }>;
			const pipeline: any = await nooviChatApiRequest.call(this, 'GET', `/pipelines/${pipelineId}`);
			const stages: Record<string, any> = pipeline.stages || {};
			stageOrderValues.forEach((item, idx) => {
				if (stages[item.id]) {
					stages[item.id].position = idx + 1;
				}
			});
			return await nooviChatApiRequest.call(this, 'PATCH', `/pipelines/${pipelineId}`, { stages });
		}
		case 'getAnalyticsDashboard': {
			const qs: any = {};
			if (startDate) qs.start_date = startDate;
			if (endDate) qs.end_date = endDate;
			return await nooviChatApiRequest.call(this, 'GET', '/pipeline/analytics/dashboard', {}, qs);
		}
		case 'getWinRate': {
			const qs: any = {};
			if (startDate) qs.start_date = startDate;
			if (endDate) qs.end_date = endDate;
			return await nooviChatApiRequest.call(this, 'GET', '/pipeline/analytics/win_rate', {}, qs);
		}
		case 'getConversionMetrics': {
			const qs: any = {};
			if (startDate) qs.start_date = startDate;
			if (endDate) qs.end_date = endDate;
			return await nooviChatApiRequest.call(this, 'GET', '/pipeline/analytics/conversion_metrics', {}, qs);
		}
		case 'getSalesVelocity': {
			const qs: any = {};
			if (startDate) qs.start_date = startDate;
			if (endDate) qs.end_date = endDate;
			return await nooviChatApiRequest.call(this, 'GET', '/pipeline/analytics/sales_velocity', {}, qs);
		}
		case 'getTeamPerformance': {
			const qs: any = {};
			if (startDate) qs.start_date = startDate;
			if (endDate) qs.end_date = endDate;
			const agentIdValues = this.getNodeParameter('agentIds.values', index, []) as Array<{ id: string }>;
			if (agentIdValues.length > 0) qs.agent_ids = agentIdValues.map(a => a.id).join(',');
			return await nooviChatApiRequest.call(this, 'GET', '/pipeline/analytics/team_pipeline', {}, qs);
		}
		case 'getLostReasons':
			return await nooviChatApiRequest.call(this, 'GET', '/pipeline/deal_status/common_reasons');
		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: "${operation}"`, { itemIndex: index });
	}
}

// Card handlers
async function handleCardOperation(this: IExecuteFunctions, operation: string, index: number): Promise<any> {
	const cardId = this.getNodeParameter('cardId', index, '') as string;
	const returnAll = this.getNodeParameter('returnAll', index, false) as boolean;
	const limit = this.getNodeParameter('limit', index, 50) as number;

	switch (operation) {
		case 'create': {
			const title = this.getNodeParameter('title', index) as string;
			const pipelineId = this.getNodeParameter('pipelineId', index) as string;
			// pipeline_stage is a string in format {pipeline_id}_{stage_slug} (e.g. "1_lead")
			// NOT an integer stage_id — the API requires this string format
			const pipelineStage = this.getNodeParameter('stageId', index) as string;
			const additionalFields = this.getNodeParameter('additionalFields', index, {}) as any;
			const body: any = {
				pipeline_id: pipelineId,
				pipeline_stage: pipelineStage,
				title,
			};
			if (additionalFields.contactId) body.contact_id = additionalFields.contactId;
			if (additionalFields.value) body.expected_revenue = additionalFields.value;
			if (additionalFields.expectedCloseDate) body.deadline = additionalFields.expectedCloseDate;
			if (additionalFields.assigneeId) body.owner_id = additionalFields.assigneeId;
			return await nooviChatApiRequest.call(this, 'POST', '/pipeline_cards', body);
		}
		case 'get':
			return await nooviChatApiRequest.call(this, 'GET', `/pipeline_cards/${cardId}`);
		case 'getAll': {
			// pipeline_cards_controller.rb SUPPORTED_INDEX_FILTERS now also covers
			//   labels, priority, value_min/value_max, agent_id, date_start/date_end,
			//   status, sla_exceeded (applied via PipelineCardFilterable#apply_card_filters)
			// on top of the legacy pipeline_id / pipeline_stage / conversation_display_id /
			// contact_id / exclude_id. `labels` is passed as a repeated `labels[]` param.
			// The controller honors `limit`/`offset`/`cursor` for pagination (not `per_page`).
			const filters = this.getNodeParameter('filters', index, {}) as any;
			const qs = buildCardFilterQs(filters);
			if (!returnAll) qs.limit = limit;
			if (returnAll) {
				return await nooviChatApiRequestAllItems.call(this, 'GET', '/pipeline_cards', {}, qs);
			}
			return await nooviChatApiRequest.call(this, 'GET', '/pipeline_cards', {}, qs);
		}
		case 'update': {
			const additionalFields = this.getNodeParameter('additionalFields', index, {}) as any;
			const body: any = {};
			if (additionalFields.title) body.title = additionalFields.title;
			if (additionalFields.value) body.expected_revenue = additionalFields.value;
			if (additionalFields.expectedCloseDate) body.deadline = additionalFields.expectedCloseDate;
			if (additionalFields.assigneeId) body.owner_id = additionalFields.assigneeId;
			return await nooviChatApiRequest.call(this, 'PATCH', `/pipeline_cards/${cardId}`, body);
		}
		case 'delete':
			return await nooviChatApiRequest.call(this, 'DELETE', `/pipeline_cards/${cardId}`);
		case 'moveToStage': {
			const stageId = this.getNodeParameter('stageId', index) as string;
			return await nooviChatApiRequest.call(this, 'POST', `/pipeline_cards/${cardId}/move_to_stage`, { pipeline_stage: stageId });
		}
		case 'markWon':
			return await nooviChatApiRequest.call(this, 'POST', `/pipeline/cards/${cardId}/deal_status/mark_won`);
		case 'markLost': {
			const lostReason = this.getNodeParameter('lostReason', index, '') as string;
			return await nooviChatApiRequest.call(this, 'POST', `/pipeline/cards/${cardId}/deal_status/mark_lost`, { reason: lostReason });
		}
		case 'reopen':
			return await nooviChatApiRequest.call(this, 'POST', `/pipeline/cards/${cardId}/deal_status/reopen`);
		case 'getTimeline':
			return await nooviChatApiRequest.call(this, 'GET', `/pipeline/cards/${cardId}/timeline`);
		case 'bulkUpdate': {
			const cardIdValues = this.getNodeParameter('cardIds.values', index, []) as Array<{ id: string }>;
			const updateFields = this.getNodeParameter('updateFields', index) as any;
			const parsed = parseJsonValue(updateFields);
			const results = [];
			for (const card of cardIdValues) {
				const result = await nooviChatApiRequest.call(this, 'PATCH', `/pipeline_cards/${card.id}`, parsed);
				results.push(result);
			}
			return results;
		}
		case 'bulkMove': {
			const cardIdValues = this.getNodeParameter('cardIds.values', index, []) as Array<{ id: string }>;
			const stageId = this.getNodeParameter('stageId', index) as string;
			const results = [];
			for (const card of cardIdValues) {
				const result = await nooviChatApiRequest.call(this, 'POST', `/pipeline_cards/${card.id}/move_to_stage`, { pipeline_stage: stageId });
				results.push(result);
			}
			return results;
		}
		case 'bulkDelete': {
			const cardIdValues = this.getNodeParameter('cardIds.values', index, []) as Array<{ id: string }>;
			const results = [];
			for (const card of cardIdValues) {
				const result = await nooviChatApiRequest.call(this, 'DELETE', `/pipeline_cards/${card.id}`);
				results.push(result);
			}
			return results;
		}
		case 'getLeadScore':
			return await nooviChatApiRequest.call(this, 'GET', `/pipeline_cards/${cardId}`);
		case 'recalculateLeadScore':
			return await nooviChatApiRequest.call(this, 'POST', `/pipeline_cards/${cardId}/recalculate_score`);
		case 'export': {
			// GET /pipeline/cards/export → text/csv. Honors the same filters as getAll
			// (card_exports_controller#index via PipelineCardFilterable). Returns the raw
			// CSV as a string field rather than parsed JSON.
			const filters = this.getNodeParameter('filters', index, {}) as any;
			const qs = buildCardFilterQs(filters);
			const csv = await nooviChatApiRequestRaw.call(this, 'GET', '/pipeline/cards/export', qs);
			return { csv };
		}
		case 'getImportTemplate': {
			// GET /pipeline/cards/template → text/csv import template (headers + sample row).
			const csv = await nooviChatApiRequestRaw.call(this, 'GET', '/pipeline/cards/template');
			return { csv };
		}
		// TODO(follow-up): import-upload (POST /pipeline/cards/import) is NOT implemented here.
		// It requires multipart/form-data (import_file binary + pipeline_id) which the current
		// nooviChatApiRequest (json:true) and nooviChatApiRequestRaw helpers do not support.
		// Implementing it cleanly needs a dedicated multipart/formData transport reading an
		// n8n binary property — deferred to keep this change low-risk. Export + template ship now.
		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: "${operation}"`, { itemIndex: index });
	}
}

/**
 * Build the querystring for the pipeline-card index/export filters. Both
 * endpoints share `PipelineCardFilterable#apply_card_filters` on the backend.
 * `labels` is a comma-separated list of label titles sent as a repeated
 * `labels[]` param (Rails `Array.wrap(params[:labels])`).
 */
function buildCardFilterQs(filters: any): any {
	const qs: any = {};
	if (filters.pipelineId) qs.pipeline_id = filters.pipelineId;
	if (filters.stageId) qs.pipeline_stage = filters.stageId;
	if (filters.contactId) qs.contact_id = filters.contactId;
	if (filters.conversationDisplayId) qs.conversation_display_id = filters.conversationDisplayId;
	if (filters.labels) {
		const labels = String(filters.labels)
			.split(',')
			.map((l: string) => l.trim())
			.filter((l: string) => l !== '');
		if (labels.length > 0) qs['labels[]'] = labels;
	}
	return qs;
}

// Follow-up handlers
async function handleFollowUpOperation(this: IExecuteFunctions, operation: string, index: number): Promise<any> {
	const followUpId = this.getNodeParameter('followUpId', index, '') as string;
	const templateId = this.getNodeParameter('templateId', index, '') as string;
	const conversationId = this.getNodeParameter('conversationId', index, '') as string;
	const returnAll = this.getNodeParameter('returnAll', index, false) as boolean;
	const limit = this.getNodeParameter('limit', index, 50) as number;

	switch (operation) {
		case 'create': {
			const title = this.getNodeParameter('title', index, '') as string;
			const content = this.getNodeParameter('content', index) as string;
			const scheduledAt = this.getNodeParameter('scheduledAt', index) as string;
			const inboxId = this.getNodeParameter('inboxId', index) as string;
			const followUpBody: any = { content, scheduled_at: scheduledAt, inbox_id: inboxId };
			if (title) followUpBody.title = title;
			return await nooviChatApiRequest.call(this, 'POST', `/conversations/${conversationId}/follow-ups`, {
				follow_up: followUpBody,
			});
		}
		case 'getAll': {
			if (conversationId) {
				if (returnAll) {
					return await nooviChatApiRequestAllItems.call(this, 'GET', `/conversations/${conversationId}/follow-ups`);
				}
				return await nooviChatApiRequest.call(this, 'GET', `/conversations/${conversationId}/follow-ups`, {}, { per_page: limit });
			}
			if (returnAll) {
				return await nooviChatApiRequestAllItems.call(this, 'GET', '/follow-ups');
			}
			return await nooviChatApiRequest.call(this, 'GET', '/follow-ups', {}, { per_page: limit });
		}
		case 'update': {
			const title = this.getNodeParameter('title', index, '') as string;
			const content = this.getNodeParameter('content', index, '') as string;
			const scheduledAt = this.getNodeParameter('scheduledAt', index, '') as string;
			const body: any = {};
			if (title) body.title = title;
			if (content) body.content = content;
			if (scheduledAt) body.scheduled_at = scheduledAt;
			return await nooviChatApiRequest.call(this, 'PATCH', `/conversations/${conversationId}/follow-ups/${followUpId}`, { follow_up: body });
		}
		case 'delete':
			return await nooviChatApiRequest.call(this, 'DELETE', `/conversations/${conversationId}/follow-ups/${followUpId}`);
		case 'get':
			return await nooviChatApiRequest.call(this, 'GET', `/conversations/${conversationId}/follow-ups/${followUpId}`);
		case 'cancel':
			return await nooviChatApiRequest.call(this, 'POST', `/conversations/${conversationId}/follow-ups/${followUpId}/cancel`);
		case 'createTemplate': {
			const templateName = this.getNodeParameter('templateName', index) as string;
			const templateContent = this.getNodeParameter('templateContent', index) as string;
			return await nooviChatApiRequest.call(this, 'POST', '/follow-up-templates', { name: templateName, content: templateContent });
		}
		case 'getTemplates': {
			if (returnAll) {
				return await nooviChatApiRequestAllItems.call(this, 'GET', '/follow-up-templates');
			}
			return await nooviChatApiRequest.call(this, 'GET', '/follow-up-templates', {}, { per_page: limit });
		}
		case 'updateTemplate': {
			const templateName = this.getNodeParameter('templateName', index, '') as string;
			const templateContent = this.getNodeParameter('templateContent', index, '') as string;
			const body: any = {};
			if (templateName) body.name = templateName;
			if (templateContent) body.content = templateContent;
			return await nooviChatApiRequest.call(this, 'PATCH', `/follow-up-templates/${templateId}`, body);
		}
		case 'deleteTemplate':
			return await nooviChatApiRequest.call(this, 'DELETE', `/follow-up-templates/${templateId}`);
		case 'previewTemplate':
			return await nooviChatApiRequest.call(this, 'POST', `/follow-up-templates/${templateId}/preview`);
		case 'createTemplateItem': {
			const itemType = this.getNodeParameter('itemType', index) as string;
			const itemContent = this.getNodeParameter('itemContent', index, '') as string;
			const itemDelaySeconds = this.getNodeParameter('itemDelaySeconds', index, 0) as number;
			const itemBody: any = {
				item_type: itemType,
				content: itemContent,
				delay_seconds: itemDelaySeconds,
			};
			if (itemType === 'whatsapp_template') {
				itemBody.whatsapp_template_name = this.getNodeParameter('whatsappTemplateName', index, '') as string;
				itemBody.whatsapp_template_language = this.getNodeParameter('whatsappTemplateLanguage', index, '') as string;
				const ns = this.getNodeParameter('whatsappTemplateNamespace', index, '') as string;
				if (ns) itemBody.whatsapp_template_namespace = ns;
				const rawMapping = this.getNodeParameter('whatsappTemplateMapping', index, '') as string | object;
				if (rawMapping) {
					itemBody.whatsapp_template_mapping =
						typeof rawMapping === 'string' ? JSON.parse(rawMapping) : rawMapping;
				}
			}
			return await nooviChatApiRequest.call(this, 'POST', `/follow-up-templates/${templateId}/items`, {
				follow_up_template_item: itemBody,
			});
		}
		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: "${operation}"`, { itemIndex: index });
	}
}

// Activity handlers
async function handleActivityOperation(this: IExecuteFunctions, operation: string, index: number): Promise<any> {
	const activityId = this.getNodeParameter('activityId', index, '') as string;
	const returnAll = this.getNodeParameter('returnAll', index, false) as boolean;
	const limit = this.getNodeParameter('limit', index, 50) as number;

	switch (operation) {
		case 'create': {
			const pipelineCardId = this.getNodeParameter('pipelineCardId', index) as string;
			const title = this.getNodeParameter('title', index) as string;
			const activityType = this.getNodeParameter('activityType', index) as string;
			const additionalFields = this.getNodeParameter('additionalFields', index, {}) as any;
			const activityBody: any = { activity_type: activityType, title };
			if (additionalFields.description) activityBody.description = additionalFields.description;
			if (additionalFields.scheduledAt) activityBody.scheduled_at = additionalFields.scheduledAt;
			if (additionalFields.duration) activityBody.duration = additionalFields.duration;
			if (additionalFields.assigneeId) activityBody.assigned_to_id = additionalFields.assigneeId;
			if (additionalFields.contactId) activityBody.contact_id = additionalFields.contactId;
			// pipeline_card_id must be passed as a query param, activity fields wrapped in "activity" key
			return await nooviChatApiRequest.call(this, 'POST', '/pipeline/activities', { activity: activityBody }, { pipeline_card_id: pipelineCardId });
		}
		case 'get': {
			const pipelineCardId = this.getNodeParameter('pipelineCardId', index) as string;
			return await nooviChatApiRequest.call(this, 'GET', `/pipeline/activities/${activityId}`, {}, { pipeline_card_id: pipelineCardId });
		}
		case 'getAll': {
			const filters = this.getNodeParameter('filters', index, {}) as any;
			if (returnAll) {
				return await nooviChatApiRequestAllItems.call(this, 'GET', '/pipeline/activities', {}, filters);
			}
			return await nooviChatApiRequest.call(this, 'GET', '/pipeline/activities', {}, { ...filters, per_page: limit });
		}
		case 'update': {
			const pipelineCardId = this.getNodeParameter('pipelineCardId', index) as string;
			const additionalFields = this.getNodeParameter('additionalFields', index, {}) as any;
			const activityBody: any = {};
			if (additionalFields.title) activityBody.title = additionalFields.title;
			if (additionalFields.description) activityBody.description = additionalFields.description;
			if (additionalFields.dueAt) activityBody.due_at = additionalFields.dueAt;
			if (additionalFields.assigneeId) activityBody.assigned_to_id = additionalFields.assigneeId;
			return await nooviChatApiRequest.call(this, 'PATCH', `/pipeline/activities/${activityId}`, { activity: activityBody }, { pipeline_card_id: pipelineCardId });
		}
		case 'delete': {
			const pipelineCardId = this.getNodeParameter('pipelineCardId', index) as string;
			return await nooviChatApiRequest.call(this, 'DELETE', `/pipeline/activities/${activityId}`, {}, { pipeline_card_id: pipelineCardId });
		}
		case 'start': {
			const pipelineCardId = this.getNodeParameter('pipelineCardId', index) as string;
			return await nooviChatApiRequest.call(this, 'POST', `/pipeline/activities/${activityId}/start`, {}, { pipeline_card_id: pipelineCardId });
		}
		case 'complete': {
			const pipelineCardId = this.getNodeParameter('pipelineCardId', index) as string;
			return await nooviChatApiRequest.call(this, 'POST', `/pipeline/activities/${activityId}/complete`, {}, { pipeline_card_id: pipelineCardId });
		}
		case 'cancel': {
			const pipelineCardId = this.getNodeParameter('pipelineCardId', index) as string;
			return await nooviChatApiRequest.call(this, 'POST', `/pipeline/activities/${activityId}/cancel`, {}, { pipeline_card_id: pipelineCardId });
		}
		case 'getAnalytics': {
			// Backend (pipeline/activities_controller.rb:196-198) reads params[:date_from]/[:date_to].
			// Sending start_date/end_date (the old naming) was silently ignored — analytics
			// always defaulted to the last 30 days regardless of UI selection.
			const startDate = this.getNodeParameter('startDate', index, '') as string;
			const endDate = this.getNodeParameter('endDate', index, '') as string;
			const qs: any = {};
			if (startDate) qs.date_from = startDate;
			if (endDate) qs.date_to = endDate;
			return await nooviChatApiRequest.call(this, 'GET', '/pipeline/activities/analytics', {}, qs);
		}
		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: "${operation}"`, { itemIndex: index });
	}
}

// Lead Scoring handlers
async function handleLeadScoringOperation(this: IExecuteFunctions, operation: string, index: number): Promise<any> {
	const ruleId = this.getNodeParameter('ruleId', index, '') as string;
	const returnAll = this.getNodeParameter('returnAll', index, false) as boolean;
	const limit = this.getNodeParameter('limit', index, 50) as number;

	switch (operation) {
		case 'createRule': {
			const ruleName = this.getNodeParameter('ruleName', index) as string;
			const points = this.getNodeParameter('points', index) as number;
			const eventType = this.getNodeParameter('eventType', index) as string;
			const conditions = this.getNodeParameter('conditions', index, '{}') as any;
			return await nooviChatApiRequest.call(this, 'POST', '/lead_score_rules', {
				name: ruleName,
				points,
				event_type: eventType,
				conditions: parseJsonValue(conditions),
			});
		}
		case 'getAllRules': {
			if (returnAll) {
				return await nooviChatApiRequestAllItems.call(this, 'GET', '/lead_score_rules');
			}
			return await nooviChatApiRequest.call(this, 'GET', '/lead_score_rules', {}, { per_page: limit });
		}
		case 'updateRule': {
			const ruleName = this.getNodeParameter('ruleName', index, '') as string;
			const points = this.getNodeParameter('points', index, 0) as number;
			const eventType = this.getNodeParameter('eventType', index, '') as string;
			const conditions = this.getNodeParameter('conditions', index, '') as any;
			const body: any = {};
			if (ruleName) body.name = ruleName;
			if (points) body.points = points;
			if (eventType) body.event_type = eventType;
			if (conditions) body.conditions = parseJsonValue(conditions);
			return await nooviChatApiRequest.call(this, 'PATCH', `/lead_score_rules/${ruleId}`, body);
		}
		case 'deleteRule':
			return await nooviChatApiRequest.call(this, 'DELETE', `/lead_score_rules/${ruleId}`);
		case 'getRule':
			return await nooviChatApiRequest.call(this, 'GET', `/lead_score_rules/${ruleId}`);
		case 'createDefaultRules':
			return await nooviChatApiRequest.call(this, 'POST', '/lead_score_rules/create_defaults');
		case 'getDashboard':
			return await nooviChatApiRequest.call(this, 'GET', '/lead_score/reports/dashboard');
		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: "${operation}"`, { itemIndex: index });
	}
}

// Campaign handlers
async function handleCampaignOperation(this: IExecuteFunctions, operation: string, index: number): Promise<any> {
	const campaignId = this.getNodeParameter('campaignId', index, '') as string;
	const returnAll = this.getNodeParameter('returnAll', index, false) as boolean;
	const limit = this.getNodeParameter('limit', index, 50) as number;

	switch (operation) {
		case 'create': {
			const title = this.getNodeParameter('title', index) as string;
			const inboxId = this.getNodeParameter('inboxId', index) as number;
			const message = this.getNodeParameter('message', index) as string;
			const additionalFields = this.getNodeParameter('additionalFields', index, {}) as any;
			const body: any = { title, inbox_id: inboxId, message };
			if (additionalFields.description) body.description = additionalFields.description;
			if (additionalFields.scheduledAt) body.scheduled_at = additionalFields.scheduledAt;
			if (additionalFields.audience) {
				body.audience = parseJsonValue(additionalFields.audience);
			}
			return await nooviChatApiRequest.call(this, 'POST', '/campaigns', body);
		}
		case 'get':
			return await nooviChatApiRequest.call(this, 'GET', `/campaigns/${campaignId}`);
		case 'getAll': {
			if (returnAll) {
				return await nooviChatApiRequestAllItems.call(this, 'GET', '/campaigns');
			}
			return await nooviChatApiRequest.call(this, 'GET', '/campaigns', {}, { per_page: limit });
		}
		case 'update': {
			const additionalFields = this.getNodeParameter('additionalFields', index, {}) as any;
			const body: any = {};
			if (additionalFields.title) body.title = additionalFields.title;
			if (additionalFields.description) body.description = additionalFields.description;
			if (additionalFields.message) body.message = additionalFields.message;
			if (additionalFields.scheduledAt) body.scheduled_at = additionalFields.scheduledAt;
			if (additionalFields.audience) {
				body.audience = parseJsonValue(additionalFields.audience);
			}
			return await nooviChatApiRequest.call(this, 'PATCH', `/campaigns/${campaignId}`, body);
		}
		case 'delete':
			return await nooviChatApiRequest.call(this, 'DELETE', `/campaigns/${campaignId}`);
		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: "${operation}"`, { itemIndex: index });
	}
}

// SLA handlers
async function handleSlaOperation(this: IExecuteFunctions, operation: string, index: number): Promise<any> {
	const policyId = this.getNodeParameter('policyId', index, '') as string;
	const returnAll = this.getNodeParameter('returnAll', index, false) as boolean;
	const limit = this.getNodeParameter('limit', index, 50) as number;
	const startDate = this.getNodeParameter('startDate', index, '') as string;
	const endDate = this.getNodeParameter('endDate', index, '') as string;

	// Backend (applied_slas_controller.rb + DateRangeHelper) expects unix epoch seconds
	// in `since`/`until` query params. Convert ISO strings to seconds; pass-through if
	// already numeric (workflow may compute epoch directly).
	const toEpochSeconds = (value: string): number | undefined => {
		if (!value) return undefined;
		const asNumber = Number(value);
		if (Number.isFinite(asNumber) && asNumber > 0) return Math.floor(asNumber);
		const parsed = Date.parse(value);
		if (!Number.isFinite(parsed)) return undefined;
		return Math.floor(parsed / 1000);
	};

	switch (operation) {
		case 'createPolicy': {
			const policyName = this.getNodeParameter('policyName', index) as string;
			const firstResponseTimeThreshold = this.getNodeParameter('firstResponseTimeThreshold', index) as number;
			const nextResponseTimeThreshold = this.getNodeParameter('nextResponseTimeThreshold', index, 0) as number;
			const resolutionTimeThreshold = this.getNodeParameter('resolutionTimeThreshold', index, 0) as number;
			const onlyDuringBusinessHours = this.getNodeParameter('onlyDuringBusinessHours', index, false) as boolean;
			const policyDescription = this.getNodeParameter('policyDescription', index, '') as string;
			const body: any = {
				name: policyName,
				first_response_time_threshold: firstResponseTimeThreshold,
			};
			if (nextResponseTimeThreshold) body.next_response_time_threshold = nextResponseTimeThreshold;
			if (resolutionTimeThreshold) body.resolution_time_threshold = resolutionTimeThreshold;
			if (onlyDuringBusinessHours) body.only_during_business_hours = onlyDuringBusinessHours;
			if (policyDescription) body.description = policyDescription;
			return await nooviChatApiRequest.call(this, 'POST', '/sla_policies', body);
		}
		case 'getPolicy':
			return await nooviChatApiRequest.call(this, 'GET', `/sla_policies/${policyId}`);
		case 'getAllPolicies': {
			if (returnAll) {
				return await nooviChatApiRequestAllItems.call(this, 'GET', '/sla_policies');
			}
			return await nooviChatApiRequest.call(this, 'GET', '/sla_policies', {}, { per_page: limit });
		}
		case 'updatePolicy': {
			const policyName = this.getNodeParameter('policyName', index, '') as string;
			const firstResponseTimeThreshold = this.getNodeParameter('firstResponseTimeThreshold', index, 0) as number;
			const nextResponseTimeThreshold = this.getNodeParameter('nextResponseTimeThreshold', index, 0) as number;
			const resolutionTimeThreshold = this.getNodeParameter('resolutionTimeThreshold', index, 0) as number;
			const onlyDuringBusinessHours = this.getNodeParameter('onlyDuringBusinessHours', index, false) as boolean;
			const policyDescription = this.getNodeParameter('policyDescription', index, '') as string;
			const body: any = {};
			if (policyName) body.name = policyName;
			if (firstResponseTimeThreshold) body.first_response_time_threshold = firstResponseTimeThreshold;
			if (nextResponseTimeThreshold) body.next_response_time_threshold = nextResponseTimeThreshold;
			if (resolutionTimeThreshold) body.resolution_time_threshold = resolutionTimeThreshold;
			if (onlyDuringBusinessHours) body.only_during_business_hours = onlyDuringBusinessHours;
			if (policyDescription) body.description = policyDescription;
			return await nooviChatApiRequest.call(this, 'PATCH', `/sla_policies/${policyId}`, body);
		}
		case 'deletePolicy':
			return await nooviChatApiRequest.call(this, 'DELETE', `/sla_policies/${policyId}`);
		case 'getApplied': {
			if (returnAll) {
				return await nooviChatApiRequestAllItems.call(this, 'GET', '/applied_slas');
			}
			return await nooviChatApiRequest.call(this, 'GET', '/applied_slas', {}, { per_page: limit });
		}
		case 'getMetrics': {
			const qs: any = {};
			const since = toEpochSeconds(startDate);
			const until = toEpochSeconds(endDate);
			if (since !== undefined) qs.since = since;
			if (until !== undefined) qs.until = until;
			return await nooviChatApiRequest.call(this, 'GET', '/applied_slas/metrics', {}, qs);
		}
		case 'exportCsv': {
			const qs: any = {};
			const since = toEpochSeconds(startDate);
			const until = toEpochSeconds(endDate);
			if (since !== undefined) qs.since = since;
			if (until !== undefined) qs.until = until;
			return await nooviChatApiRequest.call(this, 'GET', '/applied_slas/download', {}, qs);
		}
		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: "${operation}"`, { itemIndex: index });
	}
}

// WAHA handlers
async function handleWahaOperation(this: IExecuteFunctions, operation: string, index: number): Promise<any> {
	const inboxId = this.getNodeParameter('inboxId', index) as string;

	switch (operation) {
		case 'getStatus':
			return await nooviChatApiRequest.call(this, 'GET', `/waha/${inboxId}/status`);
		case 'refreshQr':
			return await nooviChatApiRequest.call(this, 'POST', `/waha/${inboxId}/refresh_qr`);
		case 'start':
			return await nooviChatApiRequest.call(this, 'POST', `/waha/${inboxId}/start`);
		case 'stop':
			return await nooviChatApiRequest.call(this, 'POST', `/waha/${inboxId}/stop`);
		case 'reconnect':
			return await nooviChatApiRequest.call(this, 'POST', `/waha/${inboxId}/reconnect`);
		case 'disconnect':
			return await nooviChatApiRequest.call(this, 'POST', `/waha/${inboxId}/disconnect`);
		case 'getSettings':
			return await nooviChatApiRequest.call(this, 'GET', `/waha/${inboxId}/settings`);
		case 'updateChatwootAppSettings': {
			// Backend: PATCH /waha/:id/settings/chatwoot_app — Rails wrap_parameters auto-wraps as { chatwoot_app: {...} }
			const settings = this.getNodeParameter('chatwootAppSettings', index) as any;
			const parsed = parseJsonValue(settings);
			return await nooviChatApiRequest.call(
				this,
				'PATCH',
				`/waha/${inboxId}/settings/chatwoot_app`,
				parsed,
			);
		}
		case 'updateSessionSettings': {
			// Backend: PATCH /waha/:id/settings/session — wraps as { session: {...} }
			const settings = this.getNodeParameter('sessionSettings', index) as any;
			const parsed = parseJsonValue(settings);
			return await nooviChatApiRequest.call(
				this,
				'PATCH',
				`/waha/${inboxId}/settings/session`,
				parsed,
			);
		}
		case 'updateWebhookSettings': {
			// Backend: PATCH /waha/:id/settings/webhook — wraps as { webhook: {...} }
			const settings = this.getNodeParameter('webhookSettings', index) as any;
			const parsed = parseJsonValue(settings);
			return await nooviChatApiRequest.call(
				this,
				'PATCH',
				`/waha/${inboxId}/settings/webhook`,
				parsed,
			);
		}
		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: "${operation}"`, { itemIndex: index });
	}
}

// NooviChat custom — WhatsApp Cloud templates CRUD (Fase 1.6 M4).
// Backend: Api::V1::Accounts::WhatsappTemplatesController
async function handleWhatsappTemplateOperation(
	this: IExecuteFunctions,
	operation: string,
	index: number,
): Promise<any> {
	const inboxId = this.getNodeParameter('inboxId', index) as number;

	switch (operation) {
		case 'list': {
			const filters = (this.getNodeParameter('filters', index, {}) as any) || {};
			const qs: any = { inbox_id: inboxId };
			if (filters.status) qs.status = filters.status;
			if (filters.category) qs.category = filters.category;
			if (filters.search) qs.search = filters.search;
			if (filters.limit) qs.limit = filters.limit;
			return await nooviChatApiRequest.call(this, 'GET', '/whatsapp_templates', {}, qs);
		}

		case 'get': {
			const templateId = this.getNodeParameter('templateId', index) as string;
			return await nooviChatApiRequest.call(
				this,
				'GET',
				`/whatsapp_templates/${encodeURIComponent(templateId)}`,
				{},
				{ inbox_id: inboxId },
			);
		}

		case 'create': {
			const name = this.getNodeParameter('templateDataName', index) as string;
			const language = this.getNodeParameter('templateDataLanguage', index) as string;
			const category = this.getNodeParameter('templateDataCategory', index) as string;
			const componentsRaw = this.getNodeParameter('templateDataComponents', index) as any;
			const components = parseJsonValue(componentsRaw);
			return await nooviChatApiRequest.call(this, 'POST', '/whatsapp_templates', {
				inbox_id: inboxId,
				template: { name, language, category, components },
			});
		}

		case 'update': {
			const templateId = this.getNodeParameter('templateId', index) as string;
			const updateFields = (this.getNodeParameter('templateUpdateFields', index, {}) as any) || {};
			const template: any = {};
			if (updateFields.category) template.category = updateFields.category;
			if (updateFields.components) template.components = parseJsonValue(updateFields.components);
			return await nooviChatApiRequest.call(
				this,
				'PUT',
				`/whatsapp_templates/${encodeURIComponent(templateId)}`,
				{ inbox_id: inboxId, template },
			);
		}

		case 'delete': {
			const templateName = this.getNodeParameter('templateName', index) as string;
			// Backend routes :destroy on the collection (routes.rb:152), no :id in path.
			// inbox_id + template_name identify the template for the Meta API call.
			return await nooviChatApiRequest.call(
				this,
				'DELETE',
				'/whatsapp_templates',
				{},
				{ inbox_id: inboxId, template_name: templateName },
			);
		}

		case 'sync': {
			return await nooviChatApiRequest.call(this, 'POST', '/whatsapp_templates/sync', {
				inbox_id: inboxId,
			});
		}

		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: "${operation}"`, { itemIndex: index });
	}
}

// Appointment handlers
async function handleAppointmentOperation(this: IExecuteFunctions, operation: string, index: number): Promise<any> {
	const appointmentId = this.getNodeParameter('appointmentId', index, '') as string;

	switch (operation) {
		case 'create': {
			const contactId = this.getNodeParameter('contactId', index) as number;
			const professionalId = this.getNodeParameter('professionalId', index) as number;
			const serviceId = this.getNodeParameter('serviceId', index) as number;
			const scheduledAt = this.getNodeParameter('scheduledAt', index) as string;
			const additionalFields = this.getNodeParameter('additionalFields', index, {}) as any;
			const body: any = {
				appointment: {
					contact_id: contactId,
					professional_id: professionalId,
					service_id: serviceId,
					scheduled_at: scheduledAt,
				},
			};
			if (additionalFields.endsAt) body.appointment.ends_at = additionalFields.endsAt;
			if (additionalFields.notes) body.appointment.notes = additionalFields.notes;
			if (additionalFields.partnerId) body.appointment.partner_id = additionalFields.partnerId;
			if (additionalFields.conversationDisplayId) body.appointment.conversation_display_id = additionalFields.conversationDisplayId;
			return await nooviChatApiRequest.call(this, 'POST', '/appointments', body);
		}
		case 'get':
			return await nooviChatApiRequest.call(this, 'GET', `/appointments/${appointmentId}`);
		case 'list': {
			const filters = this.getNodeParameter('filters', index, {}) as any;
			const qs: any = {};
			if (filters.from) qs.from = filters.from;
			if (filters.to) qs.to = filters.to;
			if (filters.professionalId) qs.professional_id = filters.professionalId;
			if (filters.status) qs.status = filters.status;
			if (filters.page) qs.page = filters.page;
			if (filters.pipeline_card_id) qs.pipeline_card_id = filters.pipeline_card_id;
			return await nooviChatApiRequest.call(this, 'GET', '/appointments', {}, qs);
		}
		case 'update': {
			// Backend (appointments_controller.rb:287-291) update_params permits only:
			//   scheduled_at, ends_at, notes, partner_id, custom_attributes
			// professional_id and service_id are deliberately excluded from update
			// — to change them, cancel the appointment and create a new one.
			const updateFields = this.getNodeParameter('updateFields', index, {}) as any;
			const body: any = { appointment: {} };
			if (updateFields.scheduledAt) body.appointment.scheduled_at = updateFields.scheduledAt;
			if (updateFields.endsAt) body.appointment.ends_at = updateFields.endsAt;
			if (updateFields.notes) body.appointment.notes = updateFields.notes;
			if (updateFields.partnerId) body.appointment.partner_id = updateFields.partnerId;
			if (updateFields.customAttributes) {
				body.appointment.custom_attributes = parseJsonValue(updateFields.customAttributes);
			}
			return await nooviChatApiRequest.call(this, 'PATCH', `/appointments/${appointmentId}`, body);
		}
		case 'cancel': {
			const reason = this.getNodeParameter('cancellationReason', index, '') as string;
			const body: any = {};
			if (reason) body.reason = reason;
			return await nooviChatApiRequest.call(this, 'DELETE', `/appointments/${appointmentId}`, body);
		}
		case 'confirm':
			return await nooviChatApiRequest.call(this, 'POST', `/appointments/${appointmentId}/confirm`);
		case 'complete':
			return await nooviChatApiRequest.call(this, 'POST', `/appointments/${appointmentId}/complete`);
		case 'noShow':
			return await nooviChatApiRequest.call(this, 'POST', `/appointments/${appointmentId}/no_show`);
		case 'availability': {
			const professionalId = this.getNodeParameter('professionalId', index) as number;
			const serviceId = this.getNodeParameter('serviceId', index) as number;
			const date = this.getNodeParameter('date', index) as string;
			return await nooviChatApiRequest.call(this, 'GET', '/appointments/availability', {}, {
				professional_id: professionalId,
				service_id: serviceId,
				date,
			});
		}
		case 'getContactHistory': {
			const contactId = this.getNodeParameter('contact_id', index) as number;
			const page = this.getNodeParameter('page', index, 1) as number;
			return await nooviChatApiRequest.call(
				this,
				'GET',
				`/contacts/${contactId}/appointment_history`,
				undefined,
				{ page },
			);
		}
		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: "${operation}"`, { itemIndex: index });
	}
}

// Professional handlers
async function handleProfessionalOperation(this: IExecuteFunctions, operation: string, index: number): Promise<any> {
	const professionalId = this.getNodeParameter('professionalId', index, '') as string;

	switch (operation) {
		case 'create': {
			const name = this.getNodeParameter('name', index) as string;
			const additionalFields = this.getNodeParameter('additionalFields', index, {}) as any;
			const body: any = { professional: { name } };
			if (additionalFields.specialty) body.professional.specialty = additionalFields.specialty;
			if (additionalFields.registry) body.professional.registry = additionalFields.registry;
			if (additionalFields.email) body.professional.email = additionalFields.email;
			if (additionalFields.phone) body.professional.phone = additionalFields.phone;
			if (additionalFields.color) body.professional.color = additionalFields.color;
			if (additionalFields.bufferMinutes) body.professional.buffer_minutes = additionalFields.bufferMinutes;
			if (additionalFields.workingHours) body.professional.working_hours = parseJsonValue(additionalFields.workingHours);
			return await nooviChatApiRequest.call(this, 'POST', '/professionals', body);
		}
		case 'get':
			return await nooviChatApiRequest.call(this, 'GET', `/professionals/${professionalId}`);
		case 'list':
			return await nooviChatApiRequest.call(this, 'GET', '/professionals');
		case 'update': {
			const updateFields = this.getNodeParameter('updateFields', index, {}) as any;
			const body: any = { professional: {} };
			if (updateFields.name) body.professional.name = updateFields.name;
			if (updateFields.specialty) body.professional.specialty = updateFields.specialty;
			if (updateFields.registry) body.professional.registry = updateFields.registry;
			if (updateFields.email) body.professional.email = updateFields.email;
			if (updateFields.phone) body.professional.phone = updateFields.phone;
			if (updateFields.color) body.professional.color = updateFields.color;
			if (updateFields.bufferMinutes) body.professional.buffer_minutes = updateFields.bufferMinutes;
			if (updateFields.workingHours) body.professional.working_hours = parseJsonValue(updateFields.workingHours);
			return await nooviChatApiRequest.call(this, 'PATCH', `/professionals/${professionalId}`, body);
		}
		case 'delete':
			return await nooviChatApiRequest.call(this, 'DELETE', `/professionals/${professionalId}`);
		case 'availability': {
			const avProfessionalId = this.getNodeParameter('professionalId', index) as string;
			const date = this.getNodeParameter('date', index) as string;
			const serviceId = this.getNodeParameter('serviceId', index, 0) as number;
			const qs: any = { date };
			if (serviceId) qs.service_id = serviceId;
			return await nooviChatApiRequest.call(this, 'GET', `/professionals/${avProfessionalId}/availability`, {}, qs);
		}
		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: "${operation}"`, { itemIndex: index });
	}
}

// Service handlers
async function handleServiceOperation(this: IExecuteFunctions, operation: string, index: number): Promise<any> {
	const serviceId = this.getNodeParameter('serviceId', index, '') as string;

	// Reminder templates live nested in the service payload (top-level alongside `service:`).
	// Backend (services_controller.rb#sync_reminder_templates, 79-125) replaces the entire
	// set on every PATCH/POST. To preserve existing reminders, callers must include them.
	const buildReminderTemplates = () => {
		const raw = this.getNodeParameter('reminderTemplates.templates', index, []) as Array<any>;
		if (!Array.isArray(raw) || raw.length === 0) return null;
		return raw.map((r) => {
			const t: any = {
				days_before: r.daysBefore ?? 0,
				hours_before: r.hoursBefore ?? 0,
				minutes_before: r.minutesBefore ?? 0,
				body_template: r.bodyTemplate || '',
				send_via: r.sendVia || 'whatsapp',
				active: r.active !== undefined ? r.active : true,
			};
			if (r.label) t.label = r.label;
			return t;
		});
	};

	switch (operation) {
		case 'create': {
			const name = this.getNodeParameter('name', index) as string;
			const durationMinutes = this.getNodeParameter('durationMinutes', index) as number;
			const additionalFields = this.getNodeParameter('additionalFields', index, {}) as any;
			const body: any = { service: { name, duration_minutes: durationMinutes } };
			if (additionalFields.description) body.service.description = additionalFields.description;
			if (additionalFields.defaultPriceCents) body.service.default_price_cents = additionalFields.defaultPriceCents;
			if (additionalFields.currency) body.service.currency = additionalFields.currency;
			if (additionalFields.color) body.service.color = additionalFields.color;
			if (additionalFields.onlineAvailable !== undefined) body.service.online_available = additionalFields.onlineAvailable;
			const reminderTemplates = buildReminderTemplates();
			if (reminderTemplates) body.reminder_templates = reminderTemplates;
			return await nooviChatApiRequest.call(this, 'POST', '/services', body);
		}
		case 'get':
			return await nooviChatApiRequest.call(this, 'GET', `/services/${serviceId}`);
		case 'list':
			return await nooviChatApiRequest.call(this, 'GET', '/services');
		case 'update': {
			const updateFields = this.getNodeParameter('updateFields', index, {}) as any;
			const body: any = { service: {} };
			if (updateFields.name) body.service.name = updateFields.name;
			if (updateFields.description) body.service.description = updateFields.description;
			if (updateFields.durationMinutes) body.service.duration_minutes = updateFields.durationMinutes;
			if (updateFields.defaultPriceCents) body.service.default_price_cents = updateFields.defaultPriceCents;
			if (updateFields.currency) body.service.currency = updateFields.currency;
			if (updateFields.color) body.service.color = updateFields.color;
			if (updateFields.onlineAvailable !== undefined) body.service.online_available = updateFields.onlineAvailable;
			const reminderTemplates = buildReminderTemplates();
			if (reminderTemplates) body.reminder_templates = reminderTemplates;
			return await nooviChatApiRequest.call(this, 'PATCH', `/services/${serviceId}`, body);
		}
		case 'delete':
			return await nooviChatApiRequest.call(this, 'DELETE', `/services/${serviceId}`);
		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: "${operation}"`, { itemIndex: index });
	}
}

// Partner handlers
async function handlePartnerOperation(this: IExecuteFunctions, operation: string, index: number): Promise<any> {
	const partnerId = this.getNodeParameter('partnerId', index, '') as string;

	switch (operation) {
		case 'create': {
			const name = this.getNodeParameter('name', index) as string;
			const kind = this.getNodeParameter('kind', index, 'convenio') as string;
			const additionalFields = this.getNodeParameter('additionalFields', index, {}) as any;
			const body: any = { partner: { name, kind } };
			if (additionalFields.settings) body.partner.settings = parseJsonValue(additionalFields.settings);
			return await nooviChatApiRequest.call(this, 'POST', '/partners', body);
		}
		case 'get':
			return await nooviChatApiRequest.call(this, 'GET', `/partners/${partnerId}`);
		case 'list':
			return await nooviChatApiRequest.call(this, 'GET', '/partners');
		case 'update': {
			const updateFields = this.getNodeParameter('updateFields', index, {}) as any;
			const body: any = { partner: {} };
			if (updateFields.name) body.partner.name = updateFields.name;
			if (updateFields.kind) body.partner.kind = updateFields.kind;
			if (updateFields.settings) body.partner.settings = parseJsonValue(updateFields.settings);
			if (updateFields.active !== undefined) body.partner.active = updateFields.active;
			return await nooviChatApiRequest.call(this, 'PATCH', `/partners/${partnerId}`, body);
		}
		case 'delete':
			return await nooviChatApiRequest.call(this, 'DELETE', `/partners/${partnerId}`);
		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: "${operation}"`, { itemIndex: index });
	}
}

// Broadcast (Disparador em Massa) handlers
async function handleBroadcastOperation(this: IExecuteFunctions, operation: string, index: number): Promise<any> {
	const broadcastId = this.getNodeParameter('broadcastId', index, '') as string;

	switch (operation) {
		case 'create': {
			const additionalFields = this.getNodeParameter('additionalFields', index, {}) as any;
			const inboxIdsRaw = this.getNodeParameter('inboxIds', index, '') as string;
			const broadcast: any = {
				name: this.getNodeParameter('name', index) as string,
				source_type: this.getNodeParameter('sourceType', index) as string,
				message_type: this.getNodeParameter('messageType', index) as string,
				source_config: parseJsonValue(this.getNodeParameter('sourceConfig', index, '{}')),
				message_payload: parseJsonValue(this.getNodeParameter('messagePayload', index, '{}')),
			};
			if (inboxIdsRaw) {
				broadcast.inbox_ids = inboxIdsRaw.split(',').map((s) => Number(s.trim())).filter((n) => !Number.isNaN(n));
			}
			if (additionalFields.description) broadcast.description = additionalFields.description;
			if (additionalFields.rotationMode) broadcast.rotation_mode = additionalFields.rotationMode;
			if (additionalFields.inboxWeights) broadcast.inbox_weights = parseJsonValue(additionalFields.inboxWeights);
			if (additionalFields.delayMinSeconds !== undefined) broadcast.delay_min_seconds = additionalFields.delayMinSeconds;
			if (additionalFields.delayMaxSeconds !== undefined) broadcast.delay_max_seconds = additionalFields.delayMaxSeconds;
			if (additionalFields.pauseEveryN) broadcast.pause_every_n = additionalFields.pauseEveryN;
			if (additionalFields.pauseDurationSeconds) broadcast.pause_duration_seconds = additionalFields.pauseDurationSeconds;
			if (additionalFields.windowStartTime) broadcast.window_start_time = additionalFields.windowStartTime;
			if (additionalFields.windowEndTime) broadcast.window_end_time = additionalFields.windowEndTime;
			if (additionalFields.allowedWeekdays) {
				broadcast.allowed_weekdays = (additionalFields.allowedWeekdays as string).split(',').map((s) => Number(s.trim())).filter((n) => !Number.isNaN(n));
			}
			if (additionalFields.startMode) broadcast.start_mode = additionalFields.startMode;
			if (additionalFields.scheduledAt) broadcast.scheduled_at = additionalFields.scheduledAt;
			if (additionalFields.enableSpintax !== undefined) broadcast.enable_spintax = additionalFields.enableSpintax;
			if (additionalFields.enableFollowUp !== undefined) broadcast.enable_follow_up = additionalFields.enableFollowUp;
			if (additionalFields.followUpAfterHours) broadcast.follow_up_after_hours = additionalFields.followUpAfterHours;
			if (additionalFields.followUpMessage) broadcast.follow_up_message = additionalFields.followUpMessage;
			return await nooviChatApiRequest.call(this, 'POST', '/broadcasts', { broadcast });
		}
		case 'get':
			return await nooviChatApiRequest.call(this, 'GET', `/broadcasts/${broadcastId}`);
		case 'list': {
			const filters = this.getNodeParameter('filters', index, {}) as any;
			const qs: any = {};
			if (filters.status) qs.status = filters.status;
			if (filters.q) qs.q = filters.q;
			if (filters.limit !== undefined) qs.limit = filters.limit;
			if (filters.offset !== undefined) qs.offset = filters.offset;
			return await nooviChatApiRequest.call(this, 'GET', '/broadcasts', {}, qs);
		}
		case 'update': {
			const updateFields = this.getNodeParameter('updateFields', index, {}) as any;
			const broadcast: any = {};
			if (updateFields.name) broadcast.name = updateFields.name;
			if (updateFields.description !== undefined) broadcast.description = updateFields.description;
			return await nooviChatApiRequest.call(this, 'PATCH', `/broadcasts/${broadcastId}`, { broadcast });
		}
		case 'delete':
			return await nooviChatApiRequest.call(this, 'DELETE', `/broadcasts/${broadcastId}`);
		case 'pause':
			return await nooviChatApiRequest.call(this, 'POST', `/broadcasts/${broadcastId}/pause`);
		case 'resume':
			return await nooviChatApiRequest.call(this, 'POST', `/broadcasts/${broadcastId}/resume`);
		case 'cancel':
			return await nooviChatApiRequest.call(this, 'POST', `/broadcasts/${broadcastId}/cancel`);
		case 'retryFailed':
			return await nooviChatApiRequest.call(this, 'POST', `/broadcasts/${broadcastId}/retry_failed`);
		case 'duplicate':
			return await nooviChatApiRequest.call(this, 'POST', `/broadcasts/${broadcastId}/duplicate`);
		case 'getContacts': {
			const f = this.getNodeParameter('contactFilters', index, {}) as any;
			const qs: any = {};
			if (f.status) qs.status = f.status;
			if (f.q) qs.q = f.q;
			if (f.limit !== undefined) qs.limit = f.limit;
			if (f.offset !== undefined) qs.offset = f.offset;
			return await nooviChatApiRequest.call(this, 'GET', `/broadcasts/${broadcastId}/contacts`, {}, qs);
		}
		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: "${operation}"`, { itemIndex: index });
	}
}

// Broadcast Blacklist handlers
async function handleBroadcastBlacklistOperation(this: IExecuteFunctions, operation: string, index: number): Promise<any> {
	switch (operation) {
		case 'list': {
			const f = this.getNodeParameter('blacklistFilters', index, {}) as any;
			const qs: any = {};
			if (f.q) qs.q = f.q;
			if (f.limit !== undefined) qs.limit = f.limit;
			if (f.offset !== undefined) qs.offset = f.offset;
			return await nooviChatApiRequest.call(this, 'GET', '/broadcast_blacklist_entries', {}, qs);
		}
		case 'add': {
			// Backend usa params no nível raiz (não aninhado): params.require(:phone_number)
			const body: any = { phone_number: this.getNodeParameter('phoneNumber', index) as string };
			const reason = this.getNodeParameter('reason', index, '') as string;
			if (reason) body.reason = reason;
			return await nooviChatApiRequest.call(this, 'POST', '/broadcast_blacklist_entries', body);
		}
		case 'remove': {
			const entryId = this.getNodeParameter('entryId', index) as string;
			return await nooviChatApiRequest.call(this, 'DELETE', `/broadcast_blacklist_entries/${entryId}`);
		}
		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: "${operation}"`, { itemIndex: index });
	}
}

// Commercial Analysis handlers
async function handleCommercialAnalysisOperation(this: IExecuteFunctions, operation: string, index: number): Promise<any> {
	switch (operation) {
		case 'generate': {
			const inboxId = this.getNodeParameter('inboxId', index) as string;
			const periodFrom = this.getNodeParameter('periodFrom', index) as string;
			const periodTo = this.getNodeParameter('periodTo', index) as string;
			const force = this.getNodeParameter('force', index, false) as boolean;
			const body: any = { inbox_id: inboxId, period_from: periodFrom, period_to: periodTo };
			if (force) body.force = true;
			return await nooviChatApiRequest.call(this, 'POST', '/commercial-analyses', body);
		}
		case 'list': {
			const inboxIdFilter = this.getNodeParameter('inboxIdFilter', index, '') as string;
			const page = this.getNodeParameter('page', index, 1) as number;
			const qs: any = { page };
			if (inboxIdFilter) qs.inbox_id = inboxIdFilter;
			return await nooviChatApiRequest.call(this, 'GET', '/commercial-analyses', {}, qs);
		}
		case 'getStatus': {
			const reportId = this.getNodeParameter('reportId', index) as string;
			return await nooviChatApiRequest.call(this, 'GET', `/commercial-analyses/${reportId}/status`);
		}
		case 'get': {
			const reportId = this.getNodeParameter('reportId', index) as string;
			return await nooviChatApiRequest.call(this, 'GET', `/commercial-analyses/${reportId}`);
		}
		case 'delete': {
			const reportId = this.getNodeParameter('reportId', index) as string;
			return await nooviChatApiRequest.call(this, 'DELETE', `/commercial-analyses/${reportId}`);
		}
		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: "${operation}"`, { itemIndex: index });
	}
}

// Pipeline sequence handlers (activity sequences attached to a card)
async function handleSequenceOperation(this: IExecuteFunctions, operation: string, index: number): Promise<any> {
	const cardId = this.getNodeParameter('cardId', index) as string;
	const base = `/pipeline/cards/${cardId}/sequences`;

	switch (operation) {
		case 'list':
			return await nooviChatApiRequest.call(this, 'GET', base);
		case 'start': {
			const definitionId = this.getNodeParameter('definitionId', index) as string;
			return await nooviChatApiRequest.call(this, 'POST', base, { definition_id: definitionId });
		}
		case 'startExternal': {
			const definitionId = this.getNodeParameter('definitionId', index) as string;
			const context = this.getNodeParameter('context', index, {}) as any;
			const body: any = { definition_id: definitionId };
			const parsedContext = parseJsonValue(context);
			if (parsedContext && Object.keys(parsedContext).length > 0) body.context = parsedContext;
			return await nooviChatApiRequest.call(this, 'POST', `${base}/external_start`, body);
		}
		case 'pause': {
			const sequenceId = this.getNodeParameter('sequenceId', index) as string;
			return await nooviChatApiRequest.call(this, 'PATCH', `${base}/${sequenceId}/pause`);
		}
		case 'resume': {
			const sequenceId = this.getNodeParameter('sequenceId', index) as string;
			return await nooviChatApiRequest.call(this, 'PATCH', `${base}/${sequenceId}/resume`);
		}
		case 'completeStep': {
			const sequenceId = this.getNodeParameter('sequenceId', index) as string;
			return await nooviChatApiRequest.call(this, 'PATCH', `${base}/${sequenceId}/complete_step`);
		}
		case 'cancel': {
			const sequenceId = this.getNodeParameter('sequenceId', index) as string;
			return await nooviChatApiRequest.call(this, 'DELETE', `${base}/${sequenceId}`);
		}
		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: "${operation}"`, { itemIndex: index });
	}
}

// WhatsApp Hub (NooviConnect) handlers
// Endpoints: GET /noovi_connect (index — no inboxId)
//            GET /noovi_connect/:id/groups
//            GET /noovi_connect/:id/newsletters
//            GET /noovi_connect/:id/hub_report
//            POST /noovi_connect/:id/create_group
//            GET /noovi_connect/:id/group_participants?group_jid=...
//            POST /noovi_connect/:id/add_participants
async function handleWhatsAppHubOperation(this: IExecuteFunctions, operation: string, index: number): Promise<any> {
	switch (operation) {
		case 'getSessions':
			// GET /api/v1/accounts/:accountId/noovi_connect — lists all NooviConnect sessions
			return await nooviChatApiRequest.call(this, 'GET', '/noovi_connect');

		case 'getGroups': {
			const inboxId = this.getNodeParameter('inboxId', index) as string;
			return await nooviChatApiRequest.call(this, 'GET', `/noovi_connect/${inboxId}/groups`);
		}

		case 'getChannels': {
			const inboxId = this.getNodeParameter('inboxId', index) as string;
			return await nooviChatApiRequest.call(this, 'GET', `/noovi_connect/${inboxId}/newsletters`);
		}

		case 'getReport': {
			const inboxId = this.getNodeParameter('inboxId', index) as string;
			return await nooviChatApiRequest.call(this, 'GET', `/noovi_connect/${inboxId}/hub_report`);
		}

		case 'createGroup': {
			const inboxId = this.getNodeParameter('inboxId', index) as string;
			const title = this.getNodeParameter('title', index) as string;
			const participantsRaw = this.getNodeParameter('participants', index) as string;
			const participants = participantsRaw
				.split(',')
				.map((p: string) => p.trim())
				.filter((p: string) => p.length > 0);
			return await nooviChatApiRequest.call(this, 'POST', `/noovi_connect/${inboxId}/create_group`, {
				title,
				participants,
			});
		}

		case 'getParticipants': {
			const inboxId = this.getNodeParameter('inboxId', index) as string;
			const groupJid = this.getNodeParameter('groupJid', index) as string;
			return await nooviChatApiRequest.call(this, 'GET', `/noovi_connect/${inboxId}/group_participants`, {}, {
				group_jid: groupJid,
			});
		}

		case 'addParticipants': {
			const inboxId = this.getNodeParameter('inboxId', index) as string;
			const groupJid = this.getNodeParameter('groupJid', index) as string;
			const phonesRaw = this.getNodeParameter('phones', index) as string;
			const phones = phonesRaw
				.split(',')
				.map((p: string) => p.trim())
				.filter((p: string) => p.length > 0);
			return await nooviChatApiRequest.call(this, 'POST', `/noovi_connect/${inboxId}/add_participants`, {
				group_jid: groupJid,
				phones,
			});
		}

		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: "${operation}"`, { itemIndex: index });
	}
}