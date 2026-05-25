# CareBridge Mobile — E2E Tests (Maestro)

This directory contains end-to-end flow tests for the CareBridge mobile app, written with [Maestro](https://maestro.mobile.dev/).

---

## Prerequisites

### 1. Install Maestro CLI

```bash
curl -Ls "https://get.maestro.mobile.dev" | bash
```

Verify the installation:

```bash
maestro --version
```

### 2. Start the Expo dev build on a device or emulator

Build and install the dev client on a connected Android device or emulator (or iOS simulator):

```bash
# Android
npx expo run:android

# iOS
npx expo run:ios
```

The app must be running and visible on the device before executing any flows.

---

## Running the tests

### Run all flows

```bash
npm run test:e2e
```

This is equivalent to:

```bash
maestro test e2e/
```

### Run a single flow

```bash
maestro test e2e/auth-login.yaml
```

---

## Required environment variables

The flows read credentials from environment variables. Set these before running any test:

| Variable | Description |
|---|---|
| `E2E_PARENT_EMAIL` | Email address of the parent fixture user |
| `E2E_PARENT_PASSWORD` | Password of the parent fixture user |

Example (`.env` or shell export):

```bash
export E2E_PARENT_EMAIL=e2e.parent@carebridge-test.com
export E2E_PARENT_PASSWORD=E2eParent123!
```

> The fixture user must already exist in the test database. Run `npm run seed:e2e` from the `carebridge-api` project to create it.

---

## Flow files

| File | Description |
|---|---|
| `auth-login.yaml` | Parent login happy-path |
| `auth-signup.yaml` | New parent registration |
| `screening-flow.yaml` | M-CHAT questionnaire journey (depends on `auth-login.yaml`) |
| `roadmap-flow.yaml` | Growth journey navigation (depends on `auth-login.yaml`) |
