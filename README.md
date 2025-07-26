# n8n-nodes-senseflow

This is an n8n community node. It lets you use SenseFlow phone call apis in your n8n workflows.

SenseFlow is an AI-powered voice agent that allows you to make phone calls and make decisions based on call results within your n8n workflows.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Operations](#operations)  
[Credentials](#credentials)  
[Compatibility](#compatibility)  
[Usage](#usage)  
[Resources](#resources)  

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

### Make a Phone Call
Starts a phone call and waits until it has completed. This operation combines starting a call and waiting for its result in a single step.

### Get Call Status
Fetches the current status for a previously-started phone call. The node has **two outputs**:

- **Ready** – The call has completed (success or failure).
- **Not Ready** – The call is still in progress.

Connect the **Not Ready** output back to the **Get Call Status** input (ideally through a *Wait* node) to poll until the execution is routed through **Ready**.

## Credentials

To use this node, you need to authenticate with SenseFlow using an API key.

### Prerequisites
1. Sign up for a SenseFlow account at [https://app.senseflow.io](https://app.senseflow.io)
2. Obtain your API key from the SenseFlow dashboard

### Setup
1. In n8n, go to Settings → Credentials
2. Click "Add Credential" and search for "SenseFlow API"
3. Enter your API key in the "API Key" field
4. Test the connection to ensure it's working properly

## Compatibility

- **Minimum n8n version**: 1.0.0
- **Tested with**: 1.103.2
- **Node.js version**: >=20.15

## Usage

### Basic Phone Call Setup
When making a phone call, you'll need to provide:

- **To Number**: The destination phone number in E.164 format (e.g., +15551234567)
- **Language**: The language the voice agent should use (English or Czech)
- **First Message**: The opening sentence the agent should start with
- **On Behalf Of**: The name of the person/company on whose behalf the call is made
- **Goal**: The desired outcome that the agent should try to achieve
- **Context**: Additional relevant information to help the agent conduct the call

**Note**: Our system includes safety measures to prevent spam, telemarketing, and fraud. If you believe your legitimate call was incorrectly flagged, please contact us for assistance.

### Simple scenario – Make → Get Status loop

1. Use the **Make a Phone Call** operation in the SenseFlow node. This will start the call and return the first result once the call has finished. Store the returned `id` if you need to check it later.
2. (Optional) For long-running calls you can periodically run the **Get Call Status** operation with the stored `id`.
3. Repeat step 2 until the execution leaves the **Not Ready** branch and arrives on **Ready**.

For new users, check out the [Try it out](https://docs.n8n.io/try-it-out/) documentation to get started with n8n basics.

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
* [SenseFlow API Documentation](https://app.senseflow.io/integrations)
* [SenseFlow Platform](https://app.senseflow.io)
