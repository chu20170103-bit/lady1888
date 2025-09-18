@echo off
chcp 65001 >nul 2>&1
setlocal enabledelayedexpansion

:start
echo ================================
echo 🤖 AI指令大全網站 - 精簡管理工具
echo ================================
echo.

echo 請選擇操作：
echo 1. 快速上傳檔案 (一鍵推送)
echo 2. 部署指定版本 (上架)
echo 3. 下架所有檔案
echo 4. 建立版本備份
echo 5. 查看版本資訊
echo 6. 初始化/連接 GitHub 倉庫
echo 7. 修復 Git 問題
echo 8. 檢查認證狀態
echo 9. 🔄 重置工具 (清除所有設定)
echo 10. 退出
echo.

set /p choice=請輸入選項 (1-10): 

if "%choice%"=="1" goto quick_upload
if "%choice%"=="2" goto deploy_version
if "%choice%"=="3" goto cleanup_github
if "%choice%"=="4" goto create_backup
if "%choice%"=="5" goto show_versions
if "%choice%"=="6" goto init_connect_git
if "%choice%"=="7" goto fix_git_issues
if "%choice%"=="8" goto check_auth_status
if "%choice%"=="9" goto reset_tool
if "%choice%"=="10" goto exit
echo 無效選項
pause
goto start

:quick_upload
echo.
echo ================================
echo ⚡ 快速上傳檔案
echo ================================
echo.

echo 正在快速上傳所有檔案到 GitHub...
echo.

echo 步驟1: 檢查 Git 狀態...
git status --short
echo.

echo 步驟2: 添加所有檔案...
git add .
if errorlevel 1 (
    echo ❌ 添加檔案失敗
    pause
    goto start
)
echo ✅ 檔案已添加

echo.
echo 步驟3: 提交變更...
set commit_msg=快速上傳 - %date% %time%
git commit -m "!commit_msg!"
if errorlevel 1 (
    echo ❌ 提交失敗
    pause
    goto start
)
echo ✅ 變更已提交

echo.
echo 步驟4: 推送到 GitHub...
git push origin main
if errorlevel 1 (
    echo ❌ 推送失敗，嘗試強制推送...
    git push -f origin main
    if errorlevel 1 (
        echo ❌ 強制推送到 main 也失敗，嘗試 master...
        git push -f origin master
        if errorlevel 1 (
            echo ❌ 推送失敗
            echo.
            echo 可能的原因：
            echo 1. 網路連接問題
            echo 2. GitHub 認證問題
            echo 3. 倉庫權限問題
            echo.
            echo 建議使用「修復 Git 問題」功能
            pause
            goto start
        ) else (
            echo ✅ 已強制推送到 master 分支
        )
    ) else (
        echo ✅ 已強制推送到 main 分支
    )
) else (
    echo ✅ 已推送到 main 分支
)

echo.
echo ================================
echo 🎉 快速上傳完成！
echo ================================
echo.
echo 當前遠端倉庫：
git remote -v
echo.
echo 如果這是 GitHub Pages 倉庫，您的網站地址可能是：
for /f "tokens=*" %%i in ('git remote get-url origin 2^>nul') do set current_repo=%%i
if defined current_repo (
    echo %current_repo:~0,-4%.github.io/%current_repo:~19%
) else (
    echo 無法取得倉庫資訊
)
echo.

pause
goto start

:deploy_version
echo.
echo ================================
echo 📦 部署指定版本
echo ================================
echo.

echo 可用的本地版本：
dir /b | findstr "^v" 2>nul
echo.

if errorlevel 1 (
    echo  沒有找到版本資料夾！
    echo.
    echo  建議操作：
    echo 1. 使用 "建立版本備份" 建立版本
    echo 2. 或使用 "快速上傳檔案" 部署當前版本
    echo.
    pause
    goto start
)

echo.
set /p version=請輸入要部署的版本號 (如 v1.5): 

if "%version%"=="" (
    echo 版本號不能為空！
    pause
    goto start
)

if not exist "%version%" (
    echo 版本資料夾不存在：%version%
    echo 可用的版本：
    dir /b | findstr "^v"
    echo.
    pause
    goto start
)

echo.
echo  正在部署版本：%version%
echo.

echo  步驟1: 備份當前檔案...
if not exist "backup_current" mkdir backup_current
copy index.html backup_current\ 2>nul
copy script.js backup_current\ 2>nul
copy style.css backup_current\ 2>nul
copy "通用github管理工具.bat" backup_current\ 2>nul
echo  當前檔案已備份

