import os
import sys
import json
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

if os.path.dirname(sys.argv[0]) != '':
    os.chdir(os.path.dirname(sys.argv[0]))


driver = None


def start_up():
    global driver
    chrome_options = Options()
    chrome_options.add_argument('load-extension=../')
    print 'Opening a Chrome browser'
    driver = webdriver.Chrome(chrome_options=chrome_options)
    time.sleep(1)


def clean_up():
    global driver
    time.sleep(1)
    if driver is not None:
        print 'Closing the Chrome browser'
        driver.quit()
        driver = None


def run_tests():
    num_fails = 0

    print 'Testing ipservice.163.com...',
    driver.get('http://ipservice.163.com/isFromMainland')
    flag = driver.find_elements_by_tag_name('pre').pop().text
    if flag != u'true':
        print 'Failed! Return value is not true'
        num_fails += 1
    else:
        print 'OK'

    time.sleep(1)
    print 'Testing httpbin.org...',
    driver.get('http://httpbin.org/ip')
    ip_json = driver.find_elements_by_tag_name('pre').pop().text
    ip = json.loads(ip_json)['origin']
    time.sleep(1)
    driver.get('http://www.geoplugin.net/json.gp?ip=' + ip)
    geo_json = driver.find_elements_by_tag_name('pre').pop().text
    country_code = json.loads(geo_json)['geoplugin_countryCode']
    if country_code == 'CN':
        print 'Failed! Access to httpbin.org should not be through proxies'
        num_fails += 1
    elif country_code == '':
        print 'Unknown. Country code is unavailable'
    else:
        print 'OK'

    return num_fails


def main():
    try:
        start_up()
        num_failures = run_tests()
        if num_failures == 0:
            print 'All tests passed'
        else:
            print 'ATTENTION: %d test(s) failed' % num_failures
        clean_up()
        return num_failures
    except Exception as err:
        print 'Got exception:', err
        clean_up()
        return -1


if __name__ == '__main__':
    sys.exit(main())
