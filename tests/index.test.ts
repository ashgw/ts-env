import { z } from 'zod';
import { createEnv } from 'src';
import { expect, describe, it, afterEach } from 'vitest';
import dotenv from 'dotenv';
dotenv.config();

describe('createEnv', () => {
  afterEach(() => {
    process.env = {};
  });

  it('should parse valid environment variables', () => {
    const env = createEnv({
      vars: {
        API_URL: z.string().url(),
        PORT: z.string().regex(/^\d+$/, 'PORT must be a number'),
      },
    });

    expect(env.API_URL).toBe(process.env.API_URL);
    expect(env.PORT).toBe(process.env.PORT);
  });

  it('should throw an error for invalid environment variables', () => {
    process.env.API_URL = process.env.INVALID_API_URL;
    process.env.PORT = process.env.INVALID_PORT;

    expect(() =>
      createEnv({
        vars: {
          API_URL: z.string().url(),
          PORT: z.string().regex(/^\d+$/, 'PORT must be a number'),
        },
      })
    ).toThrowError('Invalid environment variables');
  });

  it('should skip validation when skipValidation is true', () => {
    process.env.API_URL = process.env.INVALID_API_URL;
    process.env.PORT = process.env.INVALID_PORT;

    const env = createEnv({
      vars: {
        API_URL: z.string().url(),
        PORT: z.string().regex(/^\d+$/, 'PORT must be a number'),
      },
      skipValidation: true,
    });

    expect(env.API_URL).toBe(process.env.INVALID_API_URL);
    expect(env.PORT).toBe(process.env.INVALID_PORT);
  });
  it('should work with valid environment variables with prefix', () => {
    process.env.NEXT_PUBLIC_API_URL = 'invalid_url';
    process.env.NEXT_PUBLIC_PORT = 'not_a_number';

    expect(
      () =>
        createEnv({
          vars: {
            API_URL: z.string().url(),
            PORT: z.string().regex(/^\d+$/, 'PORT must be a number'),
          },
          prefix: 'NEXT_PUBLIC',
        }).NEXT_PUBLIC_API_URL
    );
  });

  it('should throw an error for invalid environment variables with prefix', () => {
    process.env.NEXT_PUBLIC_API_URL = 'invalid_url';
    process.env.NEXT_PUBLIC_PORT = 'not_a_number';

    expect(() =>
      createEnv({
        vars: {
          API_URL: z.string().url(),
          PORT: z.string().regex(/^\d+$/, 'PORT must be a number'),
        },
        prefix: 'NEXT_PUBLIC_DOES_NOT_EXIST',
      })
    ).toThrowError('Invalid environment variables');
  });

  it('should work when we disable the prefix for one var', () => {
    expect(() =>
      createEnv({
        vars: {
          API_URL: z.string().url(),
          NODE_ENV: z.string().min(1),
          PORT: z.string().regex(/^\d+$/, 'PORT must be a number'),
        },
        prefix: 'NEXT_PUBLIC',
      })
    );
  });

  it('should work when we disable the prefix for more than one var', () => {
    expect(() =>
      createEnv({
        vars: {
          API_URL: z.string().url(),
          API_KEY: z.string().min(1),
          NODE_ENV: z.string().min(1),
          PORT: z.string().regex(/^\d+$/, 'PORT must be a number'),
        },
        prefix: 'NEXT_PUBLIC',
        disablePrefix: ['NODE_ENV', 'API_KEY'],
      })
    );
  });

  it('should throw when we add a prefx without disabling and one of more vars do not actually have it', () => {
    expect(() =>
      createEnv({
        vars: {
          API_URL: z.string().url(),
          API_KEY: z.string().min(1),
          NODE_ENV: z.string().min(1),
          PORT: z.string().regex(/^\d+$/, 'PORT must be a number'),
        },
        prefix: 'NEXT_PUBLIC',
      })
    ).toThrowError('Invalid environment variables');
  });
});
