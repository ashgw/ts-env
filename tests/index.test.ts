import { z } from 'zod';
import { createEnv, preset } from 'src';
import { expect, describe, it, afterEach } from 'vitest';

describe('createEnv', () => {
  afterEach(() => {
    process.env = {};
  });

  it('should throw an error for invalid environment variables', () => {
    process.env.API_URL = 'not_a_valid_url';
    process.env.PORT = 'not_a_number';

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
    process.env.API_URL = 'invalid_url';
    process.env.PORT = 'not_a_number';

    const env = createEnv({
      vars: {
        API_URL: z.string().url(),
        PORT: z.string().regex(/^\d+$/, 'PORT must be a number'),
      },
      skipValidation: true,
    });

    expect(env.API_URL).toBe(process.env.API_URL);
    expect(env.PORT).toBe(process.env.PORT);
  });

  it('should parse environment variables with prefix', () => {
    process.env.NEXT_PUBLIC_API_URL = 'https://example.com';
    process.env.NEXT_PUBLIC_PORT = '3000';

    const env = createEnv({
      vars: {
        API_URL: z.string().url(),
        PORT: z.string().regex(/^\d+$/, 'PORT must be a number'),
      },
      prefix: 'NEXT_PUBLIC',
    });

    expect(env['NEXT_PUBLIC_API_URL']).toBe(process.env.NEXT_PUBLIC_API_URL);
    expect(env['NEXT_PUBLIC_PORT']).toBe(process.env.NEXT_PUBLIC_PORT);
  });

  it('should parse environment variables with prefix while other vars do not have it', () => {
    process.env.NEXT_PUBLIC_API_URL = 'https://example.com';
    process.env.NEXT_PUBLIC_PORT = '3000';
    process.env.API_KEY = 'z5PjchYTZ9hz';

    const env = createEnv({
      vars: {
        API_URL: z.string().url(),
        PORT: z.string().regex(/^\d+$/, 'PORT must be a number'),
        API_KEY: z.string().min(1),
      },
      prefix: 'NEXT_PUBLIC',
      disablePrefix: ['API_KEY'],
    });
    expect(env['API_KEY']).toBe(process.env.API_KEY);
    expect(env['NEXT_PUBLIC_API_URL']).toBe(process.env.NEXT_PUBLIC_API_URL);
    expect(env['NEXT_PUBLIC_PORT']).toBe(process.env.NEXT_PUBLIC_PORT);
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
        prefix: 'NEXT_PUBLIC',
      })
    ).toThrowError('Invalid environment variables');
  });

  it('should work when disabling the prefix for one variable', () => {
    process.env.API_URL = 'https://example.com';
    process.env.NEXT_PUBLIC_PORT = '3000';

    const env = createEnv({
      vars: {
        API_URL: z.string().url(),
        PORT: z.string().regex(/^\d+$/, 'PORT must be a number'),
      },
      prefix: 'NEXT_PUBLIC',
      disablePrefix: ['API_URL'],
    });

    expect(env['API_URL']).toBe(process.env.API_URL);
    expect(env['NEXT_PUBLIC_PORT']).toBe(process.env.NEXT_PUBLIC_PORT);
  });

  it('should work when disabling the prefix for multiple variables', () => {
    process.env.API_URL = 'https://example.com';
    process.env.API_KEY = 'secret_key';
    process.env.NEXT_PUBLIC_PORT = '3000';

    const env = createEnv({
      vars: {
        API_URL: z.string().url(),
        API_KEY: z.string().min(1),
        PORT: z.string().regex(/^\d+$/, 'PORT must be a number'),
      },
      prefix: 'NEXT_PUBLIC',
      disablePrefix: ['API_URL', 'API_KEY'],
    });

    expect(env['API_URL']).toBe(process.env.API_URL);
    expect(env['API_KEY']).toBe(process.env.API_KEY);
    expect(env['NEXT_PUBLIC_PORT']).toBe(process.env.NEXT_PUBLIC_PORT);
  });

  it('should throw an error when required prefixed variables are missing', () => {
    process.env.API_URL = 'https://example.com';
    process.env.API_KEY = 'secret_key';
    process.env.PORT = '3000';

    expect(() =>
      createEnv({
        vars: {
          API_URL: z.string().url(),
          API_KEY: z.string().min(1),
          PORT: z.string().regex(/^\d+$/, 'PORT must be a number'),
        },
        prefix: 'NEXT_PUBLIC',
      })
    ).toThrowError('Invalid environment variables');
  });

  it('should handle environment variables with special characters', () => {
    process.env['NEXT_PUBLIC_SPECIAL_VAR'] = '!@#$%^&*()';
    process.env['SPECIAL_VAR'] = '!@#$%^&*()';

    const env = createEnv({
      vars: {
        SPECIAL_VAR: z.string().min(1),
      },
      prefix: 'NEXT_PUBLIC',
    });

    expect(env['NEXT_PUBLIC_SPECIAL_VAR']).toBe('!@#$%^&*()');
  });

  it('should throw an error if disablePrefix includes variables not in vars', () => {
    expect(() =>
      createEnv({
        vars: {
          API_URL: z.string().url(),
          PORT: z.string().regex(/^\d+$/, 'PORT must be a number'),
        },
        prefix: 'NEXT_PUBLIC',
        // @ts-expect-error var does not even exist
        disablePrefix: ['NON_EXISTENT_VAR'],
      })
    ).toThrowError();
  });

  it('should work with empty disablePrefix array', () => {
    process.env.NEXT_PUBLIC_API_URL = 'https://example.com';
    process.env.NEXT_PUBLIC_PORT = '3000';

    const env = createEnv({
      vars: {
        API_URL: z.string().url(),
        PORT: z.string().regex(/^\d+$/, 'PORT must be a number'),
      },
      prefix: 'NEXT_PUBLIC',
      disablePrefix: [],
    });

    expect(env['NEXT_PUBLIC_API_URL']).toBe(process.env.NEXT_PUBLIC_API_URL);
    expect(env['NEXT_PUBLIC_PORT']).toBe(process.env.NEXT_PUBLIC_PORT);
  });

  it('should work with preset', () => {
    process.env.VERCEL_AUTOMATION_BYPASS_SECRET = 'X8Z69';
    process.env.VERCEL = 'test';
    process.env.CI = 'true';
    process.env.PORT = '5454';
    process.env.VERCEL_ENV = 'development';
    process.env.VERCEL_URL = 'https://example.vercel.app';
    process.env.VERCEL_PROJECT_PRODUCTION_URL =
      'https://production.example.vercel.app';
    process.env.VERCEL_BRANCH_URL = 'https://example.vercel.app/branch';
    process.env.VERCEL_REGION = 'us';
    process.env.VERCEL_DEPLOYMENT_ID = 'deployment-id-123';
    process.env.VERCEL_SKEW_PROTECTION_ENABLED = 'false';
    process.env.VERCEL_AUTOMATION_BYPASS_SECRET = 'X8Z69';
    process.env.VERCEL_GIT_PROVIDER = 'github';
    process.env.VERCEL_GIT_REPO_SLUG = 'user/repo';
    process.env.VERCEL_GIT_REPO_OWNER = 'user';
    process.env.VERCEL_GIT_REPO_ID = 'repo-id';
    process.env.VERCEL_GIT_COMMIT_REF = 'main';
    process.env.VERCEL_GIT_COMMIT_SHA = 'commit-sha';
    process.env.VERCEL_GIT_COMMIT_MESSAGE = 'commit message';
    process.env.VERCEL_GIT_COMMIT_AUTHOR_LOGIN = 'author';
    process.env.VERCEL_GIT_COMMIT_AUTHOR_NAME = 'Author Name';
    process.env.VERCEL_GIT_PREVIOUS_SHA = 'previous-sha';
    process.env.VERCEL_GIT_PULL_REQUEST_ID = 'pr-id';
    const env = createEnv({
      vars: {
        PORT: z.string().regex(/^\d+$/, 'PORT must be a number'),
        ...preset('vercel'),
      },
      disablePrefix: [],
    });
    expect(env.VERCEL_AUTOMATION_BYPASS_SECRET).toBe(
      process.env.VERCEL_AUTOMATION_BYPASS_SECRET
    );
    expect(env.VERCEL_GIT_PREVIOUS_SHA).toBe(
      process.env.VERCEL_GIT_PREVIOUS_SHA
    );
  });
});
