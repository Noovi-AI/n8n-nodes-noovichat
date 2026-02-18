import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class NooviChatWebhookApi implements ICredentialType {
	name = 'nooviChatWebhookApi';
	displayName = 'NooviChat Webhook API';
	documentationUrl = 'https://doc.nooviai.com/docs/guides/authentication/';
	properties: INodeProperties[] = [
		{
			displayName: 'Webhook Secret',
			name: 'webhookSecret',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'Secret usado para validar webhooks recebidos (opcional)',
			required: false,
		},
	];
}