echo.
echo  步驟2: 下架GitHub舊檔案...
git rm -r --cached .
echo  GitHub舊檔案已下架

echo.
echo  步驟3: 複製版本檔案...
copy "%version%\index.html" . 2>nul
copy "%version%\script.js" . 2>nul
copy "%version%\style.css" . 2>nul
copy "%version%\通用github管理工具.bat" . 2>nul
echo  版本檔案已複製

echo.
echo  步驟4: 添加版本檔案到Git...
git add .
if errorlevel 1 (
    echo  ❌ 添加檔案失敗
    pause
    goto start
)
echo  版本檔案已添加到Git

echo.
echo  步驟5: 提交變更...
set commit_msg=部署版本 %version% - %date% %time%
git commit -m "!commit_msg!"
if errorlevel 1 (
    echo  ❌ 提交失敗
    pause
    goto start
)
echo  變更已提交

echo.
echo  步驟6: 上架到GitHub...
git push origin main
if errorlevel 1 (
    echo  ❌ 上架失敗，嘗試強制推送...
    git push -f origin main
    if errorlevel 1 (
        echo  ❌ 強制推送到 main 也失敗，嘗試 master...
        git push -f origin master
        if errorlevel 1 (
            echo  ❌ 上架失敗
            echo.
            echo  可能的原因：
            echo  1. 網路連接問題
            echo  2. GitHub 認證問題
            echo  3. 倉庫權限問題
            echo.
            echo  建議使用「修復 Git 問題」功能
            pause
            goto start
        ) else (
            echo  ✅ 已強制推送到 master 分支
        )
    ) else (
        echo  ✅ 已強制推送到 main 分支
    )
) else (
    echo  ✅ 已推送到 main 分支
)
echo  版本 %version% 已上架到GitHub

echo.
echo ================================
echo  部署完成！
echo ================================
echo.
echo  部署資訊：
echo   版本：%version%
echo   時間：%date% %time%
for /f "tokens=*" %%i in ('git remote get-url origin 2^>nul') do set current_repo=%%i
if defined current_repo (
    echo   GitHub：%current_repo%
    echo   網站：%current_repo:~0,-4%.github.io/%current_repo:~19%
) else (
    echo   無法取得倉庫資訊
)
echo.

set /p restore=是否恢復到部署前的狀態？(y/n): 
if /i "%restore%"=="y" (
    echo.
    echo 🔄 正在恢復檔案...
    copy backup_current\index.html . 2>nul
    copy backup_current\script.js . 2>nul
    copy backup_current\style.css . 2>nul
    copy backup_current\通用github管理工具.bat . 2>nul
    echo  檔案已恢復到部署前狀態
    echo.
    echo  提示：GitHub上仍然是 %version% 版本
    echo     只有本地檔案恢復了
)

echo.
pause
goto start

:cleanup_github
echo.
echo ================================
echo 🗑️ 下架所有檔案
echo ================================
echo.

echo   警告：這將刪除GitHub上的所有檔案！
echo.
echo 下架後的效果：
echo - GitHub Repository 會變成空白
echo - 網站會無法顯示
echo - 所有檔案都會被移除
echo.

set /p confirm=確定要下架所有檔案嗎？(y/n): 

if /i not "%confirm%"=="y" (
    echo 操作已取消
    pause
    goto start
)

echo.
echo  步驟1: 備份當前檔案...
if not exist "backup_before_cleanup" mkdir backup_before_cleanup
copy index.html backup_before_cleanup\ 2>nul
copy style.css backup_before_cleanup\ 2>nul
copy script.js backup_before_cleanup\ 2>nul
copy "通用github管理工具.bat" backup_before_cleanup\ 2>nul
copy *.txt backup_before_cleanup\ 2>nul
copy *.md backup_before_cleanup\ 2>nul
echo  檔案已備份到 backup_before_cleanup 資料夾

echo.
echo  步驟2: 檢查當前GitHub檔案...
echo  GitHub上的檔案：
git ls-tree -r origin/main --name-only
echo.

echo  步驟3: 強制下架GitHub檔案...
echo  正在移除所有追蹤的檔案...
git rm -rf --cached . 2>nul
echo  GitHub檔案已從暫存區移除

