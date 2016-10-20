var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var ReciTots = require('../models/recitots');

var recitotsRouter = express.Router();
recitotsRouter.use(bodyParser.json());

// retrieve the stats table record
recitotsRouter.route('/')
.get(function (req, res, next) {
    ReciTots.findOne(function (err, recitots) {
        if (err) return next(err);
        if (!recitots) {
            var recitots = new ReciTots({});
            recitots.codes = 0;
            recitots.recitals = 0;
            recitots.pages = 0;
            recitots.fatihas = 0;
            recitots.save(function (err, recitots) {
                if (err) return next(err);
                res.json(recitots);
            });
        } else {
            console.log(recitots);
            res.json(recitots);
        }
    });
});

module.exports = recitotsRouter;
