FROM golang:1.20.0-buster AS builder

COPY . /src
WORKDIR /src

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -a -ldflags \
     '-s -w -extldflags "-static"'  -o /gptedge main.go

FROM alpine:3.17

COPY --from=builder /gptedge /usr/local/bin/gptedge

RUN chmod +x /usr/local/bin/gptedge

EXPOSE 8808

ENTRYPOINT ["/usr/local/bin/gptedge"]