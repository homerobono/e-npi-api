#!/bin/bash

if [[ "$#" -eq "0" || ("$1" != "backup" && "$1" != 'restore') ]]; then
    echo "Specify a command: [dump|restore]"
    exit 1
fi

if [ "$1" == "backup" ]; then
    echo "Backing up e-npi mongodb database and files"
    now=$(date +%d-%m-%Y_%H:%M:%S)
    echo $now
    echo mongodump --db e-npi --out "$now"
    #mkdir $now


else if [ "$1" == 'restoring' ]; then
        echo "Restoring e-npi mongodb database and files"
    fi
fi

echo 'Done.'