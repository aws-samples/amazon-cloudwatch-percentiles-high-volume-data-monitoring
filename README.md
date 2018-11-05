## Use CloudWatch client-side metric aggregations for high volume data ingestion and monitoring

Code samples related to ["Use Amazon CloudWatch to Monitor High Volume Systems"](https://aws.amazon.com/blogs/devops/) blog post published on the AWS DevOps blog. The post demonstrates how to build more efficient data ingestion using CloudWatch client-side metric aggegations to minimize the calls to CloudWatch PutMetricData. 

Metric aggregations are available by publishing arrays of values and counts through the CloudWatch [PutMetricData API](https://docs.aws.amazon.com/AmazonCloudWatch/latest/APIReference/API_PutMetricData.html). The [CloudWatch agent](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/install-CloudWatch-Agent-on-first-instance.html) automatically aggregates data client-side to maximize efficiency. 

## License Summary

This sample code is made available under a modified MIT license. See the LICENSE file.

## Setup Instructions

This project includes code that is intended to run as an AWS Lambda function. 

## Prerequisites

1. Download the repository.
2. Run 'npm install' to create dependencies.
3. ZIP the entire project `zip -r putmetricdatademo.zip ./*`

### Create IAM execution role
1. Sign in to the AWS Management Console and open the IAM console at https://console.aws.amazon.com/iam/.
2. Click on Role and then on Create role.
3. In Role Name, use a name that is unique within your AWS account (for example, lambda-kinesis-cloudwatch-role).
4. In Select Role Type, choose AWS Service Roles, and then choose AWS Lambda. This grants the AWS Lambda service permissions to assume the role.
5. In Attach Policy, choose AWSLambdaKinesisExecutionRole and CloudWatchFullAccess.
6. Take note of the Role arn

### Create the Lambda functions

1. Create a Lambda function that will perform PutMetricData with a single value.
```
aws lambda create-function \
--region region \
--function-name PutMetricDataSingleValue  \
--zip-file fileb://putmetricdatademo.zip \
--role execution-role-arn  \
--handler cloudwatch.putMetricDataSingleValue \
--timeout 60 \
--memory-size 1024 \
--runtime nodejs8.10
```

2. Create a Lambda function that will perform PutMetricData with values and counts.
```
aws lambda create-function \
--region region \
--function-name PutMetricDataValuesAndCounts  \
--zip-file fileb://putmetricdatademo.zip \
--role execution-role-arn  \
--handler cloudwatch.putMetricDataValuesAndCounts \
--timeout 60 \
--memory-size 1024 \
--runtime nodejs8.10
```

### Create Kinesis stream
1. Create a Kinesis stream where you will publish data into.
```
aws kinesis create-stream \
--stream-name putmetricdatastream \
--shard-count 1 \
--region region
```
2. Describe the Kinesis stream you just created.
```
aws kinesis describe-stream \
--stream-name putmetricdatastream \
--region region
```
3. Using the output from the previous command, set the previous created Lambda to consume from the stream.
```
aws lambda create-event-source-mapping \
--region region \
--function-name PutMetricDataSingleValue \
--event-source  kinesis-stream-arn \
--batch-size 150 \
--starting-position TRIM_HORIZON
```

```
aws lambda create-event-source-mapping \
--region region \
--function-name PutMetricDataValuesAndCounts \
--event-source  kinesis-stream-arn \
--batch-size 150 \
--starting-position TRIM_HORIZON
```

### Setup a Cognito user to send data to kinesis
1. Following the [Amazon Kinesis Data Generator](https://awslabs.github.io/amazon-kinesis-data-generator/web/help.html) instructions, click on `Create a Cognito User With CloudFormation`.

2. Go to [Amazon Kinesis Data Generator](https://awslabs.github.io/amazon-kinesis-data-generator) click on Configure and enter the required data created before. Use then your username and password and click `Sign in`.

3. Select the region and the Kinesis Stream created before. In the record template write.

```
{{random.number(1000)}}
```
and click `Send data`.

4. The lambda created will start to receive the data and publish metrics.

### Troubleshooting

1. View the Lambda log file in CloudWatch.

See the CloudWatch API documentation for [PutMetricData](https://docs.aws.amazon.com/AmazonCloudWatch/latest/APIReference/API_PutMetricData.html) for more information.
