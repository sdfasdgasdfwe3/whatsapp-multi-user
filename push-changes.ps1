Write-Host "Checking git status..." -ForegroundColor Green
git status

Write-Host "Adding all files..." -ForegroundColor Green
git add .

Write-Host "Committing changes..." -ForegroundColor Green
git commit -m "Add debug tools for login issue"

Write-Host "Pushing to server..." -ForegroundColor Green
git push

Write-Host "Done!" -ForegroundColor Green
Read-Host "Press Enter to continue" 