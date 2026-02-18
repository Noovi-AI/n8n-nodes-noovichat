import {
	IAuthenticateGeneric,
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
			description: 'Secret used to validate incoming webhook signatures. Leave empty to skip validation.',
			required: false,
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {},
	};
}