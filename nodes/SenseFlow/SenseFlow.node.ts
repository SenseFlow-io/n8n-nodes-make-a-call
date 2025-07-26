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
		group: ['transform'],
		version: 1,
		description: 'SenseFlow Node - Voice agent telephony at your fingertips',
		defaults: {
			name: 'SenseFlow',
		},
		inputs: [NodeConnectionType.Main], // What does this mean?
		outputs: [NodeConnectionType.Main], // What does this mean?
		usableAsTool: true,
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

			// Phone Number (required when starting a call)
			{
				displayName: 'Phone Number',
				name: 'phoneNumber',
				type: 'string',
				required: true,
				default: '',
				placeholder: '+15551234567',
				description: 'Number to call in E.164 format',
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
					const phoneNumber = this.getNodeParameter('phoneNumber', itemIndex) as string;

					// 1) Start the call, 2) wait for completion
					const callId = await startPhoneCall.call(this, phoneNumber);
					const result = await waitForPhoneCallCompletion.call(this, callId);

					returnItems.push({
						json: {
							...item.json,
							callId,
							...result,
						},
					});
				} else if (operation === 'startPhoneCall') {
					const phoneNumber = this.getNodeParameter('phoneNumber', itemIndex) as string;
					const callId = await startPhoneCall.call(this, phoneNumber);

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
