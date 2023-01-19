exports.handler = async function (event) {
  console.log('request:', JSON.stringify(event, undefined, 2));
  const { Records } = event;
  try {
    console.log('Triggered delayed Secondary Lambda from queue');

    const messageBody = JSON.parse(Records[0].body);
    console.log('messageBody -> ', messageBody);
    if (messageBody.username) {
      console.log('Username ->', username);
    }
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
