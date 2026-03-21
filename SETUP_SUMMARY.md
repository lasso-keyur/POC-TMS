# Monorepo Setup Summary - February 22, 2026

## What Was Completed ✅

### 1. **Monorepo Structure Created**
- Root `package.json` updated with npm workspaces configuration
- Two workspaces defined:
  - `packages/teammate-voices-design-system` - Your existing Teammate Voices Design System
  - `packages/empsurvey` - New EMPSurvey employee feedback application

### 2. **EMPSurvey Package Scaffolding**
Created complete React application structure:
- `packages/empsurvey/package.json` - Dependencies set up (React 18, Vite, TypeScript)
- `packages/empsurvey/vite.config.ts` - Dev server on port 5174
- `packages/empsurvey/tsconfig.json` - TypeScript configuration
- `packages/empsurvey/index.html` - HTML entry point
- `packages/empsurvey/src/` - React app with:
  - `main.tsx` - React entry point
  - `App.tsx` - Main component with "Start Survey" button
  - `App.css` - App styling
  - `index.css` - Global styles using Apple design tokens

### 3. **Package Dependency Configuration**
- EMPSurvey depends on `@teammate-voices/design-system` (workspace package)
- Allows EMPSurvey to import components: `import { Input, Button } from "@teammate-voices/design-system"`
- Teammate Voices exports React, react-dom, and shared components

### 4. **Docker Setup for Multi-App**
Updated `docker-compose.yml` and `docker-compose.prod.yml`:
- **tv-web service:** Vite dev server on http://localhost:5173 (development)
- **survey-web service:** Vite dev server on http://localhost:5174 (development)
- **oracle-db service:** Shared Oracle database on localhost:1521
- All services on shared `tv-network` for inter-service communication
- Includes health checks and proper dependency ordering

### 5. **Dockerfiles for Each Package**
- `packages/teammate-voices-design-system/Dockerfile` - Dev image with workspace support
- `packages/teammate-voices-design-system/Dockerfile.prod` - Production Nginx image (port 80)
- `packages/empsurvey/Dockerfile` - Dev image with workspace support
- `packages/empsurvey/Dockerfile.prod` - Production Nginx image (port 80)
- `packages/empsurvey/nginx.conf` - Nginx routing configuration

### 6. **Shared Database Configuration**
- Created `shared-db.config.ts` at root level
- Defines database connection parameters used by both apps
- Configurable via environment variables
- References both `APPLE_ACCOUNT_USERS` table and new survey tables

### 7. **Documentation**
- `MONOREPO.md` - Complete monorepo guide with command reference
- `MIGRATION_GUIDE.md` - Step-by-step instructions for moving files to packages/

---

## What Still Needs to Be Done 🚧

### **REQUIRED: Move Existing Teammate Voices Files to packages/teammate-voices-design-system/**

Your current Teammate Voices app files are still in the root directory. They need to be moved:

```
FROM ROOT DIRECTORY          → TO PACKAGES/TEAMMATE-VOICES-DESIGN-SYSTEM/
├── src/                    → packages/teammate-voices-design-system/src/
├── public/                 → packages/teammate-voices-design-system/public/
├── index.html              → packages/teammate-voices-design-system/index.html
├── vite.config.ts         → packages/teammate-voices-design-system/vite.config.ts
├── tsconfig.json          → packages/teammate-voices-design-system/tsconfig.json
├── tsconfig.node.json     → packages/teammate-voices-design-system/tsconfig.node.json
├── .eslintrc.cjs          → packages/teammate-voices-design-system/.eslintrc.cjs
└── nginx.conf             → packages/teammate-voices-design-system/nginx.conf
```

**Option A: Drag & Drop in VS Code (Recommended for Safety)**
1. Open VS Code file explorer
2. Select `src/`, `public/`, `index.html`, etc.
3. Drag to `packages/teammate-voices-design-system/` folder
4. VS Code will handle imports/references automatically

**Option B: Using Terminal**
```bash
cd /Users/keyur/AI\ Projects/Teammate\ Voices

# Copy the files
cp -r src packages/teammate-voices-design-system/
cp -r public packages/teammate-voices-design-system/
cp index.html packages/teammate-voices-design-system/
cp vite.config.ts packages/teammate-voices-design-system/
cp tsconfig.json packages/teammate-voices-design-system/
cp tsconfig.node.json packages/teammate-voices-design-system/
cp .eslintrc.cjs packages/teammate-voices-design-system/
cp nginx.conf packages/teammate-voices-design-system/
```

