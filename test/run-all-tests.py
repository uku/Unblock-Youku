#!/usr/bin/env python

"""
    Allow you smoothly surf on many websites blocking non-mainland visitors.
    Copyright (C) 2012, 2013 Bo Zhu http://zhuzhu.org

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
"""

import subprocess
import time
import sys
import os

# http://goo.gl/2wtRL
# os.chdir(os.path.dirname(sys.argv[0]))
if os.path.dirname(sys.argv[0]) != '':
    os.chdir(os.path.dirname(sys.argv[0]))

print 'PhantomJS',
try:
    version = subprocess.check_output(['phantomjs', '--version'])
    print version
    sys.stdout.flush()
except Exception as exp:
    print 'is not installed.'
    print 'Please install it and try again.'
    sys.stdout.flush()
    sys.exit(-1)


server_process = None


def start_server():
    global server_process
    print 'To start the server, and wait for 21 seconds to set up...'
    sys.stdout.flush()
    server_process = subprocess.Popen(
        ['node', '../server/server.js', '--production', '--port=8888'])
    time.sleep(21)


def stop_server():
    time.sleep(1)
    print 'To stop the server...',
    sys.stdout.flush()
    server_process.terminate()
    server_process.wait()
    print 'done.'
    sys.stdout.flush()


# http://goo.gl/xaBer
def red_alert(text):
    print "\033[7;31m" + text + "\033[0m"
    sys.stdout.flush()


def run_all_tests():
    print
    print 'To run all test-*.js files...'
    sys.stdout.flush()
    num_failed = 0
    num_passed = 0
    for file_name in os.listdir('.'):
        if file_name.startswith('test-') and file_name.endswith('.js'):
            if file_name.endswith('-proxy.js'):
                command = ['phantomjs', '--proxy=127.0.0.1:8888', file_name]
            else:
                command = ['phantomjs', file_name]
            print
            print ' '.join(command)
            sys.stdout.flush()
            return_value = subprocess.call(command)
            time.sleep(2)  # sleep 2 seconds between tests
            if return_value != 0:
                num_failed += 1
                red_alert(file_name + ' FAILED!')
            else:
                num_passed += 1
                print file_name + ' passed.'
                sys.stdout.flush()
    print
    sys.stdout.flush()
    if num_failed > 0:
        red_alert('Final results: ' + str(num_failed) + ' TESTS FAILED'
                  + ' (out of ' + str(num_failed + num_passed) + ')')
    else:
        print 'All %d tests passed.' % (num_passed + num_failed)
    print
    sys.stdout.flush()
    return num_failed


if __name__ == '__main__':
    exit_code = -1
    try:
        start_server()
        exit_code = run_all_tests()
    finally:
        stop_server()
    sys.exit(exit_code)
