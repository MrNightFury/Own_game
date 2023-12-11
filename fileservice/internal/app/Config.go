package app

import "os"

type Config struct {
	databaseURL    string
	databasePort   string
	statisticsLink string
}

func LoadConfig() Config {
	var (
		databaseURL   = os.Getenv("DATABASE_URL")
		port          = os.Getenv("APP_PORT")
		statisticsURL = os.Getenv("STATISTICS_HOSTNAME") + ":" + os.Getenv("STATISTICS_PORT")
	)
	if databaseURL == "" {
		databaseURL = "localhost"
	}
	if port == "" {
		port = "80"
	}
	return Config{
		databaseURL:    "mongodb://" + databaseURL,
		databasePort:   port,
		statisticsLink: "http://" + statisticsURL + "/stats/post",
	}
}