### **After Moving Files:**

1. **Update imports in moved components**
   - Paths that were `../styles` might need to be `./styles` (depending on structure)
   - The migration guide includes troubleshooting tips

2. **Reinstall dependencies**
   ```bash
   rm package-lock.json
   npm install
   ```

3. **Test the monorepo structure**
   ```bash
   # Start Teammate Voices Design System
   npm run dev:ds
   
   # In another terminal, start EMPSurvey
   npm run dev:survey
   
   # In another terminal, start database
   npm run db:up
   ```

4. **Verify imports work**
   - Check that EMPSurvey can import from Teammate Voices: `import { Input, Button } from "@teammate-voices/design-system"`
   - Update EMPSurvey App.tsx to use Teammate Voices Input and Button components

---

## Current Directory Structure

```
Teammate-Voices-Monorepo/
├── packages/
│   ├── teammate-voices-design-system/
│   │   ├── package.json         ✅ Created
│   │   ├── vite.config.ts       (Need to move from root)
│   │   ├── tsconfig.json        (Need to move from root)
│   │   ├── Dockerfile           ✅ Created
│   │   ├── Dockerfile.prod      ✅ Created
│   │   ├── nginx.conf           (Need to move from root)
│   │   ├── src/                 (Need to move from root)
│   │   ├── public/              (Need to move from root)
│   │   └── index.html           (Need to move from root)
│   │
│   └── empsurvey/
│       ├── package.json         ✅ Created
│       ├── vite.config.ts       ✅ Created
│       ├── tsconfig.json        ✅ Created
│       ├── Dockerfile           ✅ Created
│       ├── Dockerfile.prod      ✅ Created
│       ├── nginx.conf           ✅ Created
│       ├── index.html           ✅ Created
│       └── src/
│           ├── main.tsx         ✅ Created
│           ├── App.tsx          ✅ Created
│           ├── App.css          ✅ Created
│           └── index.css        ✅ Created
│
├── db/
│   └── init/
│       └── 01-schema.sql        ✅ (Existing)
│
├── docker-compose.yml           ✅ Updated
├── docker-compose.prod.yml      ✅ Updated
├── docker-compose.db.yml        ✅ (Existing)
├── package.json                 ✅ Updated
├── MONOREPO.md                  ✅ Created
├── MIGRATION_GUIDE.md           ✅ Created
├── shared-db.config.ts          ✅ Created
│
└── [Root-level files still here - need to move]
    ├── src/
    ├── public/
    ├── index.html
    ├── vite.config.ts
    └── ... other config files
```

---

## Key Architectural Benefits

### **Database Sharing** 🗄️
Both Teammate Voices and EMPSurvey connect to the same Oracle database:
- Same `APPLE_ACCOUNT_USERS` table for user data
- New survey tables added once created
- Connection via environment variables in docker-compose

### **Component Reuse** 🔧
EMPSurvey can use Teammate Voices components:
```tsx
// In EMPSurvey
import { Input, Button, Select } from "@teammate-voices/design-system";

export function SurveyForm() {
  return (
    <form>
      <Input label="Name" />
      <Button>Submit</Button>
    </form>
  );
}
```

### **Isolated Development** 🚀
- Each app runs on separate port (5173 vs 5174)
- Independent docker services
- Can be deployed separately or together

### **Unified Script Commands** 📝
```bash
npm run dev:ds      # Start only Teammate Voices
npm run dev:survey    # Start only EMPSurvey
npm run build:ds    # Build only Teammate Voices
npm run build:survey  # Build only EMPSurvey
npm run db:up         # Start database
npm run docker:prod   # Deploy both apps to production
```

---

## Next Steps

1. **Move Teammate Voices files to packages/teammate-voices-design-system/** (See MIGRATION_GUIDE.md)
2. **Reinstall dependencies** with workspace support
3. **Test both apps** running simultaneously
4. **Update EMPSurvey App.tsx** to use Teammate Voices Input and Button components
5. **Create shared types** for database models (optional but recommended)
6. **Build backend API** when ready (Node.js/Express recommended)

---

## Questions?

- See `MONOREPO.md` for full documentation
- See `MIGRATION_GUIDE.md` for moving files safely
- Check `shared-db.config.ts` for database configuration

Your monorepo is now ready! 🎉
