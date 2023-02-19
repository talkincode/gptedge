package installer

import (
	"os"
	"os/exec"
	"path/filepath"
	"strings"

	"github.com/talkincode/gptedge/common"
	"github.com/talkincode/gptedge/config"
	"gopkg.in/yaml.v3"
)

var installScript = `#!/bin/bash -x
mkdir -p /var/gptedge
chmod -R 755 /var/gptedge
install -m 755 {{binfile}} /usr/local/bin/gptedge
test -d /usr/lib/systemd/system || mkdir -p /usr/lib/systemd/system
cat>/usr/lib/systemd/system/gptedge.service<<EOF
[Unit]
Description=gptedge
After=network.target
StartLimitIntervalSec=0

[Service]
Restart=always
RestartSec=1
Environment=GODEBUG=x509ignoreCN=0
LimitNOFILE=65535
LimitNPROC=65535
User=root
ExecStart=/usr/local/bin/gptedge

[Install]
WantedBy=multi-user.target
EOF

chmod 600 /usr/lib/systemd/system/gptedge.service
systemctl enable gptedge && systemctl daemon-reload
`

func InitConfig(config *config.AppConfig) error {
	// config.NBI.JwtSecret = common.UUID()
	cfgstr, err := yaml.Marshal(config)
	if err != nil {
		return err
	}
	return os.WriteFile("/etc/gptedge.yml", cfgstr, 0644)
}

func Install() error {
	if !common.FileExists("/etc/gptedge.yml") {
		_ = InitConfig(config.DefaultAppConfig)
	}
	// Get the absolute path of the currently executing file
	file, _ := exec.LookPath(os.Args[0])
	path, _ := filepath.Abs(file)
	dir := filepath.Dir(path)
	binfile := filepath.Join(dir, "gptedge")
	installScript = strings.ReplaceAll(installScript, "{{binfile}}", binfile)
	_ = os.WriteFile("/tmp/gptedge_install.sh", []byte(installScript), 0755)

	// 创建用户&组
	if err := exec.Command("/bin/bash", "/tmp/gptedge_install.sh").Run(); err != nil {
		return err
	}

	return os.Remove("/tmp/gptedge_install.sh")
}

func Uninstall() {
	_ = os.Remove("/usr/lib/systemd/system/gptedge.service")
	_ = os.Remove("/usr/local/bin/gptedge")
}