echo.
echo  步驟4: 提交下架變更...
git add -A
git commit -m "完全下架所有檔案 - %date% %time%"
if errorlevel 1 (
    echo  ❌ 提交失敗，嘗試強制提交...
    git commit --allow-empty -m "完全下架所有檔案 - %date% %time%"
    if errorlevel 1 (
        echo  ❌ 強制提交也失敗
        echo  正在嘗試其他方法...
        git reset --hard HEAD~1 2>nul
        git add -A
        git commit -m "完全下架所有檔案 - %date% %time%"
    )
)
echo  下架變更已提交

echo.
echo  步驟5: 推送到GitHub...
git push origin main
if errorlevel 1 (
    echo  ❌ 下架推送失敗，嘗試強制推送...
    git push -f origin main
    if errorlevel 1 (
        echo  ❌ 強制推送到 main 也失敗，嘗試 master...
        git push -f origin master
        if errorlevel 1 (
            echo  ❌ 下架推送失敗
            echo.
            echo  可能的原因：
            echo  1. 網路連接問題
            echo  2. GitHub 認證問題
            echo  3. 倉庫權限問題
            echo.
            echo  建議使用「修復 Git 問題」功能
            pause
            goto start
        ) else (
            echo  ✅ 已強制推送到 master 分支
        )
    ) else (
        echo  ✅ 已強制推送到 main 分支
    )
) else (
    echo  ✅ 已推送到 main 分支
)

echo.
echo  步驟6: 驗證下架結果...
echo  檢查GitHub上的檔案...
git ls-tree -r origin/main --name-only 2>nul
if errorlevel 1 (
    echo  ✅ GitHub倉庫已完全清空
) else (
    echo  ⚠️  GitHub上仍有檔案，可能需要手動檢查
)

echo.
echo ================================
echo  下架完成！
echo ================================
echo.
echo  下架資訊：
echo   時間：%date% %time%
for /f "tokens=*" %%i in ('git remote get-url origin 2^>nul') do set current_repo=%%i
if defined current_repo (
    echo   GitHub：%current_repo% (現在是空白)
    echo   網站：%current_repo:~0,-4%.github.io/%current_repo:~19% (無法顯示)
) else (
    echo   無法取得倉庫資訊
)
echo.
echo  備份位置：backup_before_cleanup 資料夾
echo.
echo  提示：可以選擇 "部署指定版本" 重新上架版本
echo.

pause
goto start

:create_backup
echo.
echo ================================
echo 💾 建立版本備份
echo ================================
echo.

set /p version=請輸入版本號 (如 v1.5): 

if "%version%"=="" (
    echo 版本號不能為空！
    pause
    goto start
)

echo 正在建立 %version% 資料夾...
mkdir %version% 2>nul

echo 正在複製檔案...
copy index.html %version%\ 2>nul
copy script.js %version%\ 2>nul
copy style.css %version%\ 2>nul
copy "通用github管理工具.bat" %version%\ 2>nul

echo.
echo 複製完成！
echo 版本資料夾：%version%
echo.

set /p deploy_now=是否立即部署此版本？(y/n): 
if /i "%deploy_now%"=="y" (
    echo 正在部署版本 %version%...
    goto deploy_version
)

echo.
pause
goto start

:show_versions
echo.
echo ================================
echo 📋 版本資訊
echo ================================
echo.

echo 本地版本：
dir /b | findstr "^v" 2>nul
if errorlevel 1 (
    echo  沒有找到版本資料夾
) else (
    echo  找到以上版本
)
echo.

echo GitHub狀態：
git status 2>nul
if errorlevel 1 (
    echo  Git未初始化
) else (
    echo  Git已初始化
)
echo.

echo 最近提交記錄：
git log --oneline -5 2>nul
echo.

pause
goto start

:init_connect_git
echo.
echo ================================
echo 🚀 初始化/連接 GitHub 倉庫
echo ================================
echo.

echo 請輸入您的 GitHub 倉庫連結：
echo 範例：https://github.com/username/repository-name
echo 或：https://github.com/username/repository-name.git
echo.
set /p repo_url=請輸入 GitHub 連結: 

if "%repo_url%"=="" (
    echo ❌ 連結不能為空！
    pause
    goto start
)

echo.
echo 正在驗證連結格式...
echo %repo_url% | findstr "github.com" >nul
if errorlevel 1 (
    echo ❌ 無效的 GitHub 連結格式
    echo 請確保連結包含 github.com
    pause
    goto start
)
echo ✅ 連結格式正確

