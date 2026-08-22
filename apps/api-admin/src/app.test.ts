import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { hashPassword } from '@repo/auth/password'
import { signAccessToken } from '@repo/auth/jwt'
import { User } from '@repo/models/user'
import type { Role } from '@repo/validation/enums'
import { createApp } from './app'

/**
 * LOCKED FILE — Team 01 + Team 03.
 *
 * This file exists to prove the one guarantee that justifies running `api-admin`
 * as a separate service: **a student token cannot reach admin functionality.**
 *
 * If you are adding a module and one of these tests fails, the bug is in your
 * module, not in this file.
 */

const app = createApp()

async function createUser(role: Role, email: string) {
  const user = await User.create({
    name: `${role} user`,
    email,
    passwordHash: await hashPassword('correct horse battery'),
    role,
  })
  const token = signAccessToken({ sub: user._id.toString(), role, batchId: null })
  return { user, token }
}

describe('admin role gate', () => {
  it('401s a request with no token', async () => {
    await request(app).get('/api/whoami').expect(401)
  })

  it('403s a STUDENT token', async () => {
    const { token } = await createUser('STUDENT', 'student@college.edu')
    const res = await request(app)
      .get('/api/whoami')
      .set('Authorization', `Bearer ${token}`)
      .expect(403)

    expect(res.body.error.code).toBe('FORBIDDEN')
  })

  it('allows FACULTY and ADMIN', async () => {
    const faculty = await createUser('FACULTY', 'faculty@college.edu')
    const admin = await createUser('ADMIN', 'admin@college.edu')

    await request(app)
      .get('/api/whoami')
      .set('Authorization', `Bearer ${faculty.token}`)
      .expect(200)

    const res = await request(app)
      .get('/api/whoami')
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(200)

    expect(res.body.role).toBe('ADMIN')
  })
})

describe('POST /api/auth/login', () => {
  it('refuses a STUDENT even with correct credentials', async () => {
    await createUser('STUDENT', 'student@college.edu')

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'student@college.edu', password: 'correct horse battery' })
      .expect(401)

    // Must be indistinguishable from a wrong password, or this endpoint tells a
    // student that their credentials were right and only their role was wrong.
    expect(res.body.error.message).toBe('Email or password is incorrect')
  })

  it('signs in an ADMIN', async () => {
    await createUser('ADMIN', 'admin@college.edu')

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@college.edu', password: 'correct horse battery' })
      .expect(200)

    expect(res.body.user.role).toBe('ADMIN')
    expect(res.body.accessToken).toBeTypeOf('string')
  })

  it('has no registration endpoint', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Sneaky', email: 'sneaky@college.edu', password: 'correct horse battery' })
      .expect(404)
  })
})
