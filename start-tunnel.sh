#!/bin/bash

# OmniTip Ngrok Tunnel Starter
# This script starts ngrok and displays the webhook URL for Meta configuration

echo "🚀 Starting ngrok tunnel for OmniTip..."
echo ""
echo "📋 Make sure your dev server is running:"
echo "   bun run dev"
echo ""
echo "⏳ Starting ngrok on port 3000..."
echo ""

./ngrok http 3000
