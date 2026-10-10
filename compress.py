#!/usr/bin/env python

import gzip
import glob
import re

def ShrinkJSON(content):
    def numberRepl(m):
        num = float(m.group(0))
        num = '{:.2f}'.format(num)
        num = re.sub('[.]?0+$', '', num)
        return num
        
    content = re.sub('[+-]?[0-9]*[.][0-9]+([eE][+-]?[0-9]+)?', numberRepl, content)
    content = re.sub('\s', '', content)
    return content

for filename in glob.glob('models/*.json'):
    with open(filename, 'r') as f:
        content = f.read()
        if len(str(content)) < 500:
            continue

        print('Compressing ' + filename + '...') 
        content = ShrinkJSON(content)

        with gzip.open(filename + '.gz', 'wt') as w:
            w.write(content)
            w.close()
