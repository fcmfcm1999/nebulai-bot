#!/bin/bash

NEBULAI_DIR="./nebulai-bot"
LOG_FILE="./nebulai.log"
ENV_FILE="./.env"
PM2_NAME="nebulai-bot"
DEFAULT_INVITE="7BPKiD"

clone_repo_if_needed() {
  if [ ! -d "$NEBULAI_DIR" ]; then
    echo "📥 克隆 nebulai-bot 项目..."
    git clone https://github.com/fcmfcm1999/nebulai-bot.git "$NEBULAI_DIR" || { echo "❌ 克隆失败"; exit 1; }
  else
    echo "📁 项目已存在，跳过克隆"
  fi
}

login_and_write_token() {
  if [ -f "$ENV_FILE" ]; then
    EXISTING_TOKEN=$(grep "^TOKEN=" "$ENV_FILE" | cut -d '=' -f2-)
    if [ -n "$EXISTING_TOKEN" ]; then
      echo "🔐 检测到已有 Token，跳过登录步骤"
      return
    fi
  fi
  ## seed email need to pass cloudflare
  # echo "请输入你的邮箱："
  # read EMAIL
  #
  # echo "📨 正在发送验证码到 $EMAIL ..."
  # curl -s 'https://nebulai.network/api/front/login/email' \
  #   -H 'accept: application/json, text/plain, */*' \
  #   -H 'content-type: application/json' \
  #   --data-raw "{\"email\":\"$EMAIL\"}" > /dev/null
  #
  # echo "请输入你收到的验证码："
  # read CODE
  #
  # echo "✅ 正在验证验证码..."
  # LOGIN_RESPONSE=$(curl -s 'https://nebulai.network/api/front/login/auth_email' \
  #   -H 'accept: application/json, text/plain, */*' \
  #   -H 'content-type: application/json' \
  #   --data-raw "{\"email\":\"$EMAIL\",\"auth_code\":\"$CODE\"}")
  #
  # TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d':' -f2 | tr -d '"')
  #
  # if [ -z "$TOKEN" ]; then
  #   echo "❌ 登录失败，请检查验证码或邮箱"
  #   exit 1
  # fi
  echo "请输入你的token(打开浏览器，在nebulai页面，登录后打开控制台输入: localStorage.getItem('loginToken'); 来获取)"
  read TOKEN
  TOKEN=$(echo "$TOKEN" | sed "s/^['\"]//;s/['\"]$//")

  echo "获取 jwtToken..."
  JWT_RES=$(curl -s -X POST https://nebulai.network/open_compute/login/token \
    -H "accept: application/json" \
    -H "authorization: Bearer $TOKEN" \
    -H "content-type: application/json" \
    -d '{}')

  JWT_TOKEN=$(echo "$JWT_RES" | grep -o '"jwt":"[^"]*' | cut -d '"' -f4)

  if [ -z "$JWT_TOKEN" ]; then
    echo "jwtToken 获取失败。退出。"
    exit 1
  fi

  echo "TOKEN=$TOKEN" > "$ENV_FILE"
  echo "JWT_TOKEN=$JWT_TOKEN" >> "$ENV_FILE"
  echo "EMAIL=$EMAIL" >> "$ENV_FILE"
  echo "登录成功，已写入 .env 文件。"
}

print_author_info() {
  echo "=========================="
  echo " 作者: 0x范特西"
  echo " Twitter / X: @0Xiaofan22921"
  echo " "
  echo " 更多脚本分享欢迎关注我的推特~"
  echo "=========================="
}

ensure_pm2_installed() {
  if ! command -v pm2 &> /dev/null; then
    echo "🔧 未检测到 pm2，正在安装..."
    npm install -g pm2 || { echo "❌ pm2 安装失败，请检查 Node.js 和 npm 是否已安装"; exit 1; }
  else
    echo "✅ pm2 已安装"
  fi
}

submit_invite_code() {
  if [ -f "$ENV_FILE" ]; then
    TOKEN=$(grep "^TOKEN=" "$ENV_FILE" | cut -d '=' -f2)
    JWT_TOKEN=$(grep "^JWT_TOKEN=" "$ENV_FILE" | cut -d '=' -f2)
  fi

  if [ -z "$JWT_TOKEN" ]; then
    echo "找不到 JWT_TOKEN，无法提交邀请码。"
    return
  fi

  echo "请输入邀请码（默认：$DEFAULT_INVITE）:"
  read -r INVITE
  INVITE=${INVITE:-$DEFAULT_INVITE}

  curl -s -X POST https://nebulai.network/open_compute/set/invite_by \
    -H "Content-Type: application/json" \
    -H "authorization: Bearer $TOKEN" \
    -H "token: $JWT_TOKEN" \
    -d "{\"invite_by\":\"$INVITE\"}" > /dev/null

  echo "邀请码已提交：$INVITE"
}

print_author_info

echo "请选择操作："
echo "1. 安装并运行 nebulai-bot"
echo "2. 查看日志"
echo "3. 停止运行 nebulai-bot"
echo "4. 删除 nebulai-bot"
read -p "输入选项 (1-4): " choice

case $choice in
  1)
    ensure_pm2_installed
    clone_repo_if_needed
    cd "$NEBULAI_DIR" || exit
    login_and_write_token
    submit_invite_code
    npm install
    echo "🚀 正在启动 nebulai..."
    pm2 start "node src/index.js" --name "$PM2_NAME" --log "$LOG_FILE"
    ;;

  2)
    echo "📄 显示日志 (Ctrl+C 退出)"
    pm2 logs "$PM2_NAME"
    ;;

  3)
    echo "🛑 停止运行 nebulai..."
    pm2 stop "$PM2_NAME"
    ;;

  4)
    echo "⚠️ 将删除整个 $NEBULAI_DIR 文件夹及其记录"
    read -p "确认删除？(y/n): " confirm
    if [ "$confirm" == "y" ]; then
      pm2 delete "$PM2_NAME"
      rm -rf "$NEBULAI_DIR"
      echo "✅ 删除完成"
    else
      echo "❎ 已取消删除"
    fi
    ;;

  *)
    echo "❌ 无效选项"
    ;;
esac

