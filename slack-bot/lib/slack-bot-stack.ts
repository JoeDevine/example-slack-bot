import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class SlackBotStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const initial = new lambda.Function(this, 'InitialHandler', {
      runtime: lambda.Runtime.NODEJS_18_X, // execution environment
      code: lambda.Code.fromAsset('lambda'), // code loaded from "lambda" directory
      handler: 'initial.handler', // file is "hello", function is "handler"
    });

    new apigw.LambdaRestApi(this, 'Endpoint', {
      handler: initial,
    });

    // example resource
    // const queue = new sqs.Queue(this, 'SlackBotQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}
