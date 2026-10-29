import serviceTests from './serviceTests'
import awsTests from './awsTests'
import paramTests from './paramTests'
import queryTests from './queryTests'

Promise.all([
  serviceTests(),
  awsTests(self.AWS_FIXTURES),
  paramTests(),
  queryTests(),
])
