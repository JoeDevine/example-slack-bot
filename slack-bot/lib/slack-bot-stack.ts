import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources';

import { config } from 'dotenv';

config();

export class SlackBotStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const lambdaRole = new iam.Role(this, 'SlackBotLambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSQSFullAccess'),
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          'service-role/AWSLambdaBasicExecutionRole'
        ),
      ],
    });

    const initial = new lambda.Function(this, 'InitialHandler', {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'initial.handler',
      role: lambdaRole,
      environment: {
        REGION: process.env.REGION || 'eu-west-2',
        SQS_QUEUE_URL: process.env.SQS_QUEUE_URL!,
      },
    });

    const vitally = new lambda.Function(this, 'VitallyHandler', {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'vitally.handler',
      role: lambdaRole,
      environment: {
        SLACK_URL: process.env.SLACK_URL!,
      },
    });

    new apigw.LambdaRestApi(this, 'Endpoint', {
      handler: initial,
    });

    const queue = new sqs.Queue(this, 'SlackBotQueue', {
      visibilityTimeout: cdk.Duration.seconds(300),
    });

    const eventSource = new lambdaEventSources.SqsEventSource(queue);

    vitally.addEventSource(eventSource);

    queue.grantSendMessages(initial);
    queue.grantConsumeMessages(initial);
  }
}
