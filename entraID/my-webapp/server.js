require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const axios = require('axios').default;

const { PORT, TENANT_ID, CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } = process.env;

const AUTHORIZE_URL = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/authorize`;
const TOKEN_URL = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`;

const app = express();
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('<a href="/login">Sign in</a>');
});

app.get('/login', (req, res) => {
  const state = crypto.randomBytes(16).toString('hex');
  res.cookie('oauth_state', state, { httpOnly: true, maxAge: 5 * 60 * 1000 });

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: 'openid profile email',
    state,
  });

  res.redirect(`${AUTHORIZE_URL}?${params.toString()}`);
});

app.get('/auth/callback', async (req, res) => {
  const { code, state, error, error_description } = req.query;

  if (error) {
    return res.status(400).send(`Sign-in failed: ${error} — ${error_description}`);
  }

  if (!state || state !== req.cookies.oauth_state) {
    return res.status(400).send('Invalid state — possible CSRF, or the cookie expired. Try /login again.');
  }
  res.clearCookie('oauth_state');
  console.log("Received req from entraID redirect:\n %s", req)
  try {
    const body = new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
    });
    console.log( "Building request to entraID for bearer token:\n %s", body );
    const { data } = await axios.post(TOKEN_URL, body, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    console.log( "Received response from entraID:\n %s", data );
    res.cookie('id_token', data.id_token, { httpOnly: true });
    res.redirect('/me');
  } catch (err) {
    const detail = err.response?.data ?? err.message;
    res.status(500).send(`Token exchange failed: ${JSON.stringify(detail)}`);
  }
});

app.get('/me', (req, res) => {
  const idToken = req.cookies.id_token;
  if (!idToken) {
    return res.status(401).send('Not signed in. Go to /login.');
  }

  // Lab shortcut: decoding without verifying the signature — fine for reading
  // claims locally, not a substitute for real token validation.
  const payload = JSON.parse(Buffer.from(idToken.split('.')[1], 'base64url').toString());
  const header = JSON.parse(Buffer.from(idToken.split('.')[0], 'base64url').toString());
  res.json({
    signedInAs: payload.name ?? payload.preferred_username,
    claims: {
      iss: payload.iss,
      sub: payload.sub,
      email: payload.email ?? payload.preferred_username,
      name: payload.name,
    },
    payload: payload,
    header: header
    
  });
});

app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});
