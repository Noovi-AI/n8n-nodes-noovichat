import crypto from 'crypto';
import {
	IHookFunctions,
	IWebhookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
	IDataObject,
	INodeExecutionData,
	NodeOperationError,
} from 'n8n-workflow';

import { nooviChatApiRequest } from './GenericFunctions';

export class NooviChatTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'NooviChat Trigger',
		name: 'nooviChatTrigger',
		icon: 'file:noovichat.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["event"]}}',
		description: 'Receive webhooks from NooviChat and trigger workflows automatically',
		documentationUrl: 'https://doc.nooviai.com/docs/noovichat/webhooks/',
		defaults: {
			name: 'NooviChat Trigger',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'nooviChatApi',
				required: true,
			},
			{
				name: 'nooviChatWebhookApi',
				required: false,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'noovichat',
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
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				required: true,
				default: 'message_created',
				options: [
					// Conversation events
					{ name: 'Conversation Created', value: 'conversation_created', description: 'A new conversation was created' },
					{ name: 'Conversation Status Changed', value: 'conversation_status_changed', description: 'Conversation status changed to open, resolved, or pending' },
					{ name: 'Conversation Typing Off', value: 'conversation_typing_off', description: 'Contact stopped typing' },
					{ name: 'Conversation Typing On', value: 'conversation_typing_on', description: 'Contact is currently typing' },
					{ name: 'Conversation Updated', value: 'conversation_updated', description: 'Conversation data was updated' },
					// Message events
					{ name: 'Message Created', value: 'message_created', description: 'A new message was received or sent' },
					{ name: 'Message Updated', value: 'message_updated', description: 'An existing message was updated' },
					// Contact events
					{ name: 'Contact Created', value: 'contact_created', description: 'A new contact was created' },
					{ name: 'Contact Updated', value: 'contact_updated', description: 'Contact information was updated' },
					// Widget events
					{ name: 'Webwidget Triggered', value: 'webwidget_triggered', description: 'Website widget was triggered by a visitor' },
					// NooviChat exclusive — Pipeline/Deal events
					{ name: 'Deal Created', value: 'pipeline_card_created', description: 'A new deal was created in the pipeline' },
					{ name: 'Deal Lost', value: 'pipeline_card_lost', description: 'Deal was marked as lost' },
					{ name: 'Deal Stage Changed', value: 'pipeline_card_stage_changed', description: 'Deal was moved to a different stage' },
					{ name: 'Deal Updated', value: 'pipeline_card_updated', description: 'Deal information was updated' },
					{ name: 'Deal Won', value: 'pipeline_card_won', description: 'Deal was marked as won' },
					// NooviChat exclusive — Follow-up events
					{ name: 'Follow-up Due', value: 'follow_up_due', description: 'A follow-up task is due now' },
					{ name: 'Follow-up Overdue', value: 'follow_up_overdue', description: 'A follow-up task is overdue' },
					// NooviChat exclusive — Activity events
					{ name: 'Activity Due', value: 'activity_due', description: 'An activity is due now' },
					// NooviChat exclusive — SLA events
					{ name: 'SLA Breach', value: 'sla_breach', description: 'An SLA policy was breached' },
					// NooviChat exclusive — WAHA events
					{ name: 'WAHA Status Changed', value: 'waha_status_changed', description: 'WAHA session status changed' },
				],
				description: 'Event type to listen for',
			},
			{
				displayName: 'Filters',
				name: 'filters',
				type: 'collection',
				placeholder: 'Add Filter',
				default: {},
				options: [
					{
						displayName: 'Inbox ID',
						name: 'inboxId',
						type: 'string',
						default: '',
						description: 'Filter events by inbox ID. Leave empty to receive events from all inboxes.',
					},
					{
						displayName: 'Team ID',
						name: 'teamId',
						type: 'string',
						default: '',
						description: 'Filter events by team ID. Leave empty to receive events from all teams.',
					},
					{
						displayName: 'Pipeline ID',
						name: 'pipelineId',
						type: 'string',
						default: '',
						description: 'Filter deal events by pipeline ID. Leave empty to receive events from all pipelines.',
					},
				],
			},
		],
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');

				if (webhookData.webhookId === undefined) {
					return false;
				}

				const webhookUrl = this.getNodeWebhookUrl('default') as string;

				try {
					const webhooks = await nooviChatApiRequest.call(this, 'GET', '/webhooks');
					const webhookList = Array.isArray(webhooks) ? webhooks : (webhooks?.payload || []);

					const exists = webhookList.some(
						(w: IDataObject) => w.id === webhookData.webhookId && w.url === webhookUrl,
					);

					if (!exists) {
						delete webhookData.webhookId;
						return false;
					}

					return true;
				} catch {
					return false;
				}
			},

			async create(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');
				const webhookUrl = this.getNodeWebhookUrl('default') as string;
				const event = this.getNodeParameter('event') as string;

				const response = await nooviChatApiRequest.call(this, 'POST', '/webhooks', {
					url: webhookUrl,
					subscriptions: [event],
				});

				if (!response?.id) {
					throw new NodeOperationError(
						this.getNode(),
						'Failed to register webhook in NooviChat: response is missing the webhook ID',
					);
				}

				webhookData.webhookId = response.id;
				return true;
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');

				if (webhookData.webhookId !== undefined) {
					try {
						await nooviChatApiRequest.call(this, 'DELETE', `/webhooks/${webhookData.webhookId}`);
					} catch {
						return false;
					}
					delete webhookData.webhookId;
				}

				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const body = this.getBodyData() as IDataObject;
		const event = this.getNodeParameter('event') as string;
		const filters = this.getNodeParameter('filters', {}) as IDataObject;

		// Validate webhook signature if secret is configured
		try {
			const webhookCredentials = await this.getCredentials('nooviChatWebhookApi');
			if (webhookCredentials?.webhookSecret) {
				const headerSignature = this.getHeaderData()['x-hub-signature'] as string | undefined;
				if (!headerSignature) {
					return { workflowData: [[]] };
				}

				const expectedSignature = crypto
					.createHmac('sha256', webhookCredentials.webhookSecret as string)
					.update(JSON.stringify(body))
					.digest('hex');

				if (`sha256=${expectedSignature}` !== headerSignature) {
					return { workflowData: [[]] };
				}
			}
		} catch (error: any) {
			// Skip signature validation only when the credential is not configured.
			// Re-throw any unexpected errors so they surface properly.
			if (!error?.message?.includes('not found') && !error?.message?.includes('No credentials')) {
				throw error;
			}
		}

		// Validate event type matches what this trigger listens for.
		// If the body contains no event field at all, allow it through so
		// payloads from non-standard senders are not silently dropped.
		const webhookEvent = (body.event || body.type) as string | undefined;
		if (webhookEvent && webhookEvent !== event) {
			return { workflowData: [[]] };
		}

		// Apply optional filters
		const data = (body.data || body) as IDataObject;
		if (filters.inboxId && data.inbox_id !== undefined && String(data.inbox_id) !== String(filters.inboxId)) {
			return { workflowData: [[]] };
		}
		if (filters.teamId && data.team_id !== undefined && String(data.team_id) !== String(filters.teamId)) {
			return { workflowData: [[]] };
		}
		if (filters.pipelineId && data.pipeline_id !== undefined && String(data.pipeline_id) !== String(filters.pipelineId)) {
			return { workflowData: [[]] };
		}

		const returnData: INodeExecutionData[] = [
			{
				json: {
					event: webhookEvent || event,
					timestamp: new Date().toISOString(),
					data,
				},
			},
		];

		return {
			workflowData: [returnData],
		};
	}
}
