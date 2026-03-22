# Kubernetes Deep Dive

Interactive Kubernetes learning app built with React, TypeScript, Vite, Tailwind CSS, and shadcn/ui.

## Run Locally

### Prerequisites

- Node.js 18 or newer
- npm

You can verify your setup with:

```sh
node -v
npm -v
```

### Install Dependencies

```sh
npm install --legacy-peer-deps
```

### Start the Development Server

```sh
npm run dev
```

By default, Vite tries to use:

```sh
http://localhost:8080
```

If port `8080` is already in use, Vite automatically picks the next available port such as `8081`.

### Stop the Development Server

When the dev server is running in your terminal, stop it with:

```sh
Ctrl + C
```

If PowerShell asks whether you want to terminate the batch job, press `Y` and then `Enter`.

## Local Workflow

1. Open a terminal in the project folder.
2. Install dependencies with `npm install --legacy-peer-deps`.
3. Start the app with `npm run dev`.
4. Open the local URL shown in the terminal.
5. When you are done, return to the terminal and stop the server with `Ctrl + C`.

## Available Scripts

### Development

```sh
npm run dev
```

Starts the Vite dev server with hot reload on port `8080`.

### Production Build

```sh
npm run build
```

Creates an optimized production build.

### Preview the Production Build

```sh
npm run preview
```

Serves the built app locally so you can verify the production output.

### Lint

```sh
npm run lint
```

Runs ESLint across the project.

### Tests

```sh
npm run test
```

Runs the test suite once with Vitest.

```sh
npm run test:watch
```

Runs Vitest in watch mode during development.

## Project Structure

```text
src/
  components/
    learning/          Learning-page building blocks
    simulator/         Simulator-specific UI
    troublelab/        Troubleshooting lab UI
    ui/                Shared shadcn/ui primitives
    visuallab/         Visual lab components
    AppSidebar.tsx     Main app navigation sidebar
    Layout.tsx         Shared page layout wrapper
    NavLink.tsx        Navigation link helper
  hooks/
    use-mobile.tsx     Mobile breakpoint helper
    use-toast.ts       Toast state hook
  lib/
    utils.ts           Shared utility helpers
  pages/               Route-level screens for each Kubernetes topic and lab
  test/
    setup.ts           Test environment setup
    example.test.ts    Example Vitest test
  App.tsx              Main route configuration
  main.tsx             React app entry point
  index.css            Global styles and Tailwind layers
public/                 Static assets loaded directly by Vite
package.json            Scripts and dependencies
vite.config.ts          Vite dev server and alias config
vitest.config.ts        Vitest configuration
```

### Pages and Routing

The app uses `react-router-dom` in `src/App.tsx` and is organized as a multi-page learning experience. The `src/pages` folder contains the main topic pages such as:

- `StartHere`
- `Foundations`
- `Architecture`
- `Networking`
- `Objects`
- `Workloads`
- `Services`
- `Storage`
- `Security`
- `Scheduling`
- `Labels`
- `Config`
- `Operators`
- `OpenShift`
- `Glossary`
- `Troubleshooting`
- interactive lab pages including `VisualLab`, `Simulator`, and `TroubleshootingLab`

Each page is connected to a route like `/networking`, `/services`, or `/visual-lab/:scenarioId`.

## Notes

- The dev server is configured in `vite.config.ts` to use port `8080`.
- `npm install` currently fails with a peer dependency conflict between `@react-three/drei` and `@react-three/fiber`, so `--legacy-peer-deps` is required for the current dependency set.
- In Windows PowerShell, if you see an execution policy error for `npm`, run the same commands with `npm.cmd` instead.
- `npm run dev` may also be written as `npm.cmd run dev` in PowerShell if needed.
- This project includes both `package-lock.json` and Bun lockfiles, but the npm workflow above is the clearest default for local setup.
