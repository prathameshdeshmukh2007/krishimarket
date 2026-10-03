@echo off
title KrishiMarket - Deploy to Vercel
echo ========================================================
echo        KRISHIMARKET - 1-CLICK VERCEL DEPLOYMENT
echo ========================================================
echo.
echo 1. Testing and compiling production build...
call npm run build
if %ERRORLEVEL% NEQ 0 (
  echo.
  echo [ERROR] Build failed! Check messages above.
  pause
  exit /b %ERRORLEVEL%
)

echo.
echo 2. Launching Vercel deployment...
echo Log in with your GitHub/Email if prompted.
echo.
call npx vercel
echo.
echo ========================================================
echo  Deployment complete! To push directly to production:
echo  Run: npx vercel --prod
echo ========================================================
pause
