/* =========================================================
   ROYAL PALACE HOTEL
   CENTRAL APP LOADER
   VERSION: 2.0
   ========================================================= */

(function () {
    "use strict";

    const APP_LOADER_VERSION = "2.0";

    const MODULES = [
        {
            name: "App Core",
            file: "js/app-core.js",
            required: true
        },
        {
            name: "Error Monitor",
            file: "js/error-monitor.js",
            required: true
        },
        {
            name: "Mobile Menu",
            file: "js/menu.js",
            required: false
        },
        {
            name: "Dashboard",
            file: "js/dashboard.js",
            required: false
        },
        {
            name: "Rooms",
            file: "js/rooms.js",
            required: false
        },
        {
            name: "Bookings",
            file: "js/bookings.js",
            required: false
        },
        {
            name: "Settings",
            file: "js/settings.js",
            required: false
        }
    ];

    /* =====================================================
       GLOBAL APP OBJECT
    ===================================================== */

    window.ROYAL_APP = window.ROYAL_APP || {};

    window.ROYAL_APP.loader = {
        version: APP_LOADER_VERSION,
        modules: MODULES,
        loaded: [],
        failed: [],
        startedAt: new Date().toISOString(),
        finishedAt: null
    };

    window.ROYAL_APP.loaderStarted = false;
    window.ROYAL_APP.ready = false;


    /* =====================================================
       LOG
    ===================================================== */

    function loaderLog(message, data) {

        if (data !== undefined) {
            console.log(
                "[ROYAL LOADER]",
                message,
                data
            );
        } else {
            console.log(
                "[ROYAL LOADER]",
                message
            );
        }
    }


    /* =====================================================
       ERROR REPORT
    ===================================================== */

    function reportLoaderError(
        type,
        message,
        source,
        extra
    ) {

        console.error(
            "❌ Royal Palace Loader Error:",
            type,
            message,
            source || ""
        );

        if (
            typeof window.reportAppError ===
            "function"
        ) {

            window.reportAppError(
                type,
                message,
                source || "app-loader.js",
                extra || {}
            );

        }
    }


    /* =====================================================
       LOAD SINGLE MODULE
    ===================================================== */

    function loadModule(module) {

        return new Promise(function (resolve) {

            loaderLog(
                "Loading module:",
                module.name
            );

            /* ---------------------------------------------
               CHECK DUPLICATE
            --------------------------------------------- */

            const existing =
                document.querySelector(
                    'script[data-royal-module="' +
                    module.file +
                    '"]'
                );

            if (existing) {

                loaderLog(
                    "Already loaded:",
                    module.name
                );

                if (
                    !window.ROYAL_APP.loader.loaded
                    .includes(module.name)
                ) {

                    window.ROYAL_APP.loader.loaded
                        .push(module.name);

                }

                resolve(true);
                return;
            }


            /* ---------------------------------------------
               CREATE SCRIPT
            --------------------------------------------- */

            const script =
                document.createElement("script");


            /*
             * Cache busting
             *
             * हर module का latest version
             * load होगा.
             */

            script.src =
                module.file +
                "?v=" +
                Date.now();


            script.async = false;

            script.dataset.royalModule =
                module.file;

            script.dataset.moduleName =
                module.name;


            /* ---------------------------------------------
               SUCCESS
            --------------------------------------------- */

            script.onload = function () {

                loaderLog(
                    "✅ Module loaded:",
                    module.name
                );

                if (
                    !window.ROYAL_APP.loader.loaded
                    .includes(module.name)
                ) {

                    window.ROYAL_APP.loader.loaded
                        .push(module.name);

                }

                resolve(true);
            };


            /* ---------------------------------------------
               FAILURE
            --------------------------------------------- */

            script.onerror = function () {

                console.error(
                    "❌ Module failed:",
                    module.name,
                    module.file
                );

                window.ROYAL_APP.loader.failed
                    .push({
                        name: module.name,
                        file: module.file,
                        required:
                            module.required
                    });


                reportLoaderError(
                    "MODULE_LOAD_ERROR",
                    module.name +
                    " load नहीं हो सकी।",
                    module.file,
                    {
                        required:
                            module.required
                    }
                );


                /*
                 * Required module fail होने पर भी
                 * बाकी modules को load होने देंगे.
                 */

                resolve(false);
            };


            /* ---------------------------------------------
               ADD SCRIPT
            --------------------------------------------- */

            document.head.appendChild(script);

        });
    }


    /* =====================================================
       LOAD ALL MODULES
    ===================================================== */

    async function loadAllModules() {

        loaderLog(
            "===================================="
        );

        loaderLog(
            "ROYAL PALACE CENTRAL APP LOADER"
        );

        loaderLog(
            "Version:",
            APP_LOADER_VERSION
        );

        loaderLog(
            "Total Modules:",
            MODULES.length
        );

        loaderLog(
            "Starting module loading..."
        );

        loaderLog(
            "===================================="
        );


        /* ---------------------------------------------
           LOAD ONE BY ONE
        --------------------------------------------- */

        for (
            let i = 0;
            i < MODULES.length;
            i++
        ) {

            const module =
                MODULES[i];

            try {

                await loadModule(module);

            } catch (error) {

                console.error(
                    "❌ Unexpected module error:",
                    module.name,
                    error
                );


                window.ROYAL_APP.loader.failed
                    .push({
                        name: module.name,
                        file: module.file,
                        required:
                            module.required,
                        error:
                            String(error)
                    });


                reportLoaderError(
                    "MODULE_RUNTIME_ERROR",
                    module.name +
                    " में unexpected error आया।",
                    module.file,
                    {
                        error:
                            String(error)
                    }
                );
            }
        }


        finishLoading();
    }


    /* =====================================================
       FINISH
    ===================================================== */

    function finishLoading() {

        const loaded =
            window.ROYAL_APP.loader.loaded;

        const failed =
            window.ROYAL_APP.loader.failed;


        window.ROYAL_APP.loader.finishedAt =
            new Date().toISOString();


        loaderLog(
            "===================================="
        );

        loaderLog(
            "ROYAL PALACE APP LOADING COMPLETE"
        );

        loaderLog(
            "Loaded:",
            loaded
        );

        loaderLog(
            "Failed:",
            failed
        );

        loaderLog(
            "===================================="
        );


        /* ---------------------------------------------
           APP READY
        --------------------------------------------- */

        window.ROYAL_APP.ready = true;


        /* ---------------------------------------------
           READY EVENT
        --------------------------------------------- */

        try {

            document.dispatchEvent(
                new CustomEvent(
                    "royalAppReady",
                    {
                        detail:
                            window.ROYAL_APP.loader
                    }
                )
            );

        } catch (error) {

            console.error(
                "Ready event error:",
                error
            );
        }


        /* ---------------------------------------------
           HEALTH UPDATE
        --------------------------------------------- */

        if (
            typeof window.updateAppHealth ===
            "function"
        ) {

            try {

                window.updateAppHealth();

            } catch (error) {

                console.error(
                    "Health update error:",
                    error
                );
            }
        }


        /* ---------------------------------------------
           BOOKINGS AUTO REFRESH
        --------------------------------------------- */

        setTimeout(function () {

            if (
                typeof window.loadBookings ===
                "function"
            ) {

                try {

                    window.loadBookings();

                } catch (error) {

                    reportLoaderError(
                        "BOOKING_START_ERROR",
                        "Bookings module start नहीं हो सका।",
                        "js/bookings.js",
                        {
                            error:
                                String(error)
                        }
                    );
                }
            }

        }, 100);


        /* ---------------------------------------------
           DASHBOARD REFRESH
        --------------------------------------------- */

        setTimeout(function () {

            if (
                typeof window.updateDashboard ===
                "function"
            ) {

                try {

                    window.updateDashboard();

                } catch (error) {

                    reportLoaderError(
                        "DASHBOARD_START_ERROR",
                        "Dashboard update नहीं हो सका।",
                        "js/dashboard.js",
                        {
                            error:
                                String(error)
                        }
                    );
                }
            }

        }, 150);


        /* ---------------------------------------------
           SETTINGS REFRESH
        --------------------------------------------- */

        setTimeout(function () {

            if (
                typeof window.renderSettings ===
                "function"
            ) {

                try {

                    window.renderSettings();

                } catch (error) {

                    reportLoaderError(
                        "SETTINGS_START_ERROR",
                        "Settings module start नहीं हो सका।",
                        "js/settings.js",
                        {
                            error:
                                String(error)
                        }
                    );
                }
            }

        }, 200);


        /* ---------------------------------------------
           ROOMS REFRESH
        --------------------------------------------- */

        setTimeout(function () {

            if (
                typeof window.updateRoomsPage ===
                "function"
            ) {

                try {

                    window.updateRoomsPage();

                } catch (error) {

                    reportLoaderError(
                        "ROOMS_START_ERROR",
                        "Rooms module start नहीं हो सका।",
                        "js/rooms.js",
                        {
                            error:
                                String(error)
                        }
                    );
                }
            }

        }, 250);
    }


    /* =====================================================
       MANUAL RELOAD
    ===================================================== */

    window.reloadRoyalApp = function () {

        loaderLog(
            "🔄 Reloading Royal Palace App..."
        );

        window.location.reload();
    };


    /* =====================================================
       MANUAL MODULE LOAD
    ===================================================== */

    window.loadRoyalModule = function (
        file,
        name
    ) {

        if (!file) {

            console.error(
                "Royal module file missing."
            );

            return Promise.resolve(false);
        }


        return loadModule({

            name:
                name ||
                file,

            file:
                file,

            required:
                false

        });
    };


    /* =====================================================
       APP STATUS
    ===================================================== */

    window.getRoyalLoaderStatus =
        function () {

            return {

                version:
                    APP_LOADER_VERSION,

                ready:
                    window.ROYAL_APP.ready,

                loaded:
                    [
                        ...window
                            .ROYAL_APP
                            .loader
                            .loaded
                    ],

                failed:
                    [
                        ...window
                            .ROYAL_APP
                            .loader
                            .failed
                    ],

                startedAt:
                    window
                        .ROYAL_APP
                        .loader
                        .startedAt,

                finishedAt:
                    window
                        .ROYAL_APP
                        .loader
                        .finishedAt
            };
        };


    /* =====================================================
       START LOADER
    ===================================================== */

    function startLoader() {

        if (
            window.ROYAL_APP.loaderStarted
        ) {

            return;
        }


        window.ROYAL_APP.loaderStarted =
            true;


        loadAllModules()
            .catch(function (error) {

                console.error(
                    "❌ Central Loader Fatal Error:",
                    error
                );


                reportLoaderError(
                    "LOADER_FATAL_ERROR",
                    "Central App Loader में fatal error आया।",
                    "js/app-loader.js",
                    {
                        error:
                            String(error)
                    }
                );

            });
    }


    /* =====================================================
       START
    ===================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            startLoader,
            {
                once: true
            }
        );

    } else {

        startLoader();

    }

})();
