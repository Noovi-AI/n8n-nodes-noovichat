import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

import { nooviChatApiRequest, nooviChatApiRequestAllItems, formatExecutionData, parseJsonValue } from './GenericFunctions';

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
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
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
					default:
						throw new NodeOperationError(this.getNode(), `Unknown resource: "${resource}"`, { itemIndex: i });
				}

				returnData.push(...formatExecutionData(responseData, i));
			} catch (error: any) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error.message,
							resource,
							operation,
							statusCode: (error as any)?.response?.statusCode,
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
			return await nooviChatApiRequest.call(this, 'POST', `/conversations/${conversationId}/labels`, {
				labels: labels.split(',').map(l => l.trim()),
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
			if (additionalFields.identifier) body.identifier = additionalFields.identifier;
			if (additionalFields.customAttributes) {
				body.custom_attributes = parseJsonValue(additionalFields.customAttributes);
			}
			return await nooviChatApiRequest.call(this, 'POST', '/contacts', body);
		}
		case 'get':
			return await nooviChatApiRequest.call(this, 'GET', `/contacts/${contactId}`);
		case 'getAll': {
			const sort = this.getNodeParameter('sort', index, 'name') as string;
			const qs: any = { sort };
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
			const qs: any = { q: query };
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
			return await nooviChatApiRequest.call(this, 'POST', '/inbox_members', {
				inbox_id: inboxId,
				user_ids: agentIds.split(',').map(id => parseInt(id.trim())),
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
			return await nooviChatApiRequest.call(this, 'POST', '/agents', { name, email, role });
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
			return await nooviChatApiRequest.call(this, 'POST', `/teams/${teamId}/team_members`, {
				user_ids: memberIds.split(',').map(id => parseInt(id.trim())),
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
			return await nooviChatApiRequest.call(this, 'PATCH', `/custom_attribute_definitions/${attributeId}`, { display_name: displayName });
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
			return await nooviChatApiRequest.call(this, 'POST', '/pipelines', { name, description });
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
			const created = [];
			for (const stage of stagesCollection) {
				const result = await nooviChatApiRequest.call(this, 'POST', `/pipelines/${pipelineId}/stages`, {
					name: stage.stageName,
					color: stage.stageColor || '#0066FF',
				});
				created.push(result);
			}
			return created;
		}
		case 'updateStage': {
			const stageName = this.getNodeParameter('stageName', index, '') as string;
			const stageColor = this.getNodeParameter('stageColor', index, '') as string;
			const body: any = {};
			if (stageName) body.name = stageName;
			if (stageColor) body.color = stageColor;
			return await nooviChatApiRequest.call(this, 'PATCH', `/pipelines/stages/${stageId}`, body);
		}
		case 'deleteStage':
			return await nooviChatApiRequest.call(this, 'DELETE', `/pipelines/stages/${stageId}`);
		case 'reorderStages': {
			const stageOrderValues = this.getNodeParameter('stageOrder.values', index, []) as Array<{ id: string }>;
			return await nooviChatApiRequest.call(this, 'PATCH', `/pipelines/${pipelineId}/stages/reorder`, {
				stage_ids: stageOrderValues.map(s => parseInt(s.id)),
			});
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
			const stageId = this.getNodeParameter('stageId', index) as string;
			const additionalFields = this.getNodeParameter('additionalFields', index, {}) as any;
			const body: any = { title, pipeline_id: pipelineId, stage_id: stageId };
			if (additionalFields.contactId) body.contact_id = additionalFields.contactId;
			if (additionalFields.value) body.value = additionalFields.value;
			if (additionalFields.expectedCloseDate) body.expected_close_date = additionalFields.expectedCloseDate;
			if (additionalFields.assigneeId) body.assignee_id = additionalFields.assigneeId;
			return await nooviChatApiRequest.call(this, 'POST', '/pipeline_cards', body);
		}
		case 'get':
			return await nooviChatApiRequest.call(this, 'GET', `/pipeline_cards/${cardId}`);
		case 'getAll': {
			const filters = this.getNodeParameter('filters', index, {}) as any;
			const qs: any = {};
			if (filters.pipelineId) qs.pipeline_id = filters.pipelineId;
			if (filters.stageId) qs.stage_id = filters.stageId;
			if (filters.assigneeId) qs.assignee_id = filters.assigneeId;
			if (filters.status) qs.status = filters.status;
			if (!returnAll) qs.per_page = limit;
			if (returnAll) {
				return await nooviChatApiRequestAllItems.call(this, 'GET', '/pipeline_cards', {}, qs);
			}
			return await nooviChatApiRequest.call(this, 'GET', '/pipeline_cards', {}, qs);
		}
		case 'update': {
			const additionalFields = this.getNodeParameter('additionalFields', index, {}) as any;
			const body: any = {};
			if (additionalFields.title) body.title = additionalFields.title;
			if (additionalFields.value) body.value = additionalFields.value;
			if (additionalFields.expectedCloseDate) body.expected_close_date = additionalFields.expectedCloseDate;
			if (additionalFields.assigneeId) body.assignee_id = additionalFields.assigneeId;
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
		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: "${operation}"`, { itemIndex: index });
	}
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
			const title = this.getNodeParameter('title', index) as string;
			const description = this.getNodeParameter('description', index, '') as string;
			const dueAt = this.getNodeParameter('dueAt', index) as string;
			return await nooviChatApiRequest.call(this, 'POST', `/conversations/${conversationId}/follow-ups`, {
				title,
				description,
				due_at: dueAt,
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
			const description = this.getNodeParameter('description', index, '') as string;
			const dueAt = this.getNodeParameter('dueAt', index, '') as string;
			const body: any = {};
			if (title) body.title = title;
			if (description) body.description = description;
			if (dueAt) body.due_at = dueAt;
			return await nooviChatApiRequest.call(this, 'PATCH', `/conversations/${conversationId}/follow-ups/${followUpId}`, body);
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
			const title = this.getNodeParameter('title', index) as string;
			const activityType = this.getNodeParameter('activityType', index) as string;
			const additionalFields = this.getNodeParameter('additionalFields', index, {}) as any;
			const body: any = { title, type: activityType };
			if (additionalFields.description) body.description = additionalFields.description;
			if (additionalFields.dueAt) body.due_at = additionalFields.dueAt;
			if (additionalFields.assigneeId) body.assignee_id = additionalFields.assigneeId;
			if (additionalFields.cardId) body.card_id = additionalFields.cardId;
			return await nooviChatApiRequest.call(this, 'POST', '/pipeline/activities', body);
		}
		case 'get':
			return await nooviChatApiRequest.call(this, 'GET', `/pipeline/activities/${activityId}`);
		case 'getAll': {
			if (returnAll) {
				return await nooviChatApiRequestAllItems.call(this, 'GET', '/pipeline/activities');
			}
			return await nooviChatApiRequest.call(this, 'GET', '/pipeline/activities', {}, { per_page: limit });
		}
		case 'update': {
			const additionalFields = this.getNodeParameter('additionalFields', index, {}) as any;
			const body: any = {};
			if (additionalFields.title) body.title = additionalFields.title;
			if (additionalFields.description) body.description = additionalFields.description;
			if (additionalFields.dueAt) body.due_at = additionalFields.dueAt;
			if (additionalFields.assigneeId) body.assignee_id = additionalFields.assigneeId;
			return await nooviChatApiRequest.call(this, 'PATCH', `/pipeline/activities/${activityId}`, body);
		}
		case 'delete':
			return await nooviChatApiRequest.call(this, 'DELETE', `/pipeline/activities/${activityId}`);
		case 'start':
			return await nooviChatApiRequest.call(this, 'POST', `/pipeline/activities/${activityId}/start`);
		case 'complete':
			return await nooviChatApiRequest.call(this, 'POST', `/pipeline/activities/${activityId}/complete`);
		case 'cancel':
			return await nooviChatApiRequest.call(this, 'POST', `/pipeline/activities/${activityId}/cancel`);
		case 'getAnalytics': {
			const startDate = this.getNodeParameter('startDate', index, '') as string;
			const endDate = this.getNodeParameter('endDate', index, '') as string;
			const qs: any = {};
			if (startDate) qs.start_date = startDate;
			if (endDate) qs.end_date = endDate;
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
			const campaignType = this.getNodeParameter('campaignType', index) as string;
			const inboxId = this.getNodeParameter('inboxId', index) as number;
			const message = this.getNodeParameter('message', index) as string;
			const additionalFields = this.getNodeParameter('additionalFields', index, {}) as any;
			const body: any = { title, type: campaignType, inbox_id: inboxId, message };
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
		case 'pause':
			return await nooviChatApiRequest.call(this, 'POST', `/campaigns/${campaignId}/pause`);
		case 'resume':
			return await nooviChatApiRequest.call(this, 'POST', `/campaigns/${campaignId}/resume`);
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

	switch (operation) {
		case 'createPolicy': {
			const policyName = this.getNodeParameter('policyName', index) as string;
			const firstResponseTime = this.getNodeParameter('firstResponseTime', index) as number;
			const resolutionTime = this.getNodeParameter('resolutionTime', index, 0) as number;
			const inboxIdValues = this.getNodeParameter('inboxIds.values', index, []) as Array<{ id: number }>;
			const body: any = {
				name: policyName,
				first_response_time: firstResponseTime,
			};
			if (resolutionTime) body.resolution_time = resolutionTime;
			if (inboxIdValues.length > 0) body.inbox_ids = inboxIdValues.map(v => v.id);
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
			const firstResponseTime = this.getNodeParameter('firstResponseTime', index, 0) as number;
			const resolutionTime = this.getNodeParameter('resolutionTime', index, 0) as number;
			const inboxIdValues = this.getNodeParameter('inboxIds.values', index, []) as Array<{ id: number }>;
			const body: any = {};
			if (policyName) body.name = policyName;
			if (firstResponseTime) body.first_response_time = firstResponseTime;
			if (resolutionTime) body.resolution_time = resolutionTime;
			if (inboxIdValues.length > 0) body.inbox_ids = inboxIdValues.map(v => v.id);
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
			if (startDate) qs.start_date = startDate;
			if (endDate) qs.end_date = endDate;
			return await nooviChatApiRequest.call(this, 'GET', '/applied_slas/metrics', {}, qs);
		}
		case 'exportCsv': {
			const qs: any = {};
			if (startDate) qs.start_date = startDate;
			if (endDate) qs.end_date = endDate;
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
		case 'updateConfig': {
			const config = this.getNodeParameter('config', index) as any;
			const parsed = parseJsonValue(config);
			return await nooviChatApiRequest.call(this, 'PATCH', `/waha/${inboxId}/config`, parsed);
		}
		case 'getSettings':
			return await nooviChatApiRequest.call(this, 'GET', `/waha/${inboxId}/settings`);
		case 'updateMetaTracking': {
			const metaPixelId = this.getNodeParameter('metaPixelId', index, '') as string;
			const metaAccessToken = this.getNodeParameter('metaAccessToken', index, '') as string;
			return await nooviChatApiRequest.call(this, 'PATCH', `/waha/${inboxId}/settings/meta_tracking`, {
				pixel_id: metaPixelId,
				access_token: metaAccessToken,
			});
		}
		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: "${operation}"`, { itemIndex: index });
	}
}