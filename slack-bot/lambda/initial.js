const { SQSClient, SendMessageCommand } = require('@aws-sdk/client-sqs');

const { SQS_QUEUE_URL, REGION } = process.env;

const sqsClient = new SQSClient({ region: REGION });

exports.handler = async function (event) {
  console.log('request:', JSON.stringify(event, undefined, 2));
  let username = '';
  const { body, requestContext } = event;

  // Challenge handler for verifying URL ownership with Slack
  // const reqBody = JSON.parse(body);
  // if (reqBody.challenge) {
  //   console.log('Reqbody challenge ->', reqBody.challenge);
  //   return {
  //     statusCode: 200,
  //     headers: { 'Content-Type': 'text/plain' },
  //     body: reqBody.challenge,
  //   };
  // }

  try {
    if (typeof body === 'string' && body.includes('user_name')) {
      const slackParams = new URLSearchParams(body);
      username = slackParams.get('user_name');
    }
    const { requestTime } = requestContext;
    console.log('Queue URL is:', SQS_QUEUE_URL);
    const data = await sqsClient.send(
      new SendMessageCommand({
        DelaySeconds: 10,
        MessageBody: JSON.stringify({ username, requestTime }),
        QueueUrl: SQS_QUEUE_URL,
      })
    );
    console.log('Success, message sent. MessageID:', data.MessageId);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/plain' },
      body: `Successfully hit the initial lambda and added to the queue with id ${data.MessageId}\n`,
    };
  } catch (err) {
    console.log('Error', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text/plain' },
      body: `Failed to add message to queue`,
    };
  }
};
