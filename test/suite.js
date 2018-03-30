import serviceTests from './serviceTests'
import awsTests from './awsTests'

Promise.all([
  serviceTests(),
  awsTests(self.AWS_FIXTURES),
])
