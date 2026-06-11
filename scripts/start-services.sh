#!/bin/bash

brew services list | grep 'mongodb-community@7.*started' >/dev/null || brew services start mongodb-community@7
brew services list | grep 'postgresql@14.*started' >/dev/null || brew services start postgresql@14
brew services list | grep 'redis.*started' >/dev/null || brew services start redis