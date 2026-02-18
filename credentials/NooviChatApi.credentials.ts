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
	};
}