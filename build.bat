cd fileservice
set GOOS=linux
go build -o build/fileservice fileservice/cmd/app
cd ..

npx tsc -p ./backend/tsconfig.json