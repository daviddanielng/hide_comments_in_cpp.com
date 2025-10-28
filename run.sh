#!/bin/bash

if [ "$1" = "--delete-orphans" ] || [ "$2" = "--delete-orphans" ]; then
    rm -rf ./output/*
fi

mkdir -p ./output
current_date=$(date +"%Y-%m-%d_%H-%M-%S")
archive_name="archive_$current_date"

if [ "$1" = "self" ] || [ "$2" = "self" ]; then
    tar -cJf ./output/$archive_name.tar.xz --transform="s,^\./,$archive_name/," ./
else
    tar -cJf ./output/$archive_name.tar.xz ./
fi
