package app

import (
	"strings"
	"time"

	"github.com/ca17/teamsacs/assets"
)

func (a *Application) GetTemplateFuncMap() map[string]interface{} {
	return map[string]interface{}{
		"pagever": func() int64 {
			if a.appConfig.Debug {
				return time.Now().Unix()
			} else {
				return int64(time.Now().Hour())
			}
		},
		"buildver": func() string {
			bv := strings.TrimSpace(assets.BuildVersion())
			if bv != "" {
				return bv
			}
			return "develop-" + time.Now().Format(time.RFC3339)
		},
		"getSystemTitle": func() string {
			return a.appConfig.Appid
		},
	}
}
