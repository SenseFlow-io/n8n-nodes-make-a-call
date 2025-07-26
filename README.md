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

## Nodes

### SenseFlow Start Call
Starts a phone call and returns its call id.

### SenseFlow Get Call Status
Checks the current status of a previously-started call. Has two outputs:
- **Ready** – Call finished (success or failure)
- **Not Ready** – Call still in progress

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

### Typical loop
1. Use **SenseFlow Make Call** to initiate the call. Save the returned `id` if you need to check again later.
2. (Optional) Use **SenseFlow Get Call Status** with the `id` to poll for completion. Connect the **Not Ready** output back to the Get-Status node via a Wait node until it eventually routes via **Ready**.

For new users, check out the [Try it out](https://docs.n8n.io/try-it-out/) documentation to get started with n8n basics.

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
* [SenseFlow API Documentation](https://app.senseflow.io/integrations)
* [SenseFlow Platform](https://app.senseflow.io)
