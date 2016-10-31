'use strict';
angular.module('r1p')
    //
    // start of IndexController ------- 
    // -----------------
    //
    .controller('IndexController', ['$scope', '$location', '$http', '$timeout', '$localStorage',
                                    function ($scope, $location, $http, $timeout, $localStorage) {
        var BEHAVIOR = "behavior";
        $scope.humanCheck = 0;
        $scope.imageSrc = "images/r1p_landing.png";
        $scope.progressPercentages = {
            K1: 0,
            K2: 0,
            K5: 0
        };
        $scope.errorMessageToggle = false;
        $scope.errorMessage = "";
        $scope.CAPTCHANOTPASS = false;

        var initStart = function () {
            var recitalCode = "KHATMA";
            $http.get('/recitals/' + recitalCode)
                .success(function (recital) {
                    $scope.progressPercentages.K1 = (100 * (recital.page / 604)).toFixed(0);
                    recitalCode = "KHATM2";
                    $http.get('/recitals/' + recitalCode)
                        .success(function (recital) {
                            $scope.progressPercentages.K2 = (100 * (recital.page / 604)).toFixed(0);
                            recitalCode = "KHATM5";
                            $http.get('/recitals/' + recitalCode)
                                .success(function (recital) {
                                    $scope.progressPercentages.K5 = (100 * (recital.page / 604)).toFixed(0);;
                                 })
                        })
                });
            $scope.humanCheck = $localStorage.get(BEHAVIOR, '');
            if (!$scope.humanCheck) {
                $scope.humanCheck = 0;
            }
            if ($scope.humanCheck < 1) {
                $location.path('/captcha');
            }
        };
        $timeout(initStart, 100);
        $scope.CaptchaEntry = function () {
            //
            // CAPTCHA pass false is pass 
            //
            var captchaResponse = grecaptcha.getResponse();
            if (captchaResponse.length === 0) {
                $scope.CAPTCHANOTPASS = true;
                grecaptcha.reset();
                return;
            }
            else {
                var recap = {
                    recaptchaData: captchaResponse
                };
                $http.post('/security', recap)
                    .success(function () {
                        $scope.CAPTCHANOTPASS = false;
                        $scope.humanCheck++;
                        $localStorage.store(BEHAVIOR, $scope.humanCheck);
                        $location.path('/');
                    })
                    .error(function (error) {
                        $scope.errorMessageToggle = true;
                        $scope.errorMessage = error;
                        grecaptcha.reset();
                    });
            }
        };
    }])
    .controller('AboutController', ['$scope', '$http', '$location', function ($scope, $http, $location) {
        $scope.aboutInfo = {        // These counters are aggregates for the about form
            codesGenerated: 0,
            recitalsTotal: 0,
            pagesTotal: 0,
            fatihas: 0
        };
        $scope.aboutR1P = function () {
            $http.get('/recitots', { headers: { 'Cache-Control': 'no-cache' } })
                    .success(function (recitots) {
                        $scope.aboutInfo.codesGenerated = recitots.codes;
                        $scope.aboutInfo.recitalsTotal = recitots.recitals;
                        $scope.aboutInfo.pagesTotal = recitots.pages;
                        $scope.aboutInfo.fatihas = recitots.fatihas;
                    });
            //
            // http get the data from the aggregates data table fill the form information for display
            //
        };
        $scope.hideAbout = function () {
            $location.path('/');
        };
    }])
    .controller('HelpController', ['$scope', '$location', function ($scope, $location) {
        $scope.thankYou = function () {
            $location.path('/');
        };
    }])
    .controller('ReadController', ['$scope', '$location', '$localStorage', '$http', function ($scope, $location, $localStorage, $http) {
        // key to store current recital code in local storage
        var CURRENT_RECITAL_CODE = "CurrentRecitalCode";
        // key to stores an object in the localstorage for current reading
        var CURREENT_READING = "CurrentReading";
        $scope.currentRecitalRead = {
            code: "",
            page: 0,
            pages: 0,
            fatiha: true
        };
        $scope.cRc = {
            crc:""
        };
        $scope.errorMessageToggle = false;
        $scope.errorMessage = "";
        $scope.pagePointer = 0;    // page pointert for the current read for stepping through the pages 
        $scope.imgSrc = "";
        // and Controllong currentReacitalRead
        /**
        generate the pages to be read after user clicks the read button
        */
        $scope.readPages = function () {
            $scope.currentRecitalRead = $localStorage.getObject(CURREENT_READING, '{}');
            if ($scope.currentRecitalRead.code === undefined) {
                $scope.cRc.crc = $localStorage.get(CURRENT_RECITAL_CODE, '');   // get the recital code from local storage
                if (!$scope.cRc.crc) {
                    $scope.cRc.crc = "KHATMA";
                    $localStorage.store(CURRENT_RECITAL_CODE, $scope.cRc.crc);
                }
                $http.post('/recitals/read1', $scope.cRc)
                    .success(function (recital) {
                        $scope.currentRecitalRead = recital;
                        $localStorage.storeObject(CURREENT_READING, $scope.currentRecitalRead);
                        setUpInitialRead();
                    })
                    .error(function (error) {
                        $scope.errorMessageToggle = true;
                        $scope.errorMessage = error;
                    });
            } else {
                setUpInitialRead();
            };

            // http get the recital code record from RecitalSchema
            // in the server record all the readings in the data base tables 
            // such as advance the read pages, and the statistics
            // on success store the information in local storage if more than once page 
            // and if fatiha is required
            // display pages accordingly with new logic
        };

        var setUpInitialRead = function () {
            var n = 1;
            $scope.pagePointer = 0;
            if (!$scope.currentRecitalRead.fatiha) {
                n = $scope.currentRecitalRead.page;
                $scope.pagePointer = n;
            }
            $scope.imgSrc = "images/" + n + ".jpg";
        };
        $scope.movePagesLeft = function () {
            if ($scope.pagePointer == 0) {
                $scope.pagePointer = $scope.currentRecitalRead.page;
            } else if ($scope.pagePointer < $scope.currentRecitalRead.page + $scope.currentRecitalRead.pages - 1) {
                $scope.pagePointer++;
                if ($scope.pagePointer > 604) $scope.pagePointer--;
            }
            $scope.imgSrc = "images/" + $scope.pagePointer + ".jpg";
        };
        $scope.movePagesRight = function () {
            if ($scope.pagePointer == 0) {
                $scope.pagePointer = $scope.currentRecitalRead.page;
            } else if ($scope.pagePointer > $scope.currentRecitalRead.page) {
                $scope.pagePointer--;
            }
            $scope.imgSrc = "images/" + $scope.pagePointer + ".jpg";
        };
        $scope.finishedCurrentRead = function () {
            $scope.currentRecitalRead.code = undefined;
            $localStorage.remove(CURREENT_READING);
            $location.path('/');
        };
    }])
    .controller('EntryController', ['$scope', '$location', '$http', '$localStorage', function ($scope, $location, $http, $localStorage) {
        var CURRENT_RECITAL_CODE = "CurrentRecitalCode";
        $scope.crc = "";
        $scope.recitalCode = "";
        $scope.recitalCodeConfirm = "";
        $scope.errorMessageToggle = false;
        $scope.errorMessage = "";
        // retrieve the current recital code (crc) from storage
        // if no current recital code (crc) exists use "KHATMA", the genral code and 
        // save it in local storage
        // show the current recital code 
        $scope.enterRecital = function () {
            $scope.crc = $localStorage.get(CURRENT_RECITAL_CODE, '');
            if (!$scope.crc) {
                $scope.crc = "KHATMA";
                $localStorage.store(CURRENT_RECITAL_CODE, $scope.crc);
            }
        };
        // http check if the recital code exists in the recitals table
        // if exists store in local storage for future access
        // if does not exist raise error
        $scope.recitalEntry = function () {
            if ($scope.recitalCode == $scope.crc) {
                $scope.errorMessageToggle = true;
                $scope.errorMessage = "Recital Code CAN NOT be same as current code";
            } else {
                $http.get('/recitals/' + $scope.recitalCode)
                    .success(function (recital) {
                        $localStorage.store(CURRENT_RECITAL_CODE, $scope.recitalCode);
                        $location.path('/');
                    })
                    .error(function (error) {
                        $scope.errorMessageToggle = true;
                        $scope.errorMessage = error;
                    });
            }
        };
        /**
            cancellation of the options menu forms just toggles some switches to hide forms and show the READ button
        */
        $scope.cancelRecitalEntry = function () {
            $location.path('/');
        };
    }])
    .controller('NewController', ['$scope', '$location', '$http', '$localStorage', 'codeGenerationService',
        function ($scope, $location, $http, $localStorage, codeGenerationService) {
        var CURRENT_RECITAL_CODE = "CurrentRecitalCode";
        $scope.errorMessageToggle = false;
        $scope.errorMessage = "";
        $scope.newCodeData = {      // ==== this is for the new code generation form ===
            pages: 1,
            fatiha: false,
            emailid: "",
            emailidconfirm: "",
            generatedCode: ""
        };
        $scope.RecitalGeneration = function () {
            $scope.showSpinner = true;
            $scope.newCodeData.generatedCode = codeGenerationService.codeGen();
            $http.post('/recitals/newcode', $scope.newCodeData)
                    .success(function (recital) {
                        $localStorage.store(CURRENT_RECITAL_CODE, $scope.newCodeData.generatedCode);
                        $scope.showSpinner = false;
                        $location.path('/');
                    })
                    .error(function (error) {
                        $scope.errorMessageToggle = true;
                        $scope.errorMessage = error;
                    });
        };
        $scope.cancelRecitalGeneration = function () {
            $location.path('/');
        };
    }])
;