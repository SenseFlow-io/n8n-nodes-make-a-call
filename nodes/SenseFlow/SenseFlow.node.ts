import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';
import { startPhoneCall, waitForPhoneCallCompletion } from './senseflow-api';

export class SenseFlow implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'SenseFlow',
		name: 'senseFlow',
		icon: {
			light: 'file:logo.png',
			dark: 'file:logo.png',
		},
		group: ['transform'],
		version: 1,
		description: 'SenseFlow Node - Voice agent telephony at your fingertips',
		defaults: {
			name: 'SenseFlow',
		},
		inputs: [NodeConnectionType.Main], // What does this mean?
		outputs: [NodeConnectionType.Main], // What does this mean?
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
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				options: [
					{ name: 'Make a Phone Call',  value: 'makePhoneCall', description: 'Start a phone call and wait until it has completed', action: 'Make a phone call' },
					{ name: 'Start a Phone Call',  value: 'startPhoneCall', description: 'Start a phone call without waiting for it to complete', action: 'Start a phone call' },
					{ name: 'Wait for Call Result', value: 'waitForCallResult', description: 'Wait until the previously-started phone call has completed', action: 'Wait for a phone call to end' },
				],
				default: 'makePhoneCall',
				noDataExpression: true,
			},

			// To Number (required when starting a call)
			{
				displayName: 'To Number',
				name: 'toNumber',
				type: 'string',
				required: true,
				default: '+15551234567',
				placeholder: '+15551234567',
				description: 'Destination phone number in E.164 format',
				displayOptions: {
					show: {
						operation: ['makePhoneCall', 'startPhoneCall'],
					},
				},
			},

			{
				displayName: 'Language',
				name: 'language',
				type: 'options',
				options: [
					{ name: 'English', value: 'en' },
					{ name: 'Czech',   value: 'cs' },
				],
				default: 'en',
				description: 'Language used by the voice agent',
				displayOptions: {
					show: {
						operation: ['makePhoneCall', 'startPhoneCall'],
					},
				},
			},

			{
				displayName: 'First Message',
				name: 'firstMessage',
				type: 'string',
				default: 'Hi Bob, this is AI assistant for Alice Johnson calling.',
				placeholder: 'Opening sentence spoken by the agent',
				description: 'Opening sentence the agent should start with',
				displayOptions: {
					show: {
						operation: ['makePhoneCall', 'startPhoneCall'],
					},
				},
			},

			{
				displayName: 'On Behalf Of',
				name: 'onBehalfOf',
				type: 'string',
				default: 'Alice Johnson',
				placeholder: 'Alice Johnson',
				description: 'Name of the person/company on whose behalf the call is made',
				displayOptions: {
					show: {
						operation: ['makePhoneCall', 'startPhoneCall'],
					},
				},
			},

			{
				displayName: 'Goal',
				name: 'goal',
				type: 'string',
				default: 'Book a 30-minute meeting next week.',
				placeholder: 'Desired outcome of the call',
				description: 'The end goal that the agent should try to achieve',
				displayOptions: {
					show: {
						operation: ['makePhoneCall', 'startPhoneCall'],
					},
				},
			},

			{
				displayName: 'Context',
				name: 'context',
				type: 'string',
				default: '',
				placeholder: 'Additional relevant information for the agent',
				description: 'Contextual information to help the agent conduct the call',
				typeOptions: {
					rows: 4,
				},
				displayOptions: {
					show: {
						operation: ['makePhoneCall', 'startPhoneCall'],
					},
				},
			},

			// Call ID (required when waiting for a call)
			{
				displayName: 'Call ID',
				name: 'callId',
				type: 'string',
				required: true,
				default: '',
				placeholder: '8f41d9f3-c1e4-4d0d-93ff-e70bc5b6b6a1',
				description: 'Identifier returned by the "Start a Phone Call" operation',
				displayOptions: {
					show: {
						operation: ['waitForCallResult'],
					},
				},
			},
		],
	};

	// The function below is responsible for actually doing whatever this node
	// is supposed to do. In this case, we're just appending the `myString` property
	// with whatever the user has entered.
	// You can make async calls and use `await`.
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnItems: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			const item = items[itemIndex];

			try {
				const operation = this.getNodeParameter('operation', itemIndex) as string;

				if (operation === 'makePhoneCall') {
					const payload = {
						to_number: this.getNodeParameter('toNumber', itemIndex) as string,
						language: this.getNodeParameter('language', itemIndex) as string,
						first_message: this.getNodeParameter('firstMessage', itemIndex) as string,
						on_behalf_of: this.getNodeParameter('onBehalfOf', itemIndex) as string,
						goal: this.getNodeParameter('goal', itemIndex) as string,
						context: this.getNodeParameter('context', itemIndex) as string,
					};

					// 1) Start the call, 2) wait for completion
					const callId = await startPhoneCall.call(this, payload);
					const result = await waitForPhoneCallCompletion.call(this, callId);

					returnItems.push({
						json: {
							...item.json,
							callId,
							...result,
						},
					});
				} else if (operation === 'startPhoneCall') {
					const payload = {
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
							...item.json,
							callId,
						},
					});
				} else if (operation === 'waitForCallResult') {
					const callId = this.getNodeParameter('callId', itemIndex) as string;
					const result = await waitForPhoneCallCompletion.call(this, callId);

					returnItems.push({
						json: {
							...item.json,
							callId,
							...result,
						},
					});
				} else {
					throw new NodeOperationError(this.getNode(), `Unsupported operation: ${operation}`, { itemIndex });
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnItems.push({ json: { ...items[itemIndex].json }, error, pairedItem: itemIndex });
				} else {
					throw new NodeOperationError(this.getNode(), error as Error, { itemIndex });
				}
			}
		}

		return [returnItems];
	}
}
