package chatserver

import (
	"fmt"
	"net/http"
	"os"

	"github.com/ca17/teamsacs/common/tpl"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	elog "github.com/labstack/gommon/log"
	"github.com/talkincode/gptedge/app"
	"github.com/talkincode/gptedge/assets"
	"github.com/talkincode/gptedge/common/zaplog"
	"github.com/talkincode/gptedge/common/zaplog/log"
	"go.uber.org/zap"
)

var server *ChatServer

type ChatServer struct {
	root *echo.Echo
}

func Listen() error {
	server = NewChatServer()
	server.initRouter()
	return server.Start()
}

func NewChatServer() *ChatServer {
	s := new(ChatServer)
	s.root = echo.New()
	s.root.Pre(middleware.RemoveTrailingSlash())
	s.root.Use(func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			defer func() {
				if r := recover(); r != nil {
					err, ok := r.(error)
					if !ok {
						err = fmt.Errorf("%v", r)
					}
					c.Error(echo.NewHTTPError(http.StatusInternalServerError, err.Error()))
				}
			}()
			return next(c)
		}
	})
	s.root.Use(middleware.LoggerWithConfig(middleware.LoggerConfig{
		Format: "freeradius ${time_rfc3339} ${remote_ip} ${method} ${uri} ${protocol} ${status} ${id} ${user_agent} ${latency} ${bytes_in} ${bytes_out} ${error}\n",
		Output: os.Stdout,
	}))
	// 静态目录映射
	s.root.GET("/static/*", echo.WrapHandler(http.FileServer(http.FS(assets.StaticFs))))
	// 模板加载
	s.root.Renderer = tpl.NewCommonTemplate(assets.TemplatesFs, []string{"templates"}, app.GApp().GetTemplateFuncMap())
	s.root.HideBanner = true
	s.root.Logger.SetOutput(zap.NewStdLog(zap.L()).Writer())
	s.root.Logger.SetLevel(elog.INFO)
	s.root.Debug = zaplog.Config().Mode == zaplog.Dev
	return s
}

// Start 启动服务器
func (s *ChatServer) Start() error {
	zap.S().Infof("Starting ChatServer API server %s:%d")
	err := s.root.Start(fmt.Sprintf("%s:%d", app.GConfig().Host, app.GConfig().Port))
	if err != nil {
		log.Errorf("Starting ChatServer API server error %s", err.Error())
	}
	return err
}
