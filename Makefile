BUILD_ORG   := talkincode
BUILD_VERSION   := latest
BUILD_TIME      := $(shell date "+%F %T")
BUILD_NAME      := gptedge
RELEASE_VERSION := v1.0.1
SOURCE          := main.go
RELEASE_DIR     := ./release
COMMIT_SHA1     := $(shell git show -s --format=%H )
COMMIT_DATE     := $(shell git show -s --format=%cD )
COMMIT_USER     := $(shell git show -s --format=%ce )
COMMIT_SUBJECT     := $(shell git show -s --format=%s )

buildpre:
	echo "BuildVersion=${BUILD_VERSION} ${RELEASE_VERSION} ${BUILD_TIME}" > assets/buildinfo.txt
	echo "ReleaseVersion=${RELEASE_VERSION}" >> assets/buildinfo.txt
	echo "BuildTime=${BUILD_TIME}" >> assets/buildinfo.txt
	echo "BuildName=${BUILD_NAME}" >> assets/buildinfo.txt
	echo "CommitID=${COMMIT_SHA1}" >> assets/buildinfo.txt
	echo "CommitDate=${COMMIT_DATE}" >> assets/buildinfo.txt
	echo "CommitUser=${COMMIT_USER}" >> assets/buildinfo.txt
	echo "CommitSubject=${COMMIT_SUBJECT}" >> assets/buildinfo.txt

fastpub:
	docker buildx build --platform=linux/amd64 --build-arg BTIME="$(date "+%F %T")" -t ${BUILD_NAME} .
	docker tag ${BUILD_NAME} ${BUILD_ORG}/${BUILD_NAME}:latest
	docker push ${BUILD_ORG}/${BUILD_NAME}:latest


build:
	test -d ${RELEASE_DIR} || mkdir -p ${RELEASE_DIR}
	CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -a -ldflags  '-s -w -extldflags "-static"'  -o ${RELEASE_DIR}/${BUILD_NAME} main.go
	upx ${RELEASE_DIR}/${BUILD_NAME}


syncdev:
	make buildpre
	@read -p "提示:同步操作尽量在完成一个完整功能特性后进行，请输入提交描述 (develop):  " cimsg; \
	git commit -am "$(date "+%F %T") : $${cimsg}"
	# 切换主分支并更新
	git checkout main
	git pull origin main
	# 切换开发分支变基合并提交
	git checkout develop
	git rebase -i main
	# 切换回主分支并合并开发者分支，推送主分支到远程，方便其他开发者合并
	git checkout main
	git merge --no-ff develop
	git push origin main
	# 切换回自己的开发分支继续工作
	git checkout develop


.PHONY: clean build tr069crt radseccrt


