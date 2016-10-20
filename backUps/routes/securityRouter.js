var express = require('express');
var bodyParser = require('body-parser');
var request = require("request");

var securityRouter = express.Router();
securityRouter.use(bodyParser.json());

securityRouter.post('/', function (req, res, next) {
        var recap = req.body.recaptchaData;
        var secretKey = "6LflUAkUAAAAAATbP5ZW9Zo7yKcMJgTIWlxAEUEs";
        request({
            uri: "https://www.google.com/recaptcha/api/siteverify",
            method: "POST",
            form: {
                secret: secretKey,
                response: recap
            }
        }, function (error, response, body) {
            body = JSON.parse(body);
            // Success will be true or false depending upon captcha validation.
            if (body.success) {
                res.status(200).json({
                    status: 'Good work',
                    success: true
                });
            } else {
                return next(new Error('Did not pass human test'));
            }
        });
});
module.exports = securityRouter;