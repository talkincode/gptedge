package main

import (
	"flag"
	"fmt"
	"os"
	"runtime"
	_ "time/tzdata"

	"github.com/ca17/teamsacs/installer"
	"github.com/talkincode/gptedge/app"
	"github.com/talkincode/gptedge/assets"
	"github.com/talkincode/gptedge/chatserver"
	"github.com/talkincode/gptedge/common/zaplog/log"
	"github.com/talkincode/gptedge/config"
	"golang.org/x/sync/errgroup"
)

var (
	g errgroup.Group
)

// 命令行定义
var (
	h         = flag.Bool("h", false, "help usage")
	showVer   = flag.Bool("v", false, "show version")
	conffile  = flag.String("c", "", "config yaml file")
	install   = flag.Bool("install", false, "run install")
	uninstall = flag.Bool("uninstall", false, "run uninstall")
)

// PrintVersion Print version information
func PrintVersion() {
	fmt.Printf(assets.BuildInfo)
}

func printHelp() {
	if *h {
		ustr := fmt.Sprintf("version: %s, Usage:%s -h\nOptions:", assets.BuildVersion(), os.Args[0])
		_, _ = fmt.Fprintf(os.Stderr, ustr)
		flag.PrintDefaults()
		os.Exit(0)
	}
}

func main() {
	runtime.GOMAXPROCS(runtime.NumCPU())
	flag.Parse()

	if *showVer {
		PrintVersion()
		os.Exit(0)
	}

	printHelp()

	_config := config.LoadConfig(*conffile)

	// Install as a system service
	if *install {
		err := installer.Install()
		if err != nil {
			log.Error(err)
		}
		return
	}

	if *uninstall {
		installer.Uninstall()
		return
	}

	app.InitGlobalApplication(_config)
	defer app.Release()

	g.Go(func() error {
		return chatserver.Listen()
	})

	if err := g.Wait(); err != nil {
		log.Fatal(err)
	}
}
