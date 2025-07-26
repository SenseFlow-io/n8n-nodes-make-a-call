import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

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

			/* 1 — Choosing an operation */
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				displayOptions: { show: { resource: ['job'] } },
				/* “action” label is what n8n shows in the left sidebar */
				options: [
					{ name: 'Make a Phone Call',  value: 'makePhoneCall', description: 'Make a phone call and wait for the result', action: 'Make a phone call' },
					{ name: 'Start a Phone Call',  value: 'startPhoneCall', action: 'Start a phone call' },
					{ name: 'Wait for Call Result', value: 'waitForCallResult', action: 'Wait for a phone call to end' },
				],
				noDataExpression: true,
				default: 'makePhoneCall',
			},

			// Node properties which the user gets displayed and
			// can change on the node.
			{
				displayName: 'My String',
				name: 'myString',
				type: 'string',
				default: '',
				placeholder: 'Placeholder value',
				description: 'The description text',
			},
		],
	};

	// The function below is responsible for actually doing whatever this node
	// is supposed to do. In this case, we're just appending the `myString` property
	// with whatever the user has entered.
	// You can make async calls and use `await`.
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();

		let item: INodeExecutionData;
		let myString: string;

		// Iterates over all input items and add the key "myString" with the
		// value the parameter "myString" resolves to.
		// (This could be a different value for each item in case it contains an expression)
		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				myString = this.getNodeParameter('myString', itemIndex, '') as string;
				item = items[itemIndex];

				item.json.myString = myString;
			} catch (error) {
				// This node should never fail but we want to showcase how
				// to handle errors.
				if (this.continueOnFail()) {
					items.push({ json: this.getInputData(itemIndex)[0].json, error, pairedItem: itemIndex });
				} else {
					// Adding `itemIndex` allows other workflows to handle this error
					if (error.context) {
						// If the error thrown already contains the context property,
						// only append the itemIndex
						error.context.itemIndex = itemIndex;
						throw error;
					}
					throw new NodeOperationError(this.getNode(), error, {
						itemIndex,
					});
				}
			}
		}

		return [items];
	}
}
