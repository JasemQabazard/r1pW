﻿'use strict';
angular.module('r1p', ['ui.router', 'validation.match', 'ui.bootstrap'])
.config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
        // route for the home page
        .state('r1p', {
            url: '/',
            views: {
                'header': {
                    templateUrl: 'views/indexHeader.html'
                },
                'main': {
                    templateUrl: 'views/indexMain.html',
                    controller: 'IndexController'
                },
                'footer': {
                    templateUrl: 'views/indexFooter.html'
                }
            }
        })
        // route for the about us page
        .state('r1p.about', {
            url: 'about',
            views: {
                'main@': {
                    templateUrl: 'views/aboutMain.html',
                    controller: 'AboutController'
                },
                'footer@': {
                    template: ''
                }
            }
        })
        // route for the captcha page
        .state('r1p.captcha', {
            url: 'captcha',
            views: {
                'header@': {
                    template: ''
                },
                'main@': {
                    templateUrl: 'views/captchaMain.html',
                    controller: 'IndexController'
                },
                'footer@': {
                    template: ''
                }
            }
        })
        // route for the help page
        .state('r1p.help', {
            url: 'help',
            views: {
                'main@': {
                    templateUrl: 'views/helpMain.html',
                    controller: 'HelpController'
                },
                'footer@': {
                    template: ''
                }
            }
        })

        // route for the read page
        .state('r1p.read', {
            url: 'read',
            views: {
                'main@': {
                    templateUrl: 'views/readMain.html',
                    controller: 'ReadController'
                },
                'footer@': {
                    template: ''
                }
            }
        })
        // route for the Generate new Recital Code page
        .state('r1p.new', {
            url: 'new',
            views: {
                'main@': {
                    templateUrl: 'views/newMain.html',
                    controller: 'NewController'
                },
                'footer@': {
                    template: ''
                }
            }
        })
        // route for the change Recital Code Form page
        .state('r1p.entry', {
            url: 'entry',
            views: {
                'main@': {
                    templateUrl: 'views/entryMain.html',
                    controller: 'EntryController'
                },
                'footer@': {
                    template: ''
                }
            }
        });
    $urlRouterProvider.otherwise('/');
})
;