import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
	NodeApiError,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

const SENSEFLOW_API_BASE = 'https://app.senseflow.io';

export class SenseFlowGetCallStatus implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'SenseFlow Get Call Status',
		name: 'senseFlowGetCallStatus',
		icon: {
			light: 'file:../SenseFlow/logo.png',
			dark: 'file:../SenseFlow/logo.png',
		},
		group: ['operation'],
		version: 1,
		description: 'Fetch the current status of a SenseFlow phone call',
		defaults: {
			name: 'SenseFlow Get Call Status',
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
				displayName: 'Call ID',
				name: 'callId',
				type: 'string',
				required: true,
				default: '',
				placeholder: '8f41d9f3-c1e4-4d0d-93ff-e70bc5b6b6a1',
				description: 'Identifier returned by the SenseFlow Make Call node',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const readyItems: INodeExecutionData[] = [];
		const notReadyItems: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const callId = this.getNodeParameter('callId', itemIndex) as string;

				const requestOptions = {
					method: 'GET' as const,
					url: `${SENSEFLOW_API_BASE}/api/phone-call/${callId}`,
					json: true,
				};

				const response = (await this.helpers.httpRequestWithAuthentication.call(this, 'senseFlowApi', requestOptions)) as IDataObject & {
					status?: string;
				};

				const isDone = response.status === 'completed' || response.status === 'failed';
				(isDone ? readyItems : notReadyItems).push({
					json: {
						...items[itemIndex].json,
						...response,
					},
				});
			} catch (error) {
				if (error?.constructor?.name === 'NodeApiError') {
					throw error;
				}

				if (this.continueOnFail()) {
					notReadyItems.push({
						json: { ...items[itemIndex].json },
						error: error as NodeApiError,
						pairedItem: itemIndex,
					});
				} else {
					throw new NodeOperationError(this.getNode(), error as Error, { itemIndex });
				}
			}
		}

		return [readyItems, notReadyItems];
	}
}
