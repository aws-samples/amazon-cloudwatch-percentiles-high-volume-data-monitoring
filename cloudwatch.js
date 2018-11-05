const AWS = require('aws-sdk');
const cloudwatch = new AWS.CloudWatch();

generateCallCountingMetric = (type) => {
    return generateMetricDataDefinition({
      Dimensions: [
          { Name: 'Type', Value: type }
      ],
      Value: 1
    })
}

generateMetricDataDefinition = (additional_data) => {
  let metric_datum = {
    MetricName: 'PutMetricDataExample',
  }
  let metric_data = {
    MetricData: [
      {...metric_datum, ...additional_data},
    ],
    Namespace: 'PutMetricDataExample'
  };
  return metric_data;
}

putMetricData = (metric_call) => {
  cloudwatch.putMetricData(metric_call, (err, data) => {
      if (err)  console.log(err, err.stack);
      else      console.log(data);
  });
}

exports.putMetricDataValuesAndCounts = function(event, context) {
    let valuesAndCounts = event.Records.reduce(function(result, record) {
        let value = parseFloat(new Buffer(record.kinesis.data, 'base64').toString('ascii'));
        if (!result.has(value)) result.set(value, 1)
        else result.set(value, result.get(value) + 1)
        return result;

    }, new Map);

    const metric = generateMetricDataDefinition({
      Dimensions: [
          { Name: 'Type', Value: 'PutMetricDataValuesAndCounts' }
      ],
      Values: [...valuesAndCounts.keys()],
      Counts: [...valuesAndCounts.values()]
    })

    putMetricData(metric)
    putMetricData(generateCallCountingMetric('PutMetricDataValuesAndCountsCalls'))

    console.log(require('util').inspect(metric, false, null, false));
};

exports.putMetricDataSingleValue = (event, context) => {
    event.Records.forEach((record) => {
        const metric = generateMetricDataDefinition({
          Dimensions: [
              { Name: 'Type', Value: 'PutMetricDataSingleValue' }
          ],
          Value: parseFloat(new Buffer(record.kinesis.data, 'base64').toString('ascii'))
        })

        putMetricData(metric)
    });
};
