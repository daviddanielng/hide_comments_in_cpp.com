#!/bin/bash

# Parse arguments
delete_orphans=false
use_self=false
custom_name=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --delete-orphans)
            delete_orphans=true
            shift
            ;;
        --self)
            use_self=true
            shift
            ;;
        --to)
            custom_name="$2"
            shift 2
            ;;
        *)
            shift
            ;;
    esac
done

if [ "$delete_orphans" = true ]; then
    rm -rf ./output/*
fi

mkdir -p ./output
current_date=$(date +"%Y-%m-%d_%H-%M-%S")

if [ -n "$custom_name" ]; then
    archive_name="$custom_name"
else
    archive_name="archive_$current_date"
fi

if [ "$use_self" = true ]; then
    tar -cJf ./output/$archive_name.tar.xz --transform="s,^\./,$archive_name/," --exclude='./output' --exclude-vcs ./
else
    tar -cJf ./output/$archive_name.tar.xz --exclude='./output' --exclude-vcs ./
fi
