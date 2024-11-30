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

  it('should treat empty strings as undefined when emptyStringAsUndefined is true', () => {
    process.env.API_URL = '';
    process.env.PORT = '3000';

    const env = createEnv({
      vars: {
        API_URL: z.string().optional(),
        PORT: z.string().regex(/^\d+$/, 'PORT must be a number'),
      },
      emptyStringAsUndefined: true,
    });

    expect(env.API_URL).toBeUndefined();
    expect(env.PORT).toBe('3000');
  });
});
