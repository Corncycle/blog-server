const { OAuth2Client } = require('google-auth-library')

const client = new OAuth2Client()

exports.assessToken = async (token) => {
  const assessment = {}
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      requiredAudience: process.env.GOOGLE_CLIENT_ID,
    })
    const payload = ticket.getPayload()
    assessment.valid = true
    assessment.name = payload.given_name
    if (['corncycle@gmail.com'].includes(payload.email)) {
      assessment.admin = true
    }
  } catch (err) {
    assessment.valid = false
  }
  return assessment
}