echo.
echo 正在處理 URL 格式...
if "%repo_url:~-4%"==".git" (
    echo ✅ URL 已包含 .git 後綴
) else (
    set repo_url=%repo_url%.git
    echo ✅ 已自動添加 .git 後綴
)

echo.
echo 正在檢查 Git 是否已安裝...
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git 未安裝或未正確配置
    echo 請先安裝 Git: https://git-scm.com/
    pause
    goto start
)
echo ✅ Git 已安裝

echo.
echo 正在處理現有 Git 設定...
if exist ".git" (
    echo ✅ Git 倉庫已存在
    echo 當前遠端倉庫：
    git remote -v
    echo.
    echo 正在移除現有遠端倉庫...
    git remote remove origin 2>nul
    echo ✅ 現有遠端倉庫已移除
) else (
    echo 正在初始化 Git 倉庫...
    git init
    if errorlevel 1 (
        echo ❌ 初始化失敗
        pause
        goto start
    )
    echo ✅ Git 倉庫已初始化
)

echo.
echo 正在添加新的遠端倉庫...
git remote add origin %repo_url%
if errorlevel 1 (
    echo ❌ 添加遠端倉庫失敗
    pause
    goto start
)
echo ✅ 遠端倉庫已添加

echo.
echo 正在配置 Git 用戶資訊...
echo 請輸入您的 GitHub 用戶名：
set /p github_username=GitHub 用戶名: 
echo 請輸入您的 GitHub 信箱：
set /p github_email=GitHub 信箱: 
git config user.name "%github_username%" >nul 2>&1
git config user.email "%github_email%" >nul 2>&1
echo ✅ Git 用戶資訊已配置

echo.
echo 正在獲取遠端內容...
git fetch origin
if errorlevel 1 (
    echo ❌ 獲取遠端內容失敗
    echo 可能的原因：
    echo 1. 倉庫不存在或無權限
    echo 2. 網路連接問題
    echo 3. 倉庫連結錯誤
    pause
    goto start
)
echo ✅ 遠端內容已獲取

echo.
echo 正在添加所有檔案...
git add .
if errorlevel 1 (
    echo ❌ 添加檔案失敗
    pause
    goto start
)
echo ✅ 檔案已添加

echo.
echo 正在提交變更...
git commit -m "初始化/連接 GitHub 倉庫 - %date% %time%"
if errorlevel 1 (
    echo ❌ 提交失敗
    pause
    goto start
)
echo ✅ 變更已提交

echo.
echo 正在推送到 GitHub...
git push -u origin main
if errorlevel 1 (
    echo ❌ 推送到 main 失敗
    echo.
    echo 嘗試推送到 master 分支...
    git push -u origin master
    if errorlevel 1 (
        echo ❌ 推送到 master 也失敗
        echo.
        echo 嘗試強制推送到 main...
        git push -f origin main
        if errorlevel 1 (
            echo 嘗試強制推送到 master...
            git push -f origin master
            if errorlevel 1 (
                echo ❌ 所有推送方式都失敗
                echo.
                echo 可能的原因：
                echo 1. 網路連接問題
                echo 2. GitHub 認證問題
                echo 3. 倉庫權限問題
                echo.
                pause
                goto start
            ) else (
                echo ✅ 已強制推送到 master 分支
            )
        ) else (
            echo ✅ 已強制推送到 main 分支
        )
    ) else (
        echo ✅ 已推送到 master 分支
    )
) else (
    echo ✅ 已推送到 main 分支
)

echo.
echo ================================
echo 🎉 GitHub 倉庫連接完成！
echo ================================
echo.
echo 倉庫資訊：
echo 連結：%repo_url%
echo 時間：%date% %time%
echo.
echo 如果這是 GitHub Pages 倉庫，您的網站地址可能是：
echo %repo_url:~0,-4%.github.io/%repo_url:~19%
echo.

pause
goto start

:fix_git_issues
echo.
echo ================================
echo 🔧 修復 Git 問題
echo ================================
echo.

echo 正在診斷 Git 問題...
echo.

echo 步驟1: 檢查 Git 狀態...
git status
echo.

echo 步驟2: 檢查遠端倉庫...
git remote -v
echo.

echo 步驟3: 檢查分支資訊...
git branch -a
echo.

