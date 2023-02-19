package config

import (
	"os"
	"path"
	"strconv"

	"github.com/talkincode/gptedge/common"
	"gopkg.in/yaml.v3"
)

type AppConfig struct {
	Appid    string `yaml:"appid"`
	Location string `yaml:"location"`
	Workdir  string `yaml:"workdir"`
	GptToken string `yaml:"gpt_token"`
	Host     string `yaml:"host"`
	Port     int    `yaml:"port"`
	Secret   string `yaml:"secret"`
	Debug    bool   `yaml:"debug"`
}

func (c *AppConfig) GetLogDir() string {
	return path.Join(c.Workdir, "logs")
}

func (c *AppConfig) GetDataDir() string {
	return path.Join(c.Workdir, "data")
}

func (c *AppConfig) InitDirs() {
	os.MkdirAll(path.Join(c.Workdir, "logs"), 0644)
	os.MkdirAll(path.Join(c.Workdir, "data"), 0755)
}

func setEnvValue(name string, val *string) {
	var evalue = os.Getenv(name)
	if evalue != "" {
		*val = evalue
	}
}

func setEnvBoolValue(name string, val *bool) {
	var evalue = os.Getenv(name)
	if evalue != "" {
		*val = evalue == "true" || evalue == "1" || evalue == "on"
	}
}

func setEnvInt64Value(name string, val *int64) {
	var evalue = os.Getenv(name)
	if evalue == "" {
		return
	}

	p, err := strconv.ParseInt(evalue, 10, 64)
	if err == nil {
		*val = p
	}
}
func setEnvIntValue(name string, val *int) {
	var evalue = os.Getenv(name)
	if evalue == "" {
		return
	}

	p, err := strconv.ParseInt(evalue, 10, 64)
	if err == nil {
		*val = int(p)
	}
}

var DefaultAppConfig = &AppConfig{
	Appid:    "gptedge",
	Location: "Asia/Shanghai",
	Workdir:  "/var/gptedge",
	Debug:    true,
	Host:     "0.0.0.0",
	Port:     8808,
	Secret:   "9b6de5cc-0001-1311-1100-0f568ac7da37",
}

func LoadConfig(cfile string) *AppConfig {
	// 开发环境首先查找当前目录是否存在自定义配置文件
	if cfile == "" {
		cfile = "gptedge.yml"
	}
	if !common.FileExists(cfile) {
		cfile = "/etc/gptedge.yml"
	}
	cfg := new(AppConfig)
	if common.FileExists(cfile) {
		data := common.Must2(os.ReadFile(cfile))
		common.Must(yaml.Unmarshal(data.([]byte), cfg))
	} else {
		cfg = DefaultAppConfig
	}

	cfg.InitDirs()

	setEnvValue("GPTEDGE_SYSTEM_WORKER_DIR", &cfg.Workdir)
	setEnvBoolValue("GPTEDGE_SYSTEM_DEBUG", &cfg.Debug)
	setEnvValue("GPTEDGE_CHATGPT_TOKEN", &cfg.GptToken)

	// WEB
	setEnvValue("GPTEDGE_WEB_HOST", &cfg.Host)
	setEnvValue("GPTEDGE_WEB_SECRET", &cfg.Secret)
	setEnvIntValue("GPTEDGE_WEB_PORT", &cfg.Port)

	return cfg
}
