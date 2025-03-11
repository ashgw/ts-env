import { z } from 'zod';

type Preset = 'vercel' | 'netlify' | 'fly' | 'railway' | 'render';

/**
 * Returns the environment variable schema for the specified preset.
 *
 * @param preset - The name of the preset to retrieve. Available presets are:
 *   - 'vercel': For Vercel deployment environment variables.
 *   - 'netlify': For Netlify deployment environment variables.
 *   - 'fly': For Fly.io deployment environment variables.
 *   - 'railway': For Railway deployment environment variables.
 *   - 'render': For Render deployment environment variables.
 *
 * @returns An object containing the environment variable schemas defined for the specified preset.
 */

export function preset(preset: 'vercel'): ReturnType<typeof vercel>;
export function preset(preset: 'netlify'): ReturnType<typeof netlify>;
export function preset(preset: 'fly'): ReturnType<typeof fly>;
export function preset(preset: 'railway'): ReturnType<typeof railway>;
export function preset(preset: 'render'): ReturnType<typeof render>;
export function preset(preset: Preset): unknown {
  return preset === 'vercel'
    ? vercel()
    : preset === 'netlify'
      ? netlify()
      : preset === 'fly'
        ? fly()
        : preset === 'railway'
          ? railway()
          : render();
}

/**
 * Vercel System Environment Variables
 * @see https://vercel.com/docs/projects/environment-variables/system-environment-variables#system-environment-variables
 */
const vercel = () => {
  return {
    VERCEL: z.string().optional(),
    CI: z.string().optional(),
    VERCEL_ENV: z.enum(['development', 'preview', 'production']).optional(),
    VERCEL_URL: z.string().optional(),
    VERCEL_PROJECT_PRODUCTION_URL: z.string().optional(),
    VERCEL_BRANCH_URL: z.string().optional(),
    VERCEL_REGION: z.string().optional(),
    VERCEL_DEPLOYMENT_ID: z.string().optional(),
    VERCEL_SKEW_PROTECTION_ENABLED: z.string().optional(),
    VERCEL_AUTOMATION_BYPASS_SECRET: z.string().optional(),
    VERCEL_GIT_PROVIDER: z.string().optional(),
    VERCEL_GIT_REPO_SLUG: z.string().optional(),
    VERCEL_GIT_REPO_OWNER: z.string().optional(),
    VERCEL_GIT_REPO_ID: z.string().optional(),
    VERCEL_GIT_COMMIT_REF: z.string().optional(),
    VERCEL_GIT_COMMIT_SHA: z.string().optional(),
    VERCEL_GIT_COMMIT_MESSAGE: z.string().optional(),
    VERCEL_GIT_COMMIT_AUTHOR_LOGIN: z.string().optional(),
    VERCEL_GIT_COMMIT_AUTHOR_NAME: z.string().optional(),
    VERCEL_GIT_PREVIOUS_SHA: z.string().optional(),
    VERCEL_GIT_PULL_REQUEST_ID: z.string().optional(),
  } as const;
};

/**
 * Render System Environment Variables
 * @see https://docs.render.com/environment-variables#all-runtimes
 */
const render = () => {
  return {
    IS_PULL_REQUEST: z.string().optional(),
    RENDER_DISCOVERY_SERVICE: z.string().optional(),
    RENDER_EXTERNAL_HOSTNAME: z.string().optional(),
    RENDER_EXTERNAL_URL: z.string().optional(),
    RENDER_GIT_BRANCH: z.string().optional(),
    RENDER_GIT_COMMIT: z.string().optional(),
    RENDER_GIT_REPO_SLUG: z.string().optional(),
    RENDER_INSTANCE_ID: z.string().optional(),
    RENDER_SERVICE_ID: z.string().optional(),
    RENDER_SERVICE_NAME: z.string().optional(),
    RENDER_SERVICE_TYPE: z
      .enum(['web', 'pserv', 'cron', 'worker', 'static'])
      .optional(),
    RENDER: z.string().optional(),
  } as const;
};

/**
 * Railway Environment Variables
 * @see https://docs.railway.app/reference/variables#railway-provided-variables
 */
const railway = () => {
  return {
    RAILWAY_PUBLIC_DOMAIN: z.string().optional(),
    RAILWAY_PRIVATE_DOMAIN: z.string().optional(),
    RAILWAY_TCP_PROXY_DOMAIN: z.string().optional(),
    RAILWAY_TCP_PROXY_PORT: z.string().optional(),
    RAILWAY_TCP_APPLICATION_PORT: z.string().optional(),
    RAILWAY_PROJECT_NAME: z.string().optional(),
    RAILWAY_PROJECT_ID: z.string().optional(),
    RAILWAY_ENVIRONMENT_NAME: z.string().optional(),
    RAILWAY_ENVIRONMENT_ID: z.string().optional(),
    RAILWAY_SERVICE_NAME: z.string().optional(),
    RAILWAY_SERVICE_ID: z.string().optional(),
    RAILWAY_REPLICA_ID: z.string().optional(),
    RAILWAY_DEPLOYMENT_ID: z.string().optional(),
    RAILWAY_SNAPSHOT_ID: z.string().optional(),
    RAILWAY_VOLUME_NAME: z.string().optional(),
    RAILWAY_VOLUME_MOUNT_PATH: z.string().optional(),
    RAILWAY_RUN_UID: z.string().optional(),
    RAILWAY_GIT_COMMIT_SHA: z.string().optional(),
    RAILWAY_GIT_AUTHOR_EMAIL: z.string().optional(),
    RAILWAY_GIT_BRANCH: z.string().optional(),
    RAILWAY_GIT_REPO_NAME: z.string().optional(),
    RAILWAY_GIT_REPO_OWNER: z.string().optional(),
    RAILWAY_GIT_COMMIT_MESSAGE: z.string().optional(),
  } as const;
};

/**
 * Fly.io Environment Variables
 * @see https://fly.io/docs/machines/runtime-environment/#environment-variables
 */
const fly = () => {
  return {
    FLY_APP_NAME: z.string().optional(),
    FLY_MACHINE_ID: z.string().optional(),
    FLY_ALLOC_ID: z.string().optional(),
    FLY_REGION: z.string().optional(),
    FLY_PUBLIC_IP: z.string().optional(),
    FLY_IMAGE_REF: z.string().optional(),
    FLY_MACHINE_VERSION: z.string().optional(),
    FLY_PRIVATE_IP: z.string().optional(),
    FLY_PROCESS_GROUP: z.string().optional(),
    FLY_VM_MEMORY_MB: z.string().optional(),
    PRIMARY_REGION: z.string().optional(),
  } as const;
};

/**
 * Netlify Environment Variables
 * @see https://docs.netlify.com/configure-builds/environment-variables
 */
const netlify = () => {
  return {
    NETLIFY: z.string().optional(),
    BUILD_ID: z.string().optional(),
    CONTEXT: z
      .enum(['production', 'deploy-preview', 'branch-deploy', 'dev'])
      .optional(),
    REPOSITORY_URL: z.string().optional(),
    BRANCH: z.string().optional(),
    URL: z.string().optional(),
    DEPLOY_URL: z.string().optional(),
    DEPLOY_PRIME_URL: z.string().optional(),
    DEPLOY_ID: z.string().optional(),
    SITE_NAME: z.string().optional(),
    SITE_ID: z.string().optional(),
  } as const;
};
