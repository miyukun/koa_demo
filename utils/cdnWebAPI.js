const net = require('net');
const crypto = require('crypto');
const cdns = require('./cdn.json');
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


function doLogin(cdninfo) {
    var sid = cdninfo.sid;
    var authCode = md5(sid + '-' + md5('nts-' + cdninfo.password));
    var req = request('POST', 'http://' + cdninfo.host + ':' + cdninfo.webport + '/login', {
        json: {
            username: cdninfo.username,
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

function doHeartBeat(cdninfo){ 
      var req = request('POST', 'http://' + cdninfo.host + ':' + cdninfo.webport + '/heartbeat', {
        json: {},
        headers: {
            'Cookie': 'clas-session-id=' + cdninfo.sid,
            'Content-Type': 'application/json'
        },
        socketTimeout: 3000,
        timeout: 3000
    });
    return req;
}


function doRequest(cdninfo, path, para, method = "GET") {
    if (method == 'GET') {
        var p = path + '?';
        for (var k in para) {
            p += k + '=' + para[k] + '&';
        }
    } else {
        var p = path;
    } 
    var req = request('GET', 'http://' + cdninfo.host + ':' + cdninfo.webport + '/' + encodeURI(p), {
        json: para,
        headers: {
            'Cookie': 'clas-session-id=' + cdninfo.sid,
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
        }, {
            timeout: 5000,
            socketTimeout: 5000
        })

        var r = JSON.parse(res.getBody().toString());
        if (r.errorCode == 17) {
            cb.call(scope, '登录失败', 1)
            return
        }

        self.sid = r.sessionId;
        res = request('GET', 'http://' + this.host + ':' + this.webport + '/' + encodeURI(p), {
            json: para,
            headers: {
                'Cookie': 'clas-session-id=' + self.sid,
                'Content-Type': 'application/json'
            }
        }, {
            timeout: 5000,
            socketTimeout: 5000
        })
        var r = JSON.parse(res.getBody().toString());
        cb.call(scope, r)
    } catch (error) {
        console.log(error)
    }
}

var api_get_maps = {
    getIcp: 'getIcp',
    getNetworkLayer: 'getNetworkLayer',
    getDomain: 'getDomain',
    getPerformanceSnapshotSub: 'getPerformanceSnapshotSub'
}

function attachAPI(conn) {
    conn.doRequest = doRequest;
    _.each(api_get_maps, function(v, k) {
        conn[k] = function(cb, scope, para) {
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
    getConn,doLogin,doRequest,doHeartBeat
}
if (module === require.main) {
    var stime = Date.now();

    var cb = function(data){
        console.log('final回调:',data)
    }

    var beginTime = Date.now() * 1000 - 24 * 3600 * 1000000;
    var endTime = Date.now() * 1000;
    var method = "getPerformanceSnapshotSub";
    var para = {
        networkLayerId: 17,
        start: 0,
        limit: 2000,
        layerType: 4,
        beginTime: beginTime,
        endTime: endTime,
        stepInterval: 3600000000
    }
    getConn('doupeng', 'Doupeng1234568', '120.198.245.97', '4300', function(conn) {
        if (!conn) {
            console.log('获取连接失败')
        } else {
            conn[method](function(data, errcode) { 
                var etime = Date.now();
                console.log('待续时间:', etime - stime)
                cb(data);
            }, this, para);
        }
    }, this) 
}
