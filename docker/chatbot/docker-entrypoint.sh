#!/bin/sh
if [ "$#" -gt 0 ]; then
  # Got started with arguments
  exec chatbot "$@"
else
  # Got started without arguments
  exec chatbot
fi
