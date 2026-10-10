#! /usr/bin/env python

import sys
import csv
import json


def main():
    if len(sys.argv) > 1:
        in_file = sys.argv[1][:]
    else:
        sys.exit(-1)

    with open(in_file, 'r') as f:
        r = csv.reader(f)
        lines = list(r)

    d = []
    for p in lines:
        d.append({"x": float(p[0]), "y": float(p[1])})

    json_str = json.dumps(d)
    print(json_str)


if __name__ == "__main__":
    main()
