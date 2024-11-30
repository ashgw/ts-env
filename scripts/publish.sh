#!/bin/bash

check_env_var() {
  local var_name="$1"
  if [ -z "${!var_name}" ]; then
    echo "Error: $var_name is not set."
    exit 1
  fi
}

check_env_var "NPM_TOKEN"
check_env_var "GITHUB_TOKEN"

echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > ~/.npmrc

if ! pnpm can-npm-publish; then
  echo "This package cannot be published, as this version already exists."
  exit 0
fi

pnpm publish --access public
