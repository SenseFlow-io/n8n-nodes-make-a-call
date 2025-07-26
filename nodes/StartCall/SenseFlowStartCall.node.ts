import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
	NodeApiError,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

interface StartCallPayload extends IDataObject {
	to_number: string;
	language: string;
	first_message?: string;
	on_behalf_of?: string;
	goal?: string;
	context?: string;
}

const SENSEFLOW_API_BASE = 'https://app.senseflow.io';

async function startPhoneCall(this: IExecuteFunctions, payload: StartCallPayload): Promise<string> {
	const requestOptions = {
		method: 'POST' as const,
		url: `${SENSEFLOW_API_BASE}/api/phone-call/`,
		body: payload as IDataObject,
		json: true,
	};

	const response = (await this.helpers.httpRequestWithAuthentication.call(this, 'senseFlowApi', requestOptions)) as {
		id: string;
	};

	return response.id;
}

export class SenseFlowStartCall implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'SenseFlow Start Call',
		name: 'senseFlowStartCall',
		icon: {
			light: 'file:../SenseFlow/logo.png',
			dark: 'file:../SenseFlow/logo.png',
		},
		group: ['operation'],
		version: 1,
		description: 'Start a SenseFlow phone call',
		defaults: {
			name: 'SenseFlow Start Call',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		usableAsTool: true,
		credentials: [
			{
				name: 'senseFlowApi',
				required: true,
				testedBy: 'senseFlowApi',
			},
		],
		properties: [
			{
				displayName: 'To Number',
				name: 'toNumber',
				type: 'string',
				required: true,
				default: '+15551234567',
				placeholder: '+15551234567',
				description: 'Destination phone number in E.164 format',
			},
			{
				displayName: 'Language',
				name: 'language',
				type: 'options',
				options: [
					{ name: 'English', value: 'en' },
					{ name: 'Czech', value: 'cs' },
				],
				default: 'en',
				description: 'Language used by the voice agent',
			},
			{
				displayName: 'First Message',
				name: 'firstMessage',
				type: 'string',
				default: 'Hi John, this is the AI assistant calling on behalf of Berlin City Suites.',
				placeholder: 'Opening sentence spoken by the agent',
				description: 'Opening sentence the agent should start with',
			},
			{
				displayName: 'On Behalf Of',
				name: 'onBehalfOf',
				type: 'string',
				default: 'Berlin City Suites',
				placeholder: 'Berlin City Suites',
				description: 'Name of the person/company on whose behalf the call is made',
			},
			{
				displayName: 'Goal',
				name: 'goal',
				type: 'string',
				default: 'Confirm John’s check-in time and note any special requests for booking PA-8721.',
				placeholder: 'Desired outcome of the call',
				description: 'The end goal that the agent should try to achieve',
			},
			{
				displayName: 'Context',
				name: 'context',
				type: 'string',
				default: 'Guest name: John Miller\nBooking ID: PA-8721\nProperty: Brandenburg Gate View Suite\nArrival: 12 Aug 2025 (3 nights)\nGuest requested: late checkout.',
				placeholder: 'Additional relevant information for the agent',
				typeOptions: {
					rows: 4,
				},
				description: 'Contextual information to help the agent conduct the call',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnItems: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const payload: StartCallPayload = {
					to_number: this.getNodeParameter('toNumber', itemIndex) as string,
					language: this.getNodeParameter('language', itemIndex) as string,
					first_message: this.getNodeParameter('firstMessage', itemIndex) as string,
					on_behalf_of: this.getNodeParameter('onBehalfOf', itemIndex) as string,
					goal: this.getNodeParameter('goal', itemIndex) as string,
					context: this.getNodeParameter('context', itemIndex) as string,
				};

				const callId = await startPhoneCall.call(this, payload);

				returnItems.push({
					json: {
						...items[itemIndex].json,
						id: callId
					},
				});
			} catch (error) {
				if (error?.constructor?.name === 'NodeApiError') {
					throw error;
				}

				if (this.continueOnFail()) {
					returnItems.push({
						json: { ...items[itemIndex].json },
						error: error as NodeApiError,
						pairedItem: itemIndex,
					});
				} else {
					throw new NodeOperationError(this.getNode(), error as Error, { itemIndex });
				}
			}
		}

		return [returnItems];
	}
}
