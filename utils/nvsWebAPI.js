const net = require('net');
const crypto = require('crypto');
const nvss = require('./nvs.json');
const _ = require('underscore');
var request = require('then-request');


/*
 * 和netvista cloudserver的 web api 接口（默认3012端口）通信
 */

function md5(str) {
    var hash = crypto.createHash('md5');
    hash.update(str);
    return hash.digest('hex').toUpperCase();
}

var conns = {};

//在netvistacloudserver的后台中没有找到heartbeat请求，这里模拟一个
function doHeartBeat(bcinfo){ 
    var req = request('POST', 'http://' + bcinfo.host + ':' + bcinfo.webport + '/getDataDetails', {
      json: {},
      headers: {
          'Cookie': 'nts-session-id=' + bcinfo.sid,
          'Content-Type': 'application/json'
      },
      socketTimeout: 3000,
      timeout: 3000
  });
  return req;
}


function doLogin(bcinfo) {
    var sid = bcinfo.sid;
    var authCode = md5(sid + '-' + md5('nts-' + bcinfo.password));
    var req = request('POST', 'http://' + bcinfo.host + ':' + bcinfo.webport + '/login', {
        json: {
            username: bcinfo.username,
            sessionId: sid,
            authCode: authCode,
            verifyCode: '',
            verifySMSVerifyCode: ''
        },
        socketTimeout: 3000,
        timeout: 3000
    });
    return req;
}


function doRequest(bcinfo, path, para, method = "GET") {
    if (method == 'GET') {
        var p = path + '?';
        for (var k in para) {
            p += k + '=' + para[k] + '&';
        }
    } else {
        var p = path;
    }
    var req = request('GET', 'http://' + bcinfo.host + ':' + bcinfo.webport + '/' + encodeURI(p), {
        json: para,
        headers: {
            'Cookie': 'nts-session-id=' + bcinfo.sid,
            'Content-Type': 'application/json'
        },
        socketTimeout: 3000,
        timeout: 3000
    })
    return req
}

function doRequest_bak(path, cb, scope, para, method) {
    var self = this;
    if (method == 'GET') {
        var p = path + '?';
        for (var k in para) {
            p += k + '=' + para[k] + '&';
        }
    } else {
        var p = path;
    }
    //login
    var sid = self.sid;
    var authCode = md5(sid + '-' + md5('nts-' + self.password));
    try {
        var res = request('POST', 'http://' + this.host + ':' + this.webport + '/login', {
            json: {
                username: self.username,
                sessionId: sid,
                authCode: authCode,
                verifyCode: '',
                verifySMSVerifyCode: ''
            },
            socketTimeout: 3000,
            timeout: 3000
        })
        var r = JSON.parse(res.getBody().toString());
        if (r.errorCode == 17) {
            cb.call(scope, '登录失败', 1)
            return
        }
        self.sid = r.sessionId;
        res = request('GET', 'http://' + this.host + ':' + this.webport + '/' + p, {
            json: para,
            headers: {
                'Cookie': 'nts-session-id=' + self.sid,
                'Content-Type': 'application/json'
            },
            socketTimeout: 3000,
            timeout: 3000
        })
        var r = JSON.parse(res.getBody().toString());
        cb.call(scope, r)
    } catch (error) {
        console.log(error)
    }
}

var api_get_maps = {
    getGroupList: 'getGroupList',
    getTestAlertList: 'getTestAlertList',
    getTestAlertLogList: 'getTestAlertLogList',
    getTestResultList: 'getDataDetails',
    getTopologyDetails: 'getTopologyNodeList'
}

function attachAPI(conn) {
    conn.doRequest = doRequest;
    _.each(api_get_maps, function (v, k) {
        conn[k] = function (cb, scope, para) {
            this.doRequest(v, cb, scope, para, 'GET');
        }
    });
}

function getConn(username, pwd, url, port, cb, scope) {
    if (!cb) return;
    var conn = {
        "host": url,
        "webport": port,
        "username": username,
        "password": pwd
    };
    conn.sid = Math.round(Math.random() * 100000000)
    attachAPI(conn);
    cb.call(scope, conn);
}

module.exports = {
    getConn,
    doRequest,
    doLogin,doHeartBeat
}

if (module === require.main) {
    var beginTime = Date.now() - 24 * 3600 * 1000;
    var endTime = Date.now();
    var method = "getTestResultList";
    var para = {
        testId: 33,
        testType: 11,
        beginTime: 0,
        endTime: endTime,
        destNodeId: 236,
        sort: 'reportTime',
        dir: 'DESC',
        start: 0,
        limit: 100,
    }

    getConn('admin', 'a', '192.168.1.146', '3012', function (conn) {
        if (!conn) {
            console.log('获取连接失败')
        } else {
            conn[method](function (data, errcode) {
                console.log(data)
                //    console.log(data.rows[1][6]);
            }, this, para);
        }
    }, this)
}