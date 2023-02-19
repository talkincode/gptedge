package chatserver

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/labstack/echo/v4"
	gogpt "github.com/sashabaranov/go-gpt3"
	"github.com/talkincode/gptedge/app"
	"github.com/talkincode/gptedge/common"
	"github.com/talkincode/gptedge/common/zaplog/log"
	"golang.org/x/net/websocket"
)

type WsMessage struct {
	Status string `json:"status"`
	Reqid  string `json:"reqid"`
	Respid string `json:"respid"`
	Data   string `json:"data"`
	Time   int64  `json:"time"`
}

func (s *ChatServer) initRouter() {
	s.root.Add(http.MethodGet, "/", s.chatIndex)
	s.root.Add(http.MethodGet, "/chat", s.chatIndex)
	s.root.Add(http.MethodGet, "/wschat", s.chatSession)
}

func (s *ChatServer) chatIndex(c echo.Context) error {
	return c.Render(http.StatusOK, "chat", map[string]string{})
}

func (s *ChatServer) chatSession(c echo.Context) error {
	websocket.Handler(func(ws *websocket.Conn) {
		c := gogpt.NewClient(app.GConfig().GptToken)
		ctx := context.Background()
		defer ws.Close()
		for {
			// Read
			msg := ""
			err := websocket.Message.Receive(ws, &msg)
			if err != nil {
				if err == io.EOF {
					return
				}
				log.Errorf("Receive error: %v\n", err)
				onErrorDone(ws, err)
				continue
			}

			var wsreq WsMessage
			err = json.Unmarshal([]byte(msg), &wsreq)
			if err != nil {
				onErrorDone(ws, err)
				continue
			}

			// onStartResponse(ws, wsreq)

			requestStream(c, ctx, wsreq.Data, func(rmsg string) {
				onResponse(ws, wsreq, rmsg)
			})

			onSuccDone(ws, wsreq)

		}
	}).ServeHTTP(c.Response(), c.Request())
	return nil
}

func onErrorDone(ws *websocket.Conn, err error) {
	_ = websocket.Message.Send(ws, common.ToJson(&WsMessage{
		Status: "done",
		Reqid:  "0",
		Respid: "0",
		Data:   fmt.Sprintf("Receive error: %v", err),
		Time:   time.Now().UnixMilli(),
	}))
}

func onSuccDone(ws *websocket.Conn, wsreq WsMessage) {
	_ = websocket.Message.Send(ws, common.ToJson(&WsMessage{
		Status: "done",
		Reqid:  wsreq.Reqid,
		Respid: wsreq.Respid,
		Data:   "",
		Time:   time.Now().UnixMilli(),
	}))
}

func onStartResponse(ws *websocket.Conn, wsreq WsMessage) {
	err := websocket.Message.Send(ws, common.ToJson(&WsMessage{
		Status: "start",
		Reqid:  wsreq.Reqid,
		Respid: wsreq.Respid,
		Data:   "",
		Time:   time.Now().UnixMilli(),
	}))
	if err != nil {
		log.Errorf("Send error: %v\n", err)
	}
}

func onResponse(ws *websocket.Conn, wsreq WsMessage, rmsg string) {
	err := websocket.Message.Send(ws, common.ToJson(&WsMessage{
		Status: "write",
		Reqid:  wsreq.Reqid,
		Respid: wsreq.Respid,
		Data:   rmsg,
		Time:   time.Now().UnixMilli(),
	}))
	if err != nil {
		log.Errorf("Send error: %v\n", err)
	}
}

func requestStream(c *gogpt.Client, ctx context.Context, prompt string, onMsg func(msg string)) {
	req := gogpt.CompletionRequest{
		Model:     gogpt.GPT3TextDavinci003,
		MaxTokens: 2000,
		Prompt:    prompt,
		Stream:    true,
	}
	stream, err := c.CreateCompletionStream(ctx, req)
	if err != nil {
		return
	}
	defer stream.Close()

	for {
		response, err := stream.Recv()
		if errors.Is(err, io.EOF) {
			log.Error("Stream finished")
			return
		}

		if err != nil {
			log.Errorf("Stream error: %v\n", err)
			return
		}

		if len(response.Choices) > 0 {
			msg := response.Choices[0].Text
			// log.Infof("Stream response: %s\n", msg)
			onMsg(msg)
		}
	}
}
