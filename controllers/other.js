const util = require('../utils/util.js')
const db = require('../models')
const _ = require('underscore')
const ObjectId = require('mongoose').Types.ObjectId;
var nodemailer = require('nodemailer');
var request = require('then-request');
const base64js = require('base64-js');
var xml2js = require('xml2js');




stringToByte = function (str) {
    var bytes = new Array();
    var len, c;
    len = str.length;
    for (var i = 0; i < len; i++) {
        c = str.charCodeAt(i);
        if (c >= 0x010000 && c <= 0x10FFFF) {
            bytes.push(((c >> 18) & 0x07) | 0xF0);
            bytes.push(((c >> 12) & 0x3F) | 0x80);
            bytes.push(((c >> 6) & 0x3F) | 0x80);
            bytes.push((c & 0x3F) | 0x80);
        } else if (c >= 0x000800 && c <= 0x00FFFF) {
            bytes.push(((c >> 12) & 0x0F) | 0xE0);
            bytes.push(((c >> 6) & 0x3F) | 0x80);
            bytes.push((c & 0x3F) | 0x80);
        } else if (c >= 0x000080 && c <= 0x0007FF) {
            bytes.push(((c >> 6) & 0x1F) | 0xC0);
            bytes.push((c & 0x3F) | 0x80);
        } else {
            bytes.push(c & 0xFF);
        }
    }
    return bytes;
}

const sendsms = async (ctx) => {
    let flows = await db.flow.find({
        "application": new ObjectId(ctx.request.body._id)
    }, null, {
        sort: {
            "updatetime": -1
        }
    }).lean().populate('nextoper').exec();
    try {
        if (flows[0].nextoper.length) {
            if (flows[0].nextoper[0].phone) {
                var phone = flows[0].nextoper[0].phone;
                // phone = '15235172641';
                var esbusername = (await db.config.findOne({
                    key: 'esbusername'
                }).exec()).val;
                var esbpwd = (await db.config.findOne({
                    key: 'esbpwd'
                }).exec()).val;
                var esburl = (await db.config.findOne({
                    key: 'esburl'
                }).exec()).val;
                var esbport = (await db.config.findOne({
                    key: 'esbport'
                }).exec()).val;
                var esbdataip = (await db.config.findOne({
                    key: 'esbdataip'
                }).exec()).val;

                if (!esbusername || !esbpwd || !esburl || !esbport || !esbdataip) {
                    throw new Error('缺少必要的esb数据')
                }

                var pwd = esbpwd;
                esburl = `http://${esburl}:${esbport}/OSSCOM/ShortMessageService`;

                var smsxml = `<?xml version="1.0" encoding="UTF-8"?>
            <soap:Envelope xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
            <soap:Body>
            <MsgWithDataRq xmlns="http://gdmcc.com/oss/esb/comm/message">
            <MsgHeader xmlns="http://gdmcc.com/oss/esb/comm">
            <ServiceCode/>
            <DataType>UNMP.SM.Sender</DataType>
            <SourceSysID>${esbusername}</SourceSysID>
            <IpAddress>${esbdataip}</IpAddress>
            <UserName>${esbusername}</UserName>
            <EventID/>
            <EventTime/>
            <ReserveData>
            <Parameter name="allowalert" value="0"/>
            </ReserveData>
            </MsgHeader>
            <MsgDataRq xmlns="http://gdmcc.com/oss/esb/comm">
            <TargetList>${phone}</TargetList>
            <Subject/>
            <Content>${ctx.request.body.msg}</Content>
            <Attachments/>
            <ReserveData/>
            </MsgDataRq>
            </MsgWithDataRq>
            </soap:Body>
            </soap:Envelope>`;

                var authorization = "Basic " + Buffer.from(base64js.fromByteArray(stringToByte(`${esbusername}:${esbpwd}`))).toString();
                var contenttype = "text/xml;charset=UTF-8";
                var r = await request('POST', esburl, {
                    body: smsxml,
                    headers: {
                        'Authorization': authorization,
                        'Content-Type': contenttype
                    },
                    socketTimeout: 10000,
                    timeout: 10000
                });
                var resbody = Buffer.from(r.body).toString();


                var parser = new xml2js.Parser({
                    async: false
                });

                var p = new Promise(function (resolve, reject) {
                    parser.parseString(resbody, function (err, xml) {
                        if (err) {
                            reject(err)
                        } else {
                            resolve(xml);
                        }
                    })
                })
                p.then(function (json) {
                    var MsgBaseResult = json['soapenv:Envelope']['soap:Body'][0]['MsgWithDataRs'][0]['MsgBaseResult'][0];
                    if (MsgBaseResult.StatusCode != 'S000001') {
                        ctx.body = util.tojson('发送失败', 1, MsgBaseResult.StatusDesc)
                    } else {
                        ctx.body = util.tojson('发送成功')
                    }
                }).catch(function (err) {
                    throw new Error(err)
                })
            } else {
                throw new Error('没有手机号码')
            }
        } else {
            throw new Error('没有操作人')
        }
    } catch (err) {
        ctx.body = util.tojson('发送失败', 1, err.message)
    }
}

const sendemail = async (ctx) => {
    let flows = await db.flow.find({
        "application": new ObjectId(ctx.request.body._id)
    }, null, {
        sort: {
            "updatetime": -1
        }
    }).lean().populate('nextoper').exec();
    try {
        if (flows[0].nextoper.length) {
            var smtpip = (await db.config.findOne({
                key: 'smtpip'
            }).exec()).val;
            var smtpport = (await db.config.findOne({
                key: 'smtpport'
            }).exec()).val;
            var emailuser = (await db.config.findOne({
                key: 'emailuser'
            }).exec()).val;
            var emailpwd = (await db.config.findOne({
                key: 'emailpwd'
            }).exec()).val;
            if (!smtpip || !smtpport || !emailuser || !emailpwd) {
                throw new Error('缺少邮箱必要配置')
            }
            var smtpConfig = {
                host: smtpip,
                port: smtpport,
                secure: true, // use SSL
                auth: {
                    user: emailuser,
                    pass: emailpwd
                }
            };
            var transporter = nodemailer.createTransport(smtpConfig);　

            var mailOptions = {
                from: emailuser, // sender address
                to: _.pluck(flows[0].nextoper, "email"), // list of receivers
                subject: '待办任务', // Subject line
                html: ctx.request.body.msg // html body
            };
            var p = function () {
                return new Promise(function (resolve, reject) {
                    transporter.sendMail(mailOptions, function (err, info) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(info);
                        }
                    });
                })
            }
            await p();
            ctx.body = util.tojson('发送成功') 
        } else {
            throw new Error('没有操作人') 
        }
    } catch (err) {
        ctx.body = util.tojson('发送失败', 1, err.message)
    }

}

module.exports = {
    sendsms,
    sendemail
}