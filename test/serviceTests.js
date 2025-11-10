import { AwsV4Signer } from '../src/main'

export default async() => {
  fixtures().forEach(({ url, service, region }) => {
    const signer = new AwsV4Signer({ url, accessKeyId: 'a', secretAccessKey: 'a' })
    console.assert(signer.service === service, `Expected service ${service}, got ${signer.service} for url ${url}`)
    console.assert(signer.region === region, `Expected region ${region}, got ${signer.region} for url ${url}`)
  })
}

function fixtures() {
  const csv = `
aa-custom-endpoint.execute-api.us-east-1.amazonaws.com,execute-api,us-east-1
aa-custom-endpoint.iot.us-east-1.amazonaws.com/topics,iotdata,us-east-1
aa-custom-endpoint.iot.us-east-1.amazonaws.com/things,iotdata,us-east-1
aa-custom-endpoint.iot.us-east-1.amazonaws.com/mqtt,iotdevicegateway,us-east-1
aa-custom-endpoint.us-east-1.cloudsearch.amazonaws.com,cloudsearch,us-east-1
aa-custom-endpoint.us-east-1.es.amazonaws.com,es,us-east-1
aa-custom-endpoint.appsync.us-east-1.amazonaws.com,appsync,us-east-1
aa-custom-bucket.s3.amazonaws.com,s3,us-east-1
aa-custom-bucket.s3-accelerate.amazonaws.com,s3,us-east-1
aa-custom-bucket.s3-accelerate.dualstack.amazonaws.com,s3,us-east-1
ap-northeast-1.queue.amazonaws.com,sqs,ap-northeast-1
api.pricing.us-east-1.amazonaws.com,pricing,us-east-1
appstream2.us-west-2.amazonaws.com,appstream,us-west-2
autoscaling.amazonaws.com,autoscaling,us-east-1
ca-central-1.queue.amazonaws.com,sqs,ca-central-1
cloudfront.amazonaws.com,cloudfront,us-east-1
cloudhsmv2.us-west-2.amazonaws.com,cloudhsm,us-west-2
cn-north-1.queue.amazonaws.com,sqs,cn-north-1
codebuild-fips.us-west-2.amazonaws.com,codebuild,us-west-2
data.iot.us-east-1.amazonaws.com,iotdata,us-east-1
data.jobs.iot.us-east-1.amazonaws.com,iot-jobs-data,us-east-1
data.mediastore.us-west-2.amazonaws.com,mediastore,us-west-2
ec2.amazonaws.com,ec2,us-east-1
elasticloadbalancing.amazonaws.com,elasticloadbalancing,us-east-1
elasticmapreduce.amazonaws.com,elasticmapreduce,us-east-1
email.us-west-2.amazonaws.com,ses,us-west-2
entitlement.marketplace.us-east-1.amazonaws.com,aws-marketplace,us-east-1
eu-west-3.queue.amazonaws.com,sqs,eu-west-3
iam.amazonaws.com,iam,us-east-1
iam.us-gov.amazonaws.com,iam,us-gov-west-1
importexport.amazonaws.com,importexport,us-east-1
iot.us-west-2.amazonaws.com,execute-api,us-west-2
kms-fips.us-west-2.amazonaws.com,kms,us-west-2
ls.amazonaws.com,ls,us-east-1
metering.marketplace.us-east-1.amazonaws.com,aws-marketplace,us-east-1
mobile.us-east-1.amazonaws.com,AWSMobileHubService,us-east-1
models.lex.us-east-1.amazonaws.com,lex,us-east-1
mturk-requester-sandbox.us-east-1.amazonaws.com,mturk-requester,us-east-1
personalize-runtime.us-west-2.amazonaws.com,personalize,us-west-2
pinpoint.us-east-1.amazonaws.com,mobiletargeting,us-east-1
queue.amazonaws.com,sqs,us-east-1
route53.amazonaws.com,route53,us-east-1
route53domains.us-east-1.amazonaws.com,route53domains,us-east-1
runtime.lex.us-east-1.amazonaws.com,lex,us-east-1
runtime.sagemaker.us-west-2.amazonaws.com,sagemaker,us-west-2
s3-external-1.amazonaws.com,s3,us-east-1
s3-us-gov-west-1.amazonaws.com,s3,us-gov-west-1
s3-us-west-2.amazonaws.com,s3,us-west-2
s3-fips-us-gov-west-1.amazonaws.com,s3,us-gov-west-1
s3.amazonaws.com,s3,us-east-1
s3.cn-north-1.amazonaws.com.cn,s3,cn-north-1
s3.cn-northwest-1.amazonaws.com,s3,cn-northwest-1
s3.dualstack.us-west-2.amazonaws.com,s3,us-west-2
s3.us-west-2.amazonaws.com,s3,us-west-2
sa-east-1.queue.amazonaws.com,sqs,sa-east-1
sdb.amazonaws.com,sdb,us-east-1
streams.dynamodb.cn-north-1.amazonaws.com.cn,dynamodb,cn-north-1
streams.dynamodb.us-gov-west-1.amazonaws.com,dynamodb,us-gov-west-1
streams.dynamodb.us-west-2.amazonaws.com,dynamodb,us-west-2
sts.amazonaws.com,sts,us-east-1
us-west-2.queue.amazonaws.com,sqs,us-west-2
waf-regional.us-west-2.amazonaws.com,waf-regional,us-west-2
waf.amazonaws.com,waf,us-east-1
aa-custom-bucket.s3.us-west-001.backblazeb2.com,s3,us-west-001
s3.us-west-001.backblazeb2.com,s3,us-west-001
12345678.r2.cloudflarestorage.com,s3,auto
aa-custom-bucket.12345678.r2.cloudflarestorage.com,s3,auto
my-repo.us-sea-1.linodeobjects.com,s3,us-sea-1
us-sea-1.linodeobjects.com,s3,us-sea-1
my-space.nyc3.digitaloceanspaces.com,s3,nyc3
nyc3.digitaloceanspaces.com,s3,nyc3
ibvt72cx3dkyksnw7jktvkwhme0legmv.lambda-url.us-east-1.on.aws,lambda,us-east-1
  `
  return csv.trim().split('\n').map(line => {
    const [url, service, region] = line.split(',')
    return { url: `https://${url}`, service, region }
  })
}
