import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'
import { createApp } from '../../app'
import { credentialsLimiterStore } from './auth.routes'

/**
 * Owner: Team 03 — Auth & Identity.
 *
 * The shape every module's test file should follow: for each endpoint, cover the
 * happy path, the auth requirement, and at least one way it can be abused.
 */

const app = createApp()

// The rate limiter counts per process, not per test, so without this the later
// cases in this file get 429s from attempts the earlier ones made.
beforeEach(async () => {
  await credentialsLimiterStore.resetAll?.()
})

const validUser = {
  name: 'Asha Rao',
  email: 'asha@college.edu',
  password: 'correct horse battery',
}

async function registerAndLogin() {
  await request(app).post('/api/auth/register').send(validUser).expect(201)
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: validUser.email, password: validUser.password })
    .expect(200)
  return res
}

describe('POST /api/auth/register', () => {
  it('creates a STUDENT and returns an access token', async () => {
    const res = await request(app).post('/api/auth/register').send(validUser).expect(201)

    expect(res.body.user).toMatchObject({ email: validUser.email, role: 'STUDENT' })
    expect(res.body.accessToken).toBeTypeOf('string')
    expect(res.body.user).not.toHaveProperty('passwordHash')
  })

  it('rejects a duplicate email', async () => {
    await request(app).post('/api/auth/register').send(validUser).expect(201)
    const res = await request(app).post('/api/auth/register').send(validUser).expect(409)
    expect(res.body.error.code).toBe('CONFLICT')
  })

  it('rejects a short password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, password: 'short' })
      .expect(422)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })
})

describe('POST /api/auth/login', () => {
  it('sets an httpOnly refresh cookie', async () => {
    const res = await registerAndLogin()
    const cookies = res.headers['set-cookie'] as unknown as string[]
    expect(cookies.some((c) => c.startsWith('refresh_token=') && c.includes('HttpOnly'))).toBe(true)
  })

  it('gives the same error for a wrong password and an unknown email', async () => {
    await request(app).post('/api/auth/register').send(validUser).expect(201)

    const wrongPassword = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: 'not the password' })
      .expect(401)

    const unknownEmail = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@college.edu', password: 'not the password' })
      .expect(401)

    // Different messages here would let an attacker enumerate real accounts.
    expect(wrongPassword.body.error.message).toBe(unknownEmail.body.error.message)
  })
})

describe('GET /api/auth/me', () => {
  it('returns the caller when given a valid token', async () => {
    const login = await registerAndLogin()
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${login.body.accessToken}`)
      .expect(200)

    expect(res.body.user.email).toBe(validUser.email)
  })

  it('401s without a token', async () => {
    await request(app).get('/api/auth/me').expect(401)
  })

  it('401s with a tampered token', async () => {
    const login = await registerAndLogin()
    await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${login.body.accessToken.slice(0, -2)}xx`)
      .expect(401)
  })
})

describe('brute-force protection', () => {
  it('429s after 10 failed login attempts', async () => {
    for (let attempt = 0; attempt < 10; attempt++) {
      await request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@college.edu', password: 'guessing' })
        .expect(401)
    }

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@college.edu', password: 'guessing' })
      .expect(429)

    expect(res.body.error.code).toBe('RATE_LIMITED')
  })
})

describe('POST /api/auth/refresh', () => {
  it('rotates the refresh token and refuses the old one', async () => {
    const login = await registerAndLogin()
    const firstCookie = (login.headers['set-cookie'] as unknown as string[])[0]!

    await request(app).post('/api/auth/refresh').set('Cookie', firstCookie).expect(200)

    // Replaying a rotated token is how we detect theft — it must fail.
    await request(app).post('/api/auth/refresh').set('Cookie', firstCookie).expect(401)
  })
})
