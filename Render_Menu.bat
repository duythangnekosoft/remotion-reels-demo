@echo off
title Remotion Reels US - Menu Render Video
cd /d "%~dp0"
:menu
cls
echo =========================================================================
echo        MENU XUAT VIDEO - MOI THE LOAI 1 VIDEO DAI DIEN CHUAN NHAT
echo =========================================================================
echo  1. Marble Race Grand Prix (Dua Bi Vao Dich + Buc Vinh Quang - 40s)
echo  2. Territory Conquest (Chinh Phuc 100%% Lanh Tho Ban Do - 36s)
echo  3. Lucky Plinko ASMR Drop (Tha Bong An Jackpot $1M - 33s)
echo  4. Would You Rather Showdown (Song Dau Lua Chon & Ti Le Vote - 33s)
echo  5. The Last Marble (Tuyet Pham Vat Ly Co Hoc ASMR - 45s)
echo  6. Kinetic Brick Breaker 1K (Pha Sach 3,076 Gach - 56s)
echo  7. Kinetic Build Battle (2 Phe Xay Tuong Chiem 100%% San - 36s)
echo  8. Kinetic Neon Bloom (Bong Nhan Doi No Ro 900 Qua - 35s)
echo  9. Tech Giants Market Cap Race (Dua Top Von Hoa Cong Nghe - 35s)
echo  10. Billionaires Wealth Race (Dua Top Ty Phu Giau Nhat - 35s)
echo  11. Fake iMessage Drama (Tam Su AITAH Kich Tinh - 67s)
echo  12. US Geography IQ Quiz (Do Vui Dia Ly Nuoc My - 101s)
echo  13. Bible Scripture Trivia (Do Vui Kinh Thanh My - 101s)
echo  14. 80s/90s Nostalgia Quiz (Do Vui Hoai Niem Thap Nien - 104s)
echo  15. US Crazy Laws Quiz (Do Vui Luat Ky Quac 50 Bang - 104s)
echo -------------------------------------------------------------------------
echo  16. Xuat TOAN BO 15 Video Dai Dien (Render All Master Videos)
echo  17. Kiem Tra Tinh Toan Ven Timeline & Am Thanh (npm test)
echo  18. Thoat
echo =========================================================================
set /p opt="Chon video muon xuat [1-18]: "

if "%opt%"=="1" (npm run render:marble & pause & goto menu)
if "%opt%"=="2" (npm run render:territory & pause & goto menu)
if "%opt%"=="3" (npm run render:plinko & pause & goto menu)
if "%opt%"=="4" (npm run render:wyr & pause & goto menu)
if "%opt%"=="5" (npx remotion render src/index.ts LastMarble-MechanicalASMR out/last_marble.mp4 & pause & goto menu)
if "%opt%"=="6" (npx remotion render src/index.ts Kinetic-BrickBreaker-1K out/kinetic/Kinetic-BrickBreaker-1K.mp4 & pause & goto menu)
if "%opt%"=="7" (npx remotion render src/index.ts Kinetic-BuildBattle-35s out/kinetic/Kinetic-BuildBattle-35s.mp4 & pause & goto menu)
if "%opt%"=="8" (npx remotion render src/index.ts Kinetic-NeonBloom-35s out/kinetic/Kinetic-NeonBloom-35s.mp4 & pause & goto menu)
if "%opt%"=="9" (npm run build:barchart & pause & goto menu)
if "%opt%"=="10" (npm run build:billionaires & pause & goto menu)
if "%opt%"=="11" (npm run render:chat & pause & goto menu)
if "%opt%"=="12" (npm run render:geography & pause & goto menu)
if "%opt%"=="13" (npm run render:bible & pause & goto menu)
if "%opt%"=="14" (npm run render:nostalgia & pause & goto menu)
if "%opt%"=="15" (npm run render:laws & pause & goto menu)
if "%opt%"=="16" (npm run build:all & pause & goto menu)
if "%opt%"=="17" (npm test & pause & goto menu)
if "%opt%"=="18" (exit)
goto menu
