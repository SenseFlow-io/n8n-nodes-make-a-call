import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeApiError,
	IDataObject,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';
import { setTimeout as delay } from 'node:timers/promises';

interface StartCallPayload extends IDataObject {
    to_number: string;
    language: string;
    first_message?: string;
    on_behalf_of?: string;
    goal?: string;
    context?: string;
}

const SENSEFLOW_API_BASE = 'https://app.senseflow.io';

/**
 * Starts a phone call by POST-ing the full call specification to the SenseFlow REST API.
 *
 * @param this        n8n execution context (make sure to `.call(this, ...)` when invoking)
 * @param payload     The full call payload as required by SenseFlow
 *
 * @returns The unique identifier (`id`) of the created phone-call job
 */
async function startPhoneCall(this: IExecuteFunctions, payload: StartCallPayload): Promise<string> {
	const requestOptions = {
		method: 'POST' as const,
		url: `${SENSEFLOW_API_BASE}/api/phone-call/`,
		body: payload as IDataObject,
		json: true,
	};

	const response = (await this.helpers.httpRequestWithAuthentication.call(this, "senseFlowApi", requestOptions)) as {
		id: string;
	};

	return response.id;
}

/**
 * Polls SenseFlow for the status of a phone call until it is completed (or a timeout is reached).
 *
 * @param this            n8n execution context (make sure to `.call(this, ...)` when invoking)
 * @param callId          The identifier returned by {@link startPhoneCall}
 * @param pollingInterval How often to poll (in milliseconds). Defaults to 5 seconds.
 * @param timeout         Maximum time to wait (in milliseconds). Defaults to 5 minutes.
 *
 * @returns The final payload returned by the SenseFlow API for the completed call
 */
async function waitForPhoneCallCompletion(
	this: IExecuteFunctions,
	callId: string,
	pollingInterval = 5000,
	timeout = 5 * 60 * 1000,
): Promise<IDataObject> {
	const startedAt = Date.now();

	while (true) {
		const requestOptions = {
			method: 'GET' as const,
			url: `${SENSEFLOW_API_BASE}/api/phone-call/${callId}`,
			json: true,
		};

		const response = (await this.helpers.httpRequestWithAuthentication.call(this, "senseFlowApi", requestOptions)) as IDataObject;

		// Break once the call is finished. Adjust the condition based on the real API contract.
		if (response.status === 'completed' || response.status === 'failed') {
			return response;
		}

		/* istanbul ignore if -- guard against infinite loops */
		if (Date.now() - startedAt > timeout) {
			throw new NodeOperationError(this.getNode(), 'Waiting for phone call result timed out');
		}

		await delay(pollingInterval);
	}
}

export class SenseFlow implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'SenseFlow',
		name: 'senseFlow',
		icon: {
			light: 'file:logo.png',
			dark: 'file:logo.png',
		},
		group: ['operation'],
		version: 1,
		description: 'SenseFlow Node - Voice agent telephony at your fingertips',
		defaults: {
			name: 'SenseFlow',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main, NodeConnectionType.Main],
		outputNames: ['Ready', 'Not Ready'],
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
					{ name: 'Get Call Status',    value: 'getCallStatus', description: 'Fetch the status of a previously started phone call', action: 'Get phone call status' },
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
						operation: ['makePhoneCall'],
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
						operation: ['makePhoneCall'],
					},
				},
			},

			{
				displayName: 'First Message',
				name: 'firstMessage',
				type: 'string',
				default: 'Hi John, this is the AI assistant calling on behalf of Berlin City Suites.',
				placeholder: 'Opening sentence spoken by the agent',
				description: 'Opening sentence the agent should start with',
				displayOptions: {
					show: {
						operation: ['makePhoneCall'],
					},
				},
			},

			{
				displayName: 'On Behalf Of',
				name: 'onBehalfOf',
				type: 'string',
				default: 'Berlin City Suites',
				placeholder: 'Berlin City Suites',
				description: 'Name of the person/company on whose behalf the call is made',
				displayOptions: {
					show: {
						operation: ['makePhoneCall'],
					},
				},
			},

			{
				displayName: 'Goal',
				name: 'goal',
				type: 'string',
				default: 'Confirm John’s check-in time and note any special requests for booking PA-8721.',
				placeholder: 'Desired outcome of the call',
				description: 'The end goal that the agent should try to achieve',
				displayOptions: {
					show: {
						operation: ['makePhoneCall'],
					},
				},
			},

			{
				displayName: 'Context',
				name: 'context',
				type: 'string',
				default: 'Guest name: John Miller\nBooking ID: PA-8721\nProperty: Brandenburg Gate View Suite\nArrival: 12 Aug 2025 (3 nights)\nGuest requested: late checkout.',
				placeholder: 'Additional relevant information for the agent',
				description: 'Contextual information to help the agent conduct the call',
				typeOptions: {
					rows: 4,
				},
				displayOptions: {
					show: {
						operation: ['makePhoneCall'],
					},
				},
			},

			// Call ID (required when checking call status)
			{
				displayName: 'Call ID',
				name: 'callId',
				type: 'string',
				required: true,
				default: '',
				placeholder: '8f41d9f3-c1e4-4d0d-93ff-e70bc5b6b6a1',
				description: 'Identifier returned by the "Make a Phone Call" operation',
				displayOptions: {
					show: {
						operation: ['getCallStatus'],
					},
				},
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const readyItems: INodeExecutionData[] = [];
		const notReadyItems: INodeExecutionData[] = [];

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

					readyItems.push({
						json: {
							...item.json,
							...result,
						},
					});
				} else if (operation === 'getCallStatus') {
					const callId = this.getNodeParameter('callId', itemIndex) as string;

					const requestOptions = {
						method: 'GET' as const,
						url: `${SENSEFLOW_API_BASE}/api/phone-call/${callId}`,
						json: true,
					};

					const response = (await this.helpers.httpRequestWithAuthentication.call(this, "senseFlowApi", requestOptions)) as IDataObject & { status?: string };

					const isDone = response.status === 'completed' || response.status === 'failed';
					(isDone ? readyItems : notReadyItems).push({
						json: {
							...item.json,
							...response,
						},
					});
					continue;
				} else {
					throw new NodeOperationError(this.getNode(), `Unsupported operation: ${operation}`, { itemIndex });
				}
			} catch (error) {
				// Preserve useful API errors
				if (error?.constructor?.name === 'NodeApiError') {
					/*
					 * Re-throw as-is.  n8n will automatically render
					 *  • HTTP status code
					 *  • Response body
					 *  • Request URL + method
					 */
					throw error;
				}

				// Keep "Continue On Fail" behaviour untouched
				if (this.continueOnFail()) {
					notReadyItems.push({
						json: { ...items[itemIndex].json },
						error: error as NodeApiError,
						pairedItem: itemIndex,
					});
					continue;
				}

				// Fallback for any *other* unexpected error
				throw new NodeOperationError(this.getNode(), error as Error, { itemIndex });
			}
		}

		return [readyItems, notReadyItems];
	}
}
