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
			placeholder: 'https://chat.seudominio.com',
			description: 'URL da sua instância NooviChat (sem barra final)',
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
			description: 'Token de acesso da API (obtido em Settings > Account Settings)',
			required: true,
		},
		{
			displayName: 'Account ID',
			name: 'accountId',
			type: 'number',
			default: 1,
			description: 'ID da conta NooviChat',
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
			url: '/api/v1/accounts/{{$credentials.accountId}}/agents',
			method: 'GET' as IHttpRequestMethods,
		},
	};
}