echo 步驟4: 嘗試獲取遠端內容...
git fetch origin
if errorlevel 1 (
    echo ❌ 獲取遠端內容失敗
    echo 正在嘗試重新添加遠端倉庫...
    echo 請輸入正確的 GitHub 倉庫連結：
    set /p repo_url=請輸入 GitHub 連結: 
    if "%repo_url%"=="" (
        echo ❌ 連結不能為空！
        pause
        goto start
    )
    git remote remove origin
    git remote add origin %repo_url%
    git fetch origin
    if errorlevel 1 (
        echo ❌ 仍然無法獲取遠端內容
        echo 請檢查網路連接和 GitHub 認證
        pause
        goto start
    )
)
echo ✅ 遠端內容已獲取

echo.
echo 步驟5: 嘗試合併遠端內容...
git merge origin/main --allow-unrelated-histories
if errorlevel 1 (
    echo ❌ 合併失敗，可能有衝突
    echo 正在嘗試強制合併...
    git reset --hard origin/main
    if errorlevel 1 (
        echo ❌ 強制合併也失敗
        echo 請手動解決衝突
        pause
        goto start
    )
    echo ✅ 強制合併成功
) else (
    echo ✅ 合併成功
)

echo.
echo 步驟6: 添加所有檔案...
git add .
if errorlevel 1 (
    echo ❌ 添加檔案失敗
    pause
    goto start
)
echo ✅ 檔案已添加

echo.
echo 步驟7: 提交變更...
git commit -m "修復 Git 問題 - %date% %time%"
if errorlevel 1 (
    echo ❌ 提交失敗
    pause
    goto start
)
echo ✅ 變更已提交

echo.
echo 步驟8: 推送到 GitHub...
git push origin main
if errorlevel 1 (
    echo ❌ 推送失敗，嘗試強制推送...
    git push -f origin main
    if errorlevel 1 (
        echo ❌ 強制推送到 main 也失敗，嘗試 master...
        git push -f origin master
        if errorlevel 1 (
            echo ❌ 推送失敗
            echo.
            echo 可能的原因：
            echo 1. 網路連接問題
            echo 2. GitHub 認證問題
            echo 3. 倉庫權限問題
            echo.
            pause
            goto start
        ) else (
            echo ✅ 已強制推送到 master 分支
        )
    ) else (
        echo ✅ 已強制推送到 main 分支
    )
) else (
    echo ✅ 已推送到 main 分支
)

echo.
echo ================================
echo 🎉 Git 問題已修復！
echo ================================
echo.
echo 當前遠端倉庫：
git remote -v
echo.
echo 如果這是 GitHub Pages 倉庫，您的網站地址可能是：
for /f "tokens=*" %%i in ('git remote get-url origin 2^>nul') do set current_repo=%%i
if defined current_repo (
    echo %current_repo:~0,-4%.github.io/%current_repo:~19%
) else (
    echo 無法取得倉庫資訊
)
echo.

pause
goto start

:check_auth_status
echo.
echo ================================
echo 🔍 檢查認證狀態
echo ================================
echo.

echo 正在檢查 Git 認證狀態...
echo.

echo 步驟1: 檢查 Git 用戶資訊...
echo ================================
echo 用戶名：
git config --get user.name
echo 信箱：
git config --get user.email
echo ================================

echo.
echo 步驟2: 檢查遠端倉庫...
echo ================================
git remote -v
echo ================================

echo.
echo 步驟3: 測試遠端連接...
echo ================================
echo 正在測試 GitHub 連接...
git ls-remote origin >nul 2>&1
if errorlevel 1 (
    echo ❌ 無法連接到 GitHub
    echo.
    echo 可能的原因：
    echo 1. 需要 Personal Access Token
    echo 2. 網路連接問題
    echo 3. 倉庫權限問題
    echo.
    echo 建議操作：
    echo 1. 檢查是否需要 Personal Access Token
    echo 2. 確認倉庫權限設定
    echo 3. 重新設定認證資訊
) else (
    echo ✅ GitHub 連接正常
    echo.
    echo 認證狀態良好，可以正常推送檔案
)

echo ================================

echo.
echo 步驟4: 檢查分支資訊...
echo ================================
echo 本地分支：
git branch
echo.
echo 遠端分支：
git branch -r
echo ================================

echo.
echo ================================
echo 📋 認證狀態總結
echo ================================
echo.

git config --get user.name >nul 2>&1
if errorlevel 1 (
    echo ❌ Git 用戶資訊：未設定
    echo 建議：重新設定認證資訊
) else (
    echo ✅ Git 用戶資訊：已設定
)

git remote get-url origin >nul 2>&1
if errorlevel 1 (
    echo ❌ 遠端倉庫：未設定
    echo 建議：使用「初始化/連接 GitHub 倉庫」功能
) else (
    echo ✅ 遠端倉庫：已設定
)

