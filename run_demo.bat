@echo off
echo ======================================================================
echo SkuVeritas — Single Command Demo Launcher
echo Starting Part 1 (:8000), Part 1 UI (:5173), Part 2 (:8001), Part 2 UI (:5174)
echo ======================================================================

start "Part 1 Backend (:8000)" cmd /k "cd backend && python run.py"
start "Part 1 Frontend (:5173)" cmd /k "cd frontend && npm run dev"

start "Part 2 Backend (:8001)" cmd /k "cd backend_part2 && python run.py"
start "Part 2 Frontend (:5174)" cmd /k "cd frontend_part2 && npm run dev"

echo Waiting 5 seconds for services to initialize...
timeout /t 5 /nobreak > NUL

echo Opening Part 2 Operator Dashboard...
start http://localhost:5174

echo ======================================================================
echo SkuVeritas System Live!
echo Part 1 Catalog: http://localhost:5173
echo Part 2 Dossiers: http://localhost:5174
echo ======================================================================
