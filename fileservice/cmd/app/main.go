package main

import (
	"fileservice/internal/app"
	"os"
)

func main() {
	var config = app.LoadConfig()
	var application, err = app.NewApplication(config)
	if err != nil {
		os.Exit(1)
	}
	application.SetupRoutes()
}
