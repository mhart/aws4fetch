import serviceTests from './serviceTests'
import awsTests from './awsTests'
import paramTests from './paramTests'

Promise.all([
  serviceTests(),
  awsTests(self.AWS_FIXTURES),
  paramTests(),
])
