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

### Start a Phone Call
Starts a phone call without waiting for it to complete. Returns a call ID that can be used with the "Wait for Call Result" operation.

### Wait for Call Result
Waits until a previously-started phone call has completed. Requires a call ID from a previous "Start a Phone Call" operation.

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

### Simple scenario - Making a phone call and waiting for result

1. Use the "Make a Phone Call" operation in the SenseFlow node.
2. Fill in the required fields (To Number, Language, First Message, On Behalf Of, Goal, Context).
3. Execute

### Multiple calls
For long-running calls or when you need to handle multiple calls simultaneously:

1. Use the "Start a Phone Call" operation to initiate a call
2. Store the returned call ID
3. Use the "Wait for Call Result" operation with the call ID to get the final result

### Example Workflow
A typical workflow might involve:
1. Triggering on a new booking or appointment
2. Using the SenseFlow node to make a confirmation call
3. Processing the call result (success/failure, conversation summary, etc.)
4. Updating your system based on the call outcome

For new users, check out the [Try it out](https://docs.n8n.io/try-it-out/) documentation to get started with n8n basics.

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
* [SenseFlow API Documentation](https://app.senseflow.io/integrations)
* [SenseFlow Platform](https://app.senseflow.io)
