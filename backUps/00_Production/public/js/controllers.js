'use strict';
angular.module('r1p')
    //
    // start of IndexController ------- 
    // -----------------
    //
    .controller('IndexController', ['$scope', '$location', '$http', '$rootScope', 'codeGenerationService', '$timeout', '$localStorage',
                                    function ($scope, $location, $http, $rootScope, codeGenerationService, $timeout, $localStorage) {

        $scope.showBody = false;
                                        // key to store current recital code in local storage
        var CURRENT_RECITAL_CODE = "CurrentRecitalCode";

        // key to stores an object in the localstorage for current reading
        var CURREENT_READING = "CurrentReading";
        // this key stores the humanistic behavior counter for the user
        // once he submits the rechapcha 3 times he is then on allowed to read without the rechapthca
        // value in storage 0 - 3
        // once equal to 3 then he is allowed entry
        var BEHAVIOR = "behavior";
        $scope.humanCheck = 0;
        $scope.crc = "";    // current recital code for the user
        $scope.recitalCode = "";    // two way binding for recital code entry form
        $scope.recitalCodeConfirm = ""; // confirmation of recital code entry match validation
        //
        $scope.currentRecitalRead = {
            code: "",
            page: 0,
            pages: 0,
            fatiha: true
        };
        $scope.pagePointer = 0;    // page pointert for the current read for stepping through the pages 
                                        // and Controllong currentReacitalRead
        $scope.showReadPointers = false;
        
        $scope.myStyle = {  // style for background image ngstyle and for changing the image programmatically
            "width": "100%",
            "height": "933px",
            "background": 'url("../images/r1p_landing.png") no-repeat center top scroll',
            "background-size": "contain",
            "margin": "0px",
            "padding": "0px"
        };
        
        $scope.newCodeData = {      // ==== this is for the new code generation form ===
            pages: 1,
            fatiha: false,
            emailid: "",
            emailidconfirm: "",
            generatedCode: ""
        };
        $scope.aboutInfo = {        // These counters are aggregates for the about form
            codesGenerated: 0,
            recitalsTotal: 0,
            pagesTotal: 0,
            fatihas: 0
        };
        $scope.progressPercentages = {
            K1: 0,
            K2: 0,
            K5: 0
        };
        // flags to show/ hide/ disable various forms, messages and the READ bnutton
        $scope.showR1Pbtn = false;
        $scope.elepicalMenu = false;
        $scope.showEnterRecital = false;
        $scope.showGenerateRecital = false;
        $scope.showAbout = false;
        $scope.newCodeCompleted = false;
        $scope.disabledNewCodeForm = false;
        $scope.errorMessageToggle = false;
        $scope.errorMessage = "";
        $scope.recitalEntryCompleted = false;
        $scope.showCaptcha = false;
        $scope.CAPTCHANOTPASS = false;
        $scope.showSpinner = false;
        $scope.showHelp = false;

        var initStart = function () {
            $scope.humanCheck = $localStorage.get(BEHAVIOR, '');
            if (!$scope.humanCheck) {
                $scope.humanCheck = 0;
            }
            $scope.showBody = true;
            if ($scope.humanCheck < 3) {
                $scope.showCaptcha = true;
            } else {
                $scope.showR1Pbtn = true;
                $scope.elepicalMenu = true;
            }
            $scope.recitalCode = "KHATMA";
            $http.get('/recitals/' + $scope.recitalCode)
                .success(function (recital) {
                    $scope.progressPercentages.K1 = (100 * (recital.page / 604)).toFixed(0);
                    $scope.recitalCode = "KHATM2";
                    $http.get('/recitals/' + $scope.recitalCode)
                        .success(function (recital) {
                            $scope.progressPercentages.K2 = (100 * (recital.page / 604)).toFixed(0);
                            $scope.recitalCode = "KHATM5";
                            $http.get('/recitals/' + $scope.recitalCode)
                            .success(function (recital) {
                                $scope.progressPercentages.K5 = (100 * (recital.page / 604)).toFixed(0);
                                $scope.recitalCode = "";
                            })
                        })
                });
        };

        $timeout(initStart, 250);

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
                        $scope.showR1Pbtn = true;
                        $scope.elepicalMenu = true;
                        $scope.showCaptcha = false;
                        $scope.humanCheck++;
                        $localStorage.store(BEHAVIOR, $scope.humanCheck);
                    })
                    .error(function (error) {
                        $scope.errorMessageToggle = true;
                        $scope.errorMessage = error;
                        grecaptcha.reset();
                    });
            }
        };

        var lapseTimer = function () {  // timer lapse for the new code genration form completed successfully
            $localStorage.store(CURRENT_RECITAL_CODE, $scope.newCodeData.generatedCode);
            $scope.newCodeCompleted = false;
            $scope.showR1Pbtn = true;
            $scope.elepicalMenu = true;
            $scope.showGenerateRecital = false;
            $scope.disabledNewCodeForm = false;
            $scope.newCodeData.pages = 1;
            $scope.newCodeData.fatiha = false;
            $scope.newCodeData.emailid = "";
            $scope.newCodeData.emailidconfirm = "";
            $scope.newCodeData.generatedCode = "";
            $scope.generateRecitalForm.$setPristine();
            $scope.myStyle.background = 'url("../images/r1p_landing.png") no-repeat center top scroll';
            $scope.showSpinner = false;
        };

        /**
            this is options menu item 1 a form for the user to enter a recital code and submit to the server 
            user might have received this code from a friend 
            Once entered the submit button routes the code to the server to check if it exists 
            if it exists then it is stored in the user profile on his mobile or computer
            If it does not exist; he is notified with error.
        */
        $scope.enterRecital = function () {
            // before form dispaly retrieve the current recital code (crc) from storage
            // if no current recital code (crc) exists use "JMQJMQ", the genral code and 
            // save it in local storage
            // show the current recital code when you first display this page
            $scope.crc = $localStorage.get(CURRENT_RECITAL_CODE, '');
            if (!$scope.crc) {
                $scope.crc = "KHATMA";
                $localStorage.store(CURRENT_RECITAL_CODE, $scope.crc);
            }
            $scope.showR1Pbtn = false;
            $scope.elepicalMenu = false;
            $scope.showEnterRecital = true;
            $scope.myStyle.background = 'url("../images/r1p_FormBG.png") no-repeat center top scroll';
        };
        $scope.RecitalEntry = function () {
            // http check if the recital code exists in the recitals table
            // if exists store in local storage for future access
            // if does not exist raise error
            if ($scope.recitalCode == $scope.crc) {
                $scope.errorMessageToggle = true;
                $scope.errorMessage = "Recital Code CAN NOT be same as current code";
            } else {
                $http.get('/recitals/'+ $scope.recitalCode)
                    .success(function (recital) {
                        $timeout(entryTimer, 5000);
                        $scope.recitalEntryCompleted = true;
                    })
                    .error(function (error) {
                        $scope.errorMessageToggle = true;
                        $scope.errorMessage = error;
                    });
            }
        };
        var entryTimer = function () {  // timer lapse for the successful completion of recital code entry
            $localStorage.store(CURRENT_RECITAL_CODE, $scope.recitalCode);
            $scope.errorMessageToggle = false;
            $scope.errorMessage = "";
            $scope.recitalCode = "";
            $scope.recitalCodeConfirm = "";
            $scope.recitalEntryCompleted = false;
            $scope.showR1Pbtn = true;
            $scope.elepicalMenu = true;
            $scope.showEnterRecital = false;
            $scope.enterRecitalForm.$setPristine();
            $scope.myStyle.background = 'url("../images/r1p_landing.png") no-repeat center top scroll';
        };
        /**
            this is options menu item 2 a form for the user to generate a new recital code
            the user has the option to select several settings before generating the code:
                - How many pages he would like to read on each READ button click 1, 2, 5
                - Does he like to read the Fatiha at the beginning of every recital.
            the user submits his email to receive a confirmation of the code and the settings 

            ONCE THE USER PRESSES GENERATE PROGRAM EXECUTES 
            RecitalGeneration() FUNCTION
        */
        $scope.generateRecital = function () {
            $scope.showR1Pbtn = false;
            $scope.showGenerateRecital = true;
            $scope.elepicalMenu = false;
            $scope.crc = "";
            $scope.myStyle.background = 'url("../images/r1p_FormBG.png") no-repeat center top scroll';
        };
        $scope.RecitalGeneration = function () {
            $scope.showSpinner = true;
            $scope.newCodeData.generatedCode = codeGenerationService.codeGen();
            $http.post('/recitals/newcode', $scope.newCodeData)
                    .success(function (recital) {
                        $scope.newCodeCompleted = true;
                        $scope.disabledNewCodeForm = true;
                        $timeout(lapseTimer, 5000);
                    })
                    .error(function (error) {
                        $scope.errorMessageToggle = true;
                        $scope.errorMessage = error;
                    });
        };

        /**
            This is options menu item 3 a form about us that displays also some data about 
                - the number of recital codes generated 
                - the no of pages read app wide
                - the no of completed recitals done so far
                - the no of fatihas read app wide
        */
        $scope.aboutRecital = function () {
            $http.get('/recitots', { headers: { 'Cache-Control': 'no-cache' } })
                    .success(function (recitots) {
                        $scope.showAbout = !$scope.showAbout;
                        $scope.showR1Pbtn = !$scope.showR1Pbtn;
                        $scope.elepicalMenu = !$scope.elepicalMenu;
                        $scope.aboutInfo.codesGenerated = recitots.codes;
                        $scope.aboutInfo.recitalsTotal = recitots.recitals;
                        $scope.aboutInfo.pagesTotal = recitots.pages;
                        $scope.aboutInfo.fatihas = recitots.fatihas;
                        $scope.myStyle.background = 'url("../images/r1p_FormBG.png") no-repeat center top scroll';
                    })
                    .error(function (error) {
                        $scope.errorMessageToggle = true;
                        $scope.errorMessage = error;
                    });
            //
            // http get the data from the aggregates data table fill the form information for display
            // once successfull show the form and hide the READ button
            //
        };

        // hide about form and show READ
        $scope.hideAbout = function () {
            $scope.showAbout = !$scope.showAbout;
            $scope.showR1Pbtn = !$scope.showR1Pbtn;
            $scope.elepicalMenu = !$scope.elepicalMenu;
            $scope.myStyle.background = 'url("../images/r1p_landing.png") no-repeat center top scroll';
        };
        // help menu show and hide function
        $scope.helpMenu = function () {
            $scope.showHelp = !$scope.showHelp;
            $scope.showR1Pbtn = !$scope.showR1Pbtn;
            $scope.elepicalMenu = !$scope.elepicalMenu;
            if ($scope.showHelp) {
                $scope.myStyle.background = 'url("../images/r1p_FormBG.png") no-repeat center top scroll';
            } else {
                $scope.myStyle.background = 'url("../images/r1p_landing.png") no-repeat center top scroll';
            }
        };
        /**
            generate the pages to be read after user clicks the read button
        */
        $scope.readPages = function () {
            $scope.currentRecitalRead = $localStorage.getObject(CURREENT_READING, '{}');
            if ($scope.currentRecitalRead.code === undefined) {
                $scope.crc = $localStorage.get(CURRENT_RECITAL_CODE, '');   // get the recital code from local storage
                if (!$scope.crc) {
                    $scope.crc = "KHATMA";
                    $localStorage.store(CURRENT_RECITAL_CODE, $scope.crc);
                }
                $scope.newCodeData.generatedCode = $scope.crc;
                $http.post('/recitals/read1', $scope.newCodeData)
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
            $scope.myStyle.background = 'url("../images/' + n + '.jpg") no-repeat center top scroll';
            $scope.showR1Pbtn = false;
            $scope.elepicalMenu = false;
            $scope.showReadPointers = true;
        };
        $scope.movePagesLeft = function () {
            if ($scope.pagePointer == 0) {
                $scope.pagePointer = $scope.currentRecitalRead.page;
            } else if ($scope.pagePointer < $scope.currentRecitalRead.page + $scope.currentRecitalRead.pages -1) {
                $scope.pagePointer++;
                if ($scope.pagePointer > 604) $scope.pagePointer--;
            }
            $scope.myStyle.background = 'url("../images/' + $scope.pagePointer + '.jpg") no-repeat center top scroll';
        };
        $scope.movePagesRight = function () {
            if ($scope.pagePointer == 0) {
                $scope.pagePointer = $scope.currentRecitalRead.page;
            } else if ($scope.pagePointer > $scope.currentRecitalRead.page) {
                $scope.pagePointer--;
            }
            $scope.myStyle.background = 'url("../images/' + $scope.pagePointer + '.jpg") no-repeat center top scroll';
        };
        $scope.finishedCurrentRead = function () {
            $scope.currentRecitalRead.page = 0;
            $scope.currentRecitalRead.pages = 0;
            $scope.currentRecitalRead.code = undefined;
            $localStorage.remove(CURREENT_READING);
            $scope.showR1Pbtn = true;
            $scope.elepicalMenu = true;
            $scope.showReadPointers = false;
            $scope.newCodeData.generatedCode = "";
            $scope.myStyle.background = 'url("../images/r1p_landing.png") no-repeat center top scroll';
        };
        /**
            cancellation of the options menu forms just toggles some switches to hide forms and show the READ button
        */
        $scope.cancelRecitalEntry = function () {
            $scope.showR1Pbtn = true;
            $scope.showEnterRecital = false;
            $scope.elepicalMenu = true;
            $scope.errorMessageToggle = false;
            $scope.errorMessage = "";
            $scope.recitalCode = "";
            $scope.recitalCodeConfirm = "";
            $scope.enterRecitalForm.$setPristine();
            $scope.myStyle.background = 'url("../images/r1p_landing.png") no-repeat center top scroll';
        };
        $scope.cancelRecitalGeneration = function () {
            $scope.showR1Pbtn = true;
            $scope.showGenerateRecital = false;
            $scope.elepicalMenu = true;
            $scope.disabledNewCodeForm = false;
            $scope.newCodeData.pages = 1;
            $scope.newCodeData.fatiha = false;
            $scope.newCodeData.emailid = "";
            $scope.newCodeData.emailidconfirm = "";
            $scope.newCodeData.generatedCode = "";
            $scope.generateRecitalForm.$setPristine();
            $scope.myStyle.background = 'url("../images/r1p_landing.png") no-repeat center top scroll';
        };
    }])


;