#!/bin/bash
FILES=docs/*.pdf
for f in $FILES
do
  echo "Processing $f..."
  pdf2txt.py $f -o $f.txt
done
