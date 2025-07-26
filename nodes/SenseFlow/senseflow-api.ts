/*
 * SenseFlow API helper functions
 *
 * These functions are meant to be used inside an n8n node and therefore rely on `this` being
 * an execution context (for example, `this` inside execute() with the `IExecuteFunctions` type).
 *
 * NOTES
 * -----
 * 1. The helpers leverage `this.helpers.httpRequest`, which is the preferred way in n8n to make
 *    HTTP requests without credentials. If credentials are required in the future you can switch
 *    to `httpRequestWithAuthentication`.
 * 2. Both helpers purposefully avoid business-logic details. They only showcase the basic request
 *    structure and expected return types so that the surrounding node implementation can evolve
 *    safely.
 */

import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';

export interface StartCallPayload extends IDataObject {
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
export async function startPhoneCall(this: IExecuteFunctions, payload: StartCallPayload): Promise<string> {
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
export async function waitForPhoneCallCompletion(
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
			throw new Error('Waiting for phone call result timed out');
		}

		await new Promise((resolve) => setTimeout(resolve, pollingInterval));
	}
}
