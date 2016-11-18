'use strict';
angular.module('r1p')
    //
    // start of IndexController ------- 
    // -----------------
    //
    .controller('IndexController', ['$scope', '$location', '$http', '$timeout', '$localStorage', '$rootScope',
                                    function ($scope, $location, $http, $timeout, $localStorage, $rootScope) {
        var BEHAVIOR = "behavior";
        $scope.humanCheckDate = "";
        $scope.imageSrc = "images/r1p_landing.png";
        $scope.progressPercentages = {
            K1: 0,
            K2: 0,
            K5: 0
        };
        $scope.errorMessageToggle = false;
        $scope.errorMessage = "";
        $scope.CAPTCHANOTPASS = false;
        $rootScope.directKhatma = "";
        $scope.directRead = function (k) {
            $rootScope.directKhatma = k;
            console.log($rootScope.directKhatma);
            $location.path('/read');
        };
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
                                    $scope.progressPercentages.K5 = (100 * (recital.page / 604)).toFixed(0);
                                 })
                        })
                });
        };
        $timeout(initStart, 100);
        $scope.checkBehaviour = function () {
            $scope.humanCheckDate = $localStorage.get(BEHAVIOR, '');
            var dateWasEmpty = false;
            if (!$scope.humanCheckDate) {
                $scope.humanCheckDate = new Date();
                dateWasEmpty = true;
            }
            var diff = Math.abs(new Date() - new Date($scope.humanCheckDate));
            console.log("diff is ");
            console.log(diff);
            if (diff > 432000000 || dateWasEmpty) {
                $location.path('/captcha');
            }
        };
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
                        $scope.humanCheckDate= new Date();
                        $localStorage.store(BEHAVIOR, $scope.humanCheckDate);
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
    .controller('ReadController', ['$scope', '$location', '$localStorage', '$http', '$rootScope',
                    function ($scope, $location, $localStorage, $http, $rootScope) {
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
        $scope.showSpinner = false;
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
                if ($rootScope.directKhatma != "") {
                    $scope.cRc.crc = $rootScope.directKhatma;
                    $rootScope.directKhatma = "";
                } else {
                    $scope.cRc.crc = $localStorage.get(CURRENT_RECITAL_CODE, '');   // get the recital code from local storage
                }
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
            $scope.pagePointer = 1;
            if (!$scope.currentRecitalRead.fatiha) {
                $scope.pagePointer = $scope.currentRecitalRead.page;
            }
            $scope.showSpinner = true;
            console.log($scope.showSpinner);
            $scope.imgSrc = "images/" + $scope.pagePointer + ".jpg";
            $scope.showSpinner = false;
        };
        $scope.movePagesLeft = function () {
            if ($scope.pagePointer == 1) {
                $scope.pagePointer = $scope.currentRecitalRead.page;
            } else if ($scope.pagePointer < $scope.currentRecitalRead.page + $scope.currentRecitalRead.pages - 1) {
                $scope.pagePointer++;
                if ($scope.pagePointer > 604) $scope.pagePointer--;
            }
            $scope.showSpinner = true;
            $scope.imgSrc = "images/" + $scope.pagePointer + ".jpg";
            $scope.showSpinner = false;
        };
        $scope.movePagesRight = function () {
            if ($scope.pagePointer > $scope.currentRecitalRead.page) {
                $scope.pagePointer--;
            }
            $scope.showSpinner = true;
            $scope.imgSrc = "images/" + $scope.pagePointer + ".jpg";
            $scope.showSpinner = false;
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

        $scope.showSpinner = false;
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