git ls-remote origin >nul 2>&1
if errorlevel 1 (
    echo ❌ GitHub 連接：失敗
    echo 建議：檢查認證設定或使用 Personal Access Token
) else (
    echo ✅ GitHub 連接：正常
)

echo.
echo 💡 使用建議：
echo - 如果認證狀態有問題，請重新設定認證資訊
echo - 如果所有狀態都正常，可以直接使用其他功能
echo - 遇到推送問題時，可以嘗試「修復 Git 問題」功能

echo.
pause
goto start

:reset_tool
echo.
echo ================================
echo 🔄 重置工具 (清除所有設定)
echo ================================
echo.

echo ⚠️  警告：這將清除所有 Git 設定和倉庫連結！
echo.
echo 重置後的效果：
echo - 刪除 .git 資料夾（清除所有 Git 歷史）
echo - 清除所有遠端倉庫連結
echo - 清除所有 Git 用戶設定
echo - 工具回到初始狀態
echo - 本地檔案不會被刪除
echo.

set /p confirm=確定要重置工具嗎？(y/n): 

if /i not "%confirm%"=="y" (
    echo 操作已取消
    pause
    goto start
)

echo.
echo 正在執行重置操作...
echo.

echo 步驟1: 檢查當前 Git 狀態...
if exist ".git" (
    echo ✅ 發現 .git 資料夾
    echo 當前遠端倉庫：
    git remote -v 2>nul
    echo.
    echo 當前分支：
    git branch 2>nul
    echo.
) else (
    echo ℹ️  沒有發現 .git 資料夾
)

echo 步驟2: 備份重要檔案...
if not exist "backup_before_reset" mkdir backup_before_reset
copy index.html backup_before_reset\ 2>nul
copy style.css backup_before_reset\ 2>nul
copy script.js backup_before_reset\ 2>nul
copy "通用github管理工具.bat" backup_before_reset\ 2>nul
copy *.txt backup_before_reset\ 2>nul
copy *.md backup_before_reset\ 2>nul
echo ✅ 重要檔案已備份到 backup_before_reset 資料夾

echo.
echo 步驟3: 刪除 .git 資料夾...
if exist ".git" (
    rmdir /s /q ".git" 2>nul
    if exist ".git" (
        echo ❌ 無法刪除 .git 資料夾
        echo 請手動刪除 .git 資料夾後重新執行
        pause
        goto start
    ) else (
        echo ✅ .git 資料夾已刪除
    )
) else (
    echo ℹ️  沒有 .git 資料夾需要刪除
)

echo.
echo 步驟4: 清除 Git 全域設定...
git config --global --unset user.name 2>nul
git config --global --unset user.email 2>nul
git config --global --unset credential.helper 2>nul
echo ✅ Git 全域設定已清除

echo.
echo 步驟5: 清除本地 Git 設定...
git config --local --unset user.name 2>nul
git config --local --unset user.email 2>nul
git config --local --unset credential.helper 2>nul
echo ✅ 本地 Git 設定已清除

echo.
echo 步驟6: 驗證重置結果...
if exist ".git" (
    echo ❌ .git 資料夾仍然存在
) else (
    echo ✅ .git 資料夾已完全清除
)

echo.
echo 檢查遠端倉庫設定...
git remote -v 2>nul
if errorlevel 1 (
    echo ✅ 沒有遠端倉庫設定
) else (
    echo ⚠️  仍有遠端倉庫設定
)

echo.
echo ================================
echo 🎉 工具重置完成！
echo ================================
echo.
echo 重置結果：
echo - Git 倉庫：已清除
echo - 遠端連結：已清除
echo - 用戶設定：已清除
echo - 本地檔案：已保留
echo - 備份位置：backup_before_reset 資料夾
echo.
echo 現在工具已回到初始狀態
echo 可以使用「初始化/連接 GitHub 倉庫」功能重新設定
echo.

pause
goto start

:exit
echo.
echo ================================
echo 👋 感謝使用AI指令大全網站管理工具！
echo ================================
echo.
echo 您的網站地址：
for /f "tokens=*" %%i in ('git remote get-url origin 2^>nul') do set current_repo=%%i
if defined current_repo (
    echo %current_repo:~0,-4%.github.io/%current_repo:~19%
) else (
    echo 無法取得倉庫資訊
)
echo.
pause
exit