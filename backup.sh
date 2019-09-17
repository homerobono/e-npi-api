#!/bin/bash

if [[ "$#" -eq "0" || ("$1" != "backup" && "$1" != 'restore') ]]; then
    echo "Specify a command: [backup|restore]"
    exit 1
fi

if [ "$1" == "backup" ]; then
    echo "Backing up e-npi mongodb database and files"
    now=$(date +%d-%m-%Y_%H:%M:%S)
    echo $now
    echo mongodump --db e-npi --out "mongo-enpi-backup/$now"
    mongodump --db e-npi --out "mongo-enpi-backup/$now"
    #mkdir $now


else if [ "$1" == 'restoring' ]; then
        echo "Restoring e-npi mongodb database and files (just kidding)"
    fi
fi

echo 'Done.'