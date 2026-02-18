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
		description: 'Recebe webhooks do NooviChat e inicia workflows automaticamente',
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
				path: 'webhook',
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
				description: 'ID da conta NooviChat. Aceita expressões para workflows multi-conta.',
			},
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				required: true,
				default: 'message_created',
				options: [
					// Conversation events
					{ name: 'Conversation Created', value: 'conversation_created', description: 'Nova conversa criada' },
					{ name: 'Conversation Status Changed', value: 'conversation_status_changed', description: 'Status alterado (open/resolved/pending)' },
					{ name: 'Conversation Typing Off', value: 'conversation_typing_off', description: 'Contato parou de digitar' },
					{ name: 'Conversation Typing On', value: 'conversation_typing_on', description: 'Contato digitando' },
					{ name: 'Conversation Updated', value: 'conversation_updated', description: 'Conversa atualizada' },
					// Message events
					{ name: 'Message Created', value: 'message_created', description: 'Nova mensagem recebida' },
					{ name: 'Message Updated', value: 'message_updated', description: 'Mensagem atualizada' },
					// Contact events
					{ name: 'Contact Created', value: 'contact_created', description: 'Novo contato criado' },
					{ name: 'Contact Updated', value: 'contact_updated', description: 'Contato atualizado' },
					// Widget events
					{ name: 'Webwidget Triggered', value: 'webwidget_triggered', description: 'Widget do site ativado' },
					// NooviChat exclusive — Pipeline/Deal events
					{ name: 'Deal Created', value: 'pipeline_card_created', description: 'Novo deal criado no pipeline' },
					{ name: 'Deal Lost', value: 'pipeline_card_lost', description: 'Deal marcado como perdido' },
					{ name: 'Deal Stage Changed', value: 'pipeline_card_stage_changed', description: 'Deal movido para outro estágio' },
					{ name: 'Deal Updated', value: 'pipeline_card_updated', description: 'Deal atualizado' },
					{ name: 'Deal Won', value: 'pipeline_card_won', description: 'Deal marcado como ganho' },
					// NooviChat exclusive — Follow-up events
					{ name: 'Follow-up Due', value: 'follow_up_due', description: 'Follow-up vencendo agora' },
					{ name: 'Follow-up Overdue', value: 'follow_up_overdue', description: 'Follow-up em atraso' },
					// NooviChat exclusive — Activity events
					{ name: 'Activity Due', value: 'activity_due', description: 'Atividade vencendo agora' },
					// NooviChat exclusive — SLA events
					{ name: 'SLA Breach', value: 'sla_breach', description: 'SLA violado' },
					// NooviChat exclusive — WAHA events
					{ name: 'WAHA Status Changed', value: 'waha_status_changed', description: 'Status da sessão WAHA alterado' },
					// NooviChat exclusive — Campaign events
					{ name: 'Campaign Completed', value: 'campaign_completed', description: 'Campanha finalizada' },
				],
				description: 'Evento para escutar',
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
						description: 'Filtrar eventos por ID da inbox (deixe vazio para todos)',
					},
					{
						displayName: 'Team ID',
						name: 'teamId',
						type: 'string',
						default: '',
						description: 'Filtrar eventos por ID da equipe (deixe vazio para todos)',
					},
					{
						displayName: 'Pipeline ID',
						name: 'pipelineId',
						type: 'string',
						default: '',
						description: 'Filtrar eventos de deal por ID do pipeline (deixe vazio para todos)',
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
						'Falha ao criar webhook no NooviChat: resposta sem ID',
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
		} catch {
			// No webhook credentials configured — skip signature validation
		}

		// Validate event type matches what this trigger listens for
		const webhookEvent = (body.event || body.type) as string;
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
