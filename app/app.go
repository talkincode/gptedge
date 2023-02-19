package app

import (
	"path"
	"time"
	_ "time/tzdata"

	"github.com/labstack/gommon/log"
	"github.com/talkincode/gptedge/common/zaplog"
	"github.com/talkincode/gptedge/config"
)

var app *Application

type Application struct {
	appConfig *config.AppConfig
}

func GApp() *Application {
	return app
}

func GConfig() *config.AppConfig {
	return app.appConfig
}

func InitGlobalApplication(cfg *config.AppConfig) {
	app = NewApplication(cfg)
	app.Init(cfg)
}

func NewApplication(appConfig *config.AppConfig) *Application {
	return &Application{appConfig: appConfig}
}

func (a *Application) Init(cfg *config.AppConfig) {
	loc, err := time.LoadLocation(cfg.Location)
	if err != nil {
		log.Error("timezone config error")
	} else {
		time.Local = loc
	}

	zaplog.InitGlobalLogger(zaplog.LogConfig{
		Mode:           zaplog.Dev,
		ConsoleEnable:  true,
		LokiEnable:     false,
		FileEnable:     true,
		Filename:       path.Join(cfg.Workdir, "logs/gptedge.log"),
		MetricsHistory: 24 * 7,
		MetricsStorage: path.Join(cfg.Workdir, "data/metrics"),
	})
}

func Release() {
	zaplog.Release()
}
