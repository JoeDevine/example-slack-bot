const https = require('https');

const { SLACK_URL } = process.env;

// Options for response message to Slack
const slackOptions = {
  method: 'POST',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
};

exports.handler = async function (event) {
  console.log('request:', JSON.stringify(event, undefined, 2));
  const { Records } = event;

  try {
    const messageBody = JSON.parse(Records[0].body);

    const { username, requestTime } = messageBody;

    if (username) {
      const slackMessage = {
        text: `Vitally ticket created for user ${username} submitted at ${requestTime}`,
      };

      await fetch(SLACK_URL, {
        ...slackOptions,
        body: JSON.stringify(slackMessage),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('Success:', data);
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/plain' },
      body: `Successfully consumed message ${Records.messageId} from queue`,
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
