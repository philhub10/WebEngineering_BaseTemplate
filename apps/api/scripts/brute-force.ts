import { z } from 'zod';

// Guesses passwords for one account, one request after another, and prints
// every status: 401 until the limit, then 429 with Retry-After.
//   npm run brute:force
//   npm run brute:force -- lena@example.org

const ATTEMPTS = 15;
const FIRST_ATTEMPT = 1;
const NUMBER_WIDTH = 2;
const EMAIL_ARG = 2; // node script.ts <email>

const apiUrl = z
  .url()
  .default('http://localhost:3000')
  .parse(process.env.API_URL);
const email = process.argv.at(EMAIL_ARG) ?? 'lena@example.org';

console.log(`${ATTEMPTS} login attempts for ${email}`);
for (const index of Array(ATTEMPTS).keys()) {
  const attempt = index + FIRST_ATTEMPT;
  // eslint-disable-next-line no-await-in-loop -- sequential on purpose, like a brute-force tool
  const res = await fetch(`${apiUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password: `guess-number-${attempt}` }),
  });
  const retryAfter = res.headers.get('retry-after');
  const wait = retryAfter === null ? '' : `, Retry-After: ${retryAfter} s`;
  console.log(
    `  #${String(attempt).padStart(NUMBER_WIDTH)}: HTTP ${res.status}${wait}`
  );
}
