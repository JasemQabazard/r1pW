var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var nodemailer = require('nodemailer');
var Recitals = require('../models/recitals');
var ReciTots = require('../models/recitots');

var recitalsRouter = express.Router();
recitalsRouter.use(bodyParser.json());

recitalsRouter.post('/newcode', function (req, res, next) {
    // if new recital code exists then return error
    console.log(req.body);
    Recitals.findOne({ code: req.body.generatedCode }, function (err, recital) {
        if (err) return next(err);
        if (recital) {
            return res.status(409).json({
                err: 'Recital Code Exists, try again please'
            });
        }
        // save new code record and information
        var recital = new Recitals({});
        recital.code = req.body.generatedCode;
        recital.pages = req.body.pages;
        recital.fatiha = req.body.fatiha;
        recital.save(function (err, recita) {
            if (err) return next(err);
            ReciTots.findOne(function (err, recitots) {
                recitots.codes++;
                recitots.save();
            });
            var transporter = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'successarchitecture@gmail.com',
                    pass: 'bimwwbmxxyfhmtwe'
                }
            });
            var mailOptions = {
                from: 'successarchitecture@gmail.com',
                to: req.body.emailid,
                subject: 'Your Recital Code is: ' + req.body.generatedCode,
                text: 'Your Recital Code is: ' + req.body.generatedCode,
                html: '<p>Your Recital Code is: </p>' + req.body.generatedCode + '<ul><li>pages ' + req.body.pages + '</li><li>fatiha ' + req.body.fatiha + '</li></ul>'
            };
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    next(err);
                } else {
                    console.log('Recital code email sent');
                    res.status(200).json({
                        status: 'Recital Code Generation and Message Sent' + info.response,
                        success: true
                    });
                }
            });
        });
    });
});

recitalsRouter.get('/:crc', function (req, res, next) {
    Recitals.findOne({ code: req.params.crc }, function (err, recital) {
        if (err) return next(err);
        if (recital) {
            res.status(200).json({
                status: 'Recital Code Generation and Message Sent',
                success: true
            });
        } else {
            res.status(500).json({
                err: 'Recital Code does not Exists'
            });
        }
    });
});

recitalsRouter.post('/read1', function (req, res, next) {
    console.log(req.body.generatedCode);
    Recitals.findOne({ code: req.body.generatedCode }, function (err, recital) {
        if (err) return next(err);
        if (!recital) {
            if (req.body.generatedCode = "KJHATMA") {
                var recital = new Recitals({});
                recital.code = "KHATMA";
                recital.page = 1;
                recital.pages = 1;
                recital.fatiha = true;
                recital.save(function (err, recital) {
                    if (err) return next(err);
                });
            } else {
                res.status(500).json({
                    err: 'Recital Code does not Exists'
                });
            }
        }
            var oldPageNo = recital.page;
            var completedRecitals = 0;
            recital.page += recital.pages;
            if (recital.page >= 604) {
                recital.page = 1;
                completedRecitals++;
            }
            ReciTots.findOne(function (err, recitots) {
                if (!recitots) {
                    console.log('I am saving new recitots');
                    var recitots = new ReciTots({});
                    recitots.codes = 0;
                    recitots.recitals = 0;
                    recitots.pages = 0;
                    recitots.fatihas = 0;
                    recitots.save(function (err, recitots) {
                        if (err) return next(err);
                    });
                }
                recitots.pages += recital.pages;
                recitots.recitals += completedRecitals;
                if (recital.fatiha) recitots.fatihas++;
                recitots.save();
            });
            recital.save(function (err, recita) {
                console.log(recita);
                console.log(oldPageNo);
                recita.page = oldPageNo;
                res.json(recita);
            });
    });
});
module.exports = recitalsRouter;
