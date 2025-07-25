import {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class SenseFlowApi implements ICredentialType {
	name = 'senseFlowApi';
	displayName = 'SenseFlow API';
	documentationUrl = 'https://app.senseflow.io/integrations';
	icon: Icon = "file:logo.png";
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			default: '',
			typeOptions: {
				password: true,
			}
		}
	];

	// This allows the credential to be used by other parts of n8n
	// stating how this credential is injected as part of the request
	// An example is the Http Request node that can make generic calls
	// reusing this credential
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				"X-API-Key": "={{$credentials.apiKey}}",
			},
		},
	};

	// The block below tells how this credential can be tested
	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://app.senseflow.io',
			url: '/api/phone-call/',
		},
		rules: [
			{
				type: 'responseCode',
				properties: {
					value: 200,
					message: 'You are authenticated!',
				},
			},
		],
	};
}
