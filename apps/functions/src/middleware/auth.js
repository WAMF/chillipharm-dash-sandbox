import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp();
}

const DOCS_SESSION_COOKIE = '__session';
const SESSION_DURATION_MS = 60 * 60 * 1000;

export async function verifyAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const queryToken = req.query.token;

  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split('Bearer ')[1];
  } else if (queryToken) {
    token = queryToken;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Missing or invalid Authorization header'
    });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified
    };
    next();
  } catch (error) {
    console.error('Auth verification failed:', error.message);
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Invalid or expired token'
    });
  }
}

export async function verifyDocsAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const queryToken = req.query.token;
  const cookieToken = req.cookies?.[DOCS_SESSION_COOKIE];

  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split('Bearer ')[1];
  } else if (queryToken) {
    token = queryToken;
  } else if (cookieToken) {
    token = cookieToken;
  }

  if (!token) {
    return res.status(401).send(`
      <html>
        <body style="font-family: sans-serif; padding: 2rem; text-align: center;">
          <h1>Authentication Required</h1>
          <p>Please access the API docs from the dashboard.</p>
        </body>
      </html>
    `);
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified
    };

    if (queryToken && !cookieToken) {
      res.cookie(DOCS_SESSION_COOKIE, token, {
        maxAge: SESSION_DURATION_MS,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
    }

    next();
  } catch (error) {
    console.error('Docs auth verification failed:', error.message);
    res.clearCookie(DOCS_SESSION_COOKIE);
    return res.status(401).send(`
      <html>
        <body style="font-family: sans-serif; padding: 2rem; text-align: center;">
          <h1>Session Expired</h1>
          <p>Please access the API docs from the dashboard again.</p>
        </body>
      </html>
    `);
  }
}

export function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }
  
  const token = authHeader.split('Bearer ')[1];
  
  admin.auth().verifyIdToken(token)
    .then(decodedToken => {
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified
      };
      next();
    })
    .catch(() => {
      req.user = null;
      next();
    });
}
