const { SQSClient, SendMessageCommand } = require('@aws-sdk/client-sqs');

const { SQS_QUEUE_URL, REGION } = process.env;

const sqsClient = new SQSClient({ region: REGION });

const params = {
  DelaySeconds: 10,
  MessageBody: 'Test data body',
  QueueUrl: SQS_QUEUE_URL,
};

exports.handler = async function (event) {
  console.log('request:', JSON.stringify(event, undefined, 2));

  try {
    console.log('Queue URL is:', SQS_QUEUE_URL);
    const data = await sqsClient.send(new SendMessageCommand(params));
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
