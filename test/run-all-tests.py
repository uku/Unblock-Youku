#!/usr/bin/env python

"""
    Allow you smoothly surf on many websites blocking non-mainland visitors.
    Copyright (C) 2012 - 2016  Bo Zhu  http://zhuzhu.org

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
    print 'To start the server, and wait for 3 seconds to set up...'
    sys.stdout.flush()
    test_env = os.environ.copy()
    test_env['PROXY_ADDR'] = 'https://secure.uku.im:993'
    test_env['BAK_PROXY_ADDR'] = 'http://proxy.uku.im:443'
    test_env['PAC_PROXY_ADDR'] = 'http://proxy.uku.im:443'
    server_process = subprocess.Popen(
        ['node', '../server/server.js'],
        env=test_env)
    time.sleep(3)

def wait_server_open(server, port, timeout):
    import socket
    import errno
    from time import time as now

    # ending time for time out
    end = now() + timeout

    while True:
        s = socket.socket()
        try:
            next_timeout = end - now() # check for timeout
            if next_timeout < 0:
                return False

            s.connect((server, port))
        except socket.error, err:
            # if connection failed, try again
            s.close()
            continue
        else:
            s.close()
            return True

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
        if (file_name.startswith('test-') or file_name.startswith('check-')) \
                and file_name.endswith('.js'):
            if (file_name.startswith('test-')):
                command = ['phantomjs', file_name]
            else:
                command = ['node', file_name]
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


def extra_checks():
    with open('../chrome/proxy.js', 'r') as f:
        for line in f:
            line = line.lower().strip()
            if ('proxy_server' in line and '127.0.0.1' in line) or \
                    ('proxy_server' in line and 'socks' in line):
                if not line.startswith('//'):
                    red_alert('The debug server is still in use!')
                    return False
    return True


def main():
    if not extra_checks():
        sys.exit(-2)

    exit_code = -1
    try:
        start_server()
        if (wait_server_open('127.0.0.1', 8888, 20)): # time out in 20s
            exit_code = run_all_tests()
        else:
            red_alert('Error open connection')
    finally:
        stop_server()
    sys.exit(exit_code)


if __name__ == '__main__':
    main()
