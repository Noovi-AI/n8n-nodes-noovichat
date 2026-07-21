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
					{ name: 'Conversation Status Changed', value: 'conversation_status_changed', description: 'Conversation status changed to open, resolved, or pending' },
					{ name: 'Conversation Updated', value: 'conversation_updated', description: 'Conversation data was updated' },
					{ name: 'Conversation Created', value: 'conversation_created', description: 'A new conversation was created' },
					// Contact events
					{ name: 'Contact Created', value: 'contact_created', description: 'A new contact was created' },
					{ name: 'Contact Updated', value: 'contact_updated', description: 'Contact information was updated' },
					// Message events
					{ name: 'Message Created', value: 'message_created', description: 'A new message was received or sent' },
					{ name: 'Message Updated', value: 'message_updated', description: 'An existing message was updated' },
					// Widget and inbox events
					{ name: 'Webwidget Triggered', value: 'webwidget_triggered', description: 'Website widget was triggered by a visitor' },
					{ name: 'Inbox Created', value: 'inbox_created', description: 'A new inbox was created' },
					{ name: 'Inbox Updated', value: 'inbox_updated', description: 'Inbox information was updated' },
					{ name: 'Conversation Typing On', value: 'conversation_typing_on', description: 'Contact is currently typing' },
					{ name: 'Conversation Typing Off', value: 'conversation_typing_off', description: 'Contact stopped typing' },
					// NooviChat exclusive — Appointment events (Fase 7 Atendimentos)
					{ name: 'Appointment Created', value: 'appointment.created', description: 'A new appointment was created' },
					{ name: 'Appointment Updated', value: 'appointment.updated', description: 'An appointment was updated or rescheduled' },
					{ name: 'Appointment Confirmed', value: 'appointment.confirmed', description: 'An appointment was confirmed by the professional or receptionist' },
					{ name: 'Appointment Completed', value: 'appointment.completed', description: 'An appointment was marked as completed' },
					{ name: 'Appointment Cancelled', value: 'appointment.cancelled', description: 'An appointment was cancelled' },
					{ name: 'Appointment No Show', value: 'appointment.no_show', description: 'Contact did not attend the appointment (no-show)' },
					{ name: 'Appointment Rescheduled', value: 'appointment.rescheduled', description: 'An appointment was rescheduled to a new date/time' },
					// NooviChat exclusive — Reminder events
					{ name: 'Reminder Sent', value: 'reminder.sent', description: 'An appointment reminder was successfully sent to the contact' },
					{ name: 'Reminder Failed', value: 'reminder.failed', description: 'An appointment reminder failed to send' },
					// NooviChat exclusive — Professional events
					{ name: 'Professional Created', value: 'professional.created', description: 'A new professional was created' },
					{ name: 'Professional Updated', value: 'professional.updated', description: 'A professional record was updated' },
					// NooviChat exclusive — Service events
					{ name: 'Service Created', value: 'service.created', description: 'A new service was created' },
					{ name: 'Service Updated', value: 'service.updated', description: 'A service record was updated' },
					// NooviChat exclusive — Follow-up lifecycle events (Chatwoot fase-11)
					{ name: 'Follow-up Scheduled', value: 'follow_up_scheduled', description: 'A follow-up was scheduled' },
					{ name: 'Follow-up Sent', value: 'follow_up_sent', description: 'A follow-up message was sent' },
					{ name: 'Follow-up Failed', value: 'follow_up_failed', description: 'A follow-up failed to send' },
					{ name: 'Follow-up Cancelled', value: 'follow_up_cancelled', description: 'A follow-up was cancelled' },
					{ name: 'Broadcast Follow-up Sent', value: 'broadcast_follow_up_sent', description: 'A broadcast follow-up was sent to a non-replier' },
					{ name: 'Broadcast Started', value: 'broadcast_started', description: 'A broadcast started sending (entered running state)' },
					{ name: 'Broadcast Completed', value: 'broadcast_completed', description: 'A broadcast finished sending all contacts' },
				],
				description: 'Event type to listen for',
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
					const response = await nooviChatApiRequest.call(this, 'GET', '/webhooks');
					const webhookList = response?.payload?.webhooks;
					if (!Array.isArray(webhookList)) {
						return false;
					}

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
					webhook: {
						url: webhookUrl,
						subscriptions: [event],
					},
				});
				const createdWebhook = response?.payload?.webhook;

				if (!createdWebhook?.id) {
					throw new NodeOperationError(
						this.getNode(),
						'Failed to register webhook in NooviChat: response is missing the webhook ID',
					);
				}

				webhookData.webhookId = createdWebhook.id;
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

		// Validate webhook signature if secret is configured.
		//
		// Backend (Chatwoot lib/webhooks/trigger.rb:46-50):
		//   headers['X-Chatwoot-Timestamp'] = ts
		//   headers['X-Chatwoot-Signature'] = "sha256=#{HMAC-SHA256(secret, "#{ts}.#{body}")}"
		//
		// In 0.8.3 and earlier this validation looked at the wrong header
		// (`x-hub-signature`) with the wrong signing payload (body only, no
		// timestamp prefix). Result: when a webhookSecret was configured the
		// trigger silently dropped every event. Fixed in 0.8.4 to match the
		// backend contract exactly.
		try {
			const webhookCredentials = await this.getCredentials('nooviChatWebhookApi');
			if (webhookCredentials?.webhookSecret) {
				const headers = this.getHeaderData() as IDataObject;
				const headerSignature = (headers['x-chatwoot-signature'] ||
					headers['X-Chatwoot-Signature']) as string | undefined;
				const headerTimestamp = (headers['x-chatwoot-timestamp'] ||
					headers['X-Chatwoot-Timestamp']) as string | undefined;

				if (!headerSignature || !headerTimestamp) {
					// Fail-closed: when secret is set, both headers are required.
					return { workflowData: [[]] };
				}

				// Note: re-serializing the parsed body is not always byte-identical
				// with the original raw bytes (key order, unicode escaping).
				// Ruby's `to_json` and Node's `JSON.stringify` produce compatible
				// output for the shapes Chatwoot sends today. If HMAC verification
				// starts failing for specific payloads, the proper fix is to read
				// the raw request body — not exposed in older n8n versions, so we
				// use re-serialize as the pragmatic baseline.
				const signingPayload = `${headerTimestamp}.${JSON.stringify(body)}`;
				const expectedSignature = crypto
					.createHmac('sha256', webhookCredentials.webhookSecret as string)
					.update(signingPayload)
					.digest('hex');

				const expectedFull = `sha256=${expectedSignature}`;
				const expectedBuf = Buffer.from(expectedFull);
				const actualBuf = Buffer.from(headerSignature);
				if (
					expectedBuf.length !== actualBuf.length ||
					!crypto.timingSafeEqual(expectedBuf, actualBuf)
				) {
					return { workflowData: [[]] };
				}
			}
		} catch (error: any) {
			// Skip signature validation only when the credential is not configured.
			// Re-throw any unexpected errors so they surface properly.
			const isUnconfigured =
				error?.name === 'NodeCredentialsError' ||
				error?.errorType === 'CREDENTIALS_FETCH_ERROR' ||
				error?.message?.includes('not found') ||
				error?.message?.includes('No credentials');
			if (!isUnconfigured) {
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

		const data = (body.data || body) as IDataObject;

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
