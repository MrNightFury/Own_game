cd fileservice
set GOOS=linux
go build -o build/app fileservice/cmd/app
cd ..

npm i
npx tsc -p ./backend/tsconfig.json
paste -s ./backend/static/less/*.less | lessc - > ./backend/static/css/project.css