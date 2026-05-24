import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	IHttpRequestMethods,
	INodeProperties,
} from 'n8n-workflow';

export class NooviChatApi implements ICredentialType {
	name = 'nooviChatApi';
	displayName = 'NooviChat API';
	documentationUrl = 'https://doc.nooviai.com/docs/guides/authentication/';
	properties: INodeProperties[] = [
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			typeOptions: {
				password: false,
			},
			default: '',
			placeholder: 'https://chat.yourdomain.com',
			description: 'URL of your NooviChat instance (no trailing slash)',
			required: true,
		},
		{
			displayName: 'API Access Token',
			name: 'apiAccessToken',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'API access token. Found in NooviChat under Settings > Account Settings > API Keys',
			required: true,
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				api_access_token: '={{$credentials.apiAccessToken}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/api/v1/profile',
			method: 'GET' as IHttpRequestMethods,
		},
		rules: [
			{
				type: 'responseCode',
				properties: {
					value: 401,
					message:
						'Token rejected (401). Check Settings → Account → API Access Token in your NooviChat instance and copy the token exactly.',
				},
			},
			{
				type: 'responseCode',
				properties: {
					value: 403,
					message:
						'Token is valid but lacks permission to read profile (403). Use an admin or agent token, not a custom-scope token.',
				},
			},
			{
				type: 'responseCode',
				properties: {
					value: 404,
					message:
						'Endpoint /api/v1/profile not found (404). Confirm Base URL points to a NooviChat/Chatwoot root (e.g. https://chat.example.com), not to /app or /api directly.',
				},
			},
		],
	};
}