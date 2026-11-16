const required = ['PORT'];
const missing = required.filter(key => !process.env[key] && key !== 'PORT');
if (missing.length) {
  console.error(`Missing environment variables: ${missing.join(', ')}`);
  process.exit(1);
}
const warnings = [];
if (!process.env.FIREBASE_PROJECT_ID) warnings.push('Firebase Admin is not configured; authenticated API routes remain disabled.');
if (!process.env.APP_BASE_URL) warnings.push('APP_BASE_URL is unset; configure the canonical public origin before production.');
for (const warning of warnings) console.warn(`WARN: ${warning}`);
console.log('Environment check complete. No secret values were printed.');
