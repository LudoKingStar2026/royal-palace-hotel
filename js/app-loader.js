/* =========================================================
   ROYAL PALACE HOTEL
   CENTRAL APP LOADER
   VERSION 5.0
   ========================================================= */

(function () {
    "use strict";

    const VERSION = "5.0";

    const MODULES = [
        ["App Core", "js/app-core.js", true],
        ["Error Monitor", "js/error-monitor.js", true],
        ["Mobile Menu", "js/menu.js", false],
        ["Dashboard", "js/dashboard.js", false],
        ["Rooms", "js/rooms.js", false],
        ["Bookings", "js/bookings.js", false],
        ["Settings", "js/settings.js", false]
    ];

    /* -----------------------------------------------------
       GLOBAL APP
    ----------------------------------------------------- */

    window.ROYAL_APP = window.ROYAL_APP || {};

    window.ROYAL_APP.loader = {
        version: VERSION,
        modules: MODULES,
        loaded: [],
        failed: [],
        startedAt: new Date().toISOString(),
        finishedAt: null
    };

    window.ROYAL_APP.loaderStarted = false;
    window.ROYAL_APP.ready = false;

    /* -----------------------------------------------------
       LOG
    ----------------------------------------------------- */

    function log() {
        console.log.apply(
            console,
            ["[ROYAL LOADER]"].concat(
                Array.from(arguments)
            )
        );
    }

    /* -----------------------------------------------------
       ERROR
    ----------------------------------------------------- */

    function loaderError(type, message, source) {

        console.error(
            "[ROYAL LOADER ERROR]",
            type,
            message,
            source || ""
        );

        try {
            if (
                typeof window.reportAppError ===
                "function"
            ) {
                window.reportAppError(
                    type,
                    message,
                    source || "js/app-loader.js"
                );
            }
        } catch (e) {
            console.error(e);
        }
    }

    /* -----------------------------------------------------
       LOAD MODULE
    ----------------------------------------------------- */

    function loadModule(item) {

        return new Promise(function (resolve) {

            const name = item[0];
            const file = item[1];
            const required = item[2];

            const oldScript =
                document.querySelector(
                    'script[data-royal-module="' +
                    file +
                    '"]'
                );

            if (oldScript) {

                if (
                    !window.ROYAL_APP.loader.loaded
                        .includes(name)
                ) {
                    window.ROYAL_APP.loader.loaded
                        .push(name);
                }

                resolve(true);
                return;
            }

            log("Loading:", name);

            const script =
                document.createElement("script");

            script.type = "text/javascript";
            script.async = false;

            script.src =
                file + "?v=" + Date.now();

            script.dataset.royalModule = file;
            script.dataset.moduleName = name;

            script.onload = function () {

                log("Loaded:", name);

                if (
                    !window.ROYAL_APP.loader.loaded
                        .includes(name)
                ) {
                    window.ROYAL_APP.loader.loaded
                        .push(name);
                }

                /* Error Monitor */
                if (
                    name === "Error Monitor"
                ) {
                    try {
                        if (
                            typeof window
                                .startErrorMonitor ===
                            "function"
                        ) {
                            window.startErrorMonitor();
                        }
                    } catch (e) {
                        loaderError(
                            "ERROR_MONITOR_START",
                            e.message,
                            file
                        );
                    }
                }

                resolve(true);
            };

            script.onerror = function () {

                console.error(
                    "Module failed:",
                    name,
                    file
                );

                window.ROYAL_APP.loader.failed
                    .push({
                        name: name,
                        file: file,
                        required: required
                    });

                loaderError(
                    "MODULE_LOAD_ERROR",
                    name + " load नहीं हो सकी।",
                    file
                );

                resolve(false);
            };

            document.head.appendChild(script);
        });
    }

    /* -----------------------------------------------------
       LOAD ALL
    ----------------------------------------------------- */

    async function loadAll() {

        log("================================");
        log("ROYAL PALACE HOTEL");
        log("CENTRAL LOADER V" + VERSION);
        log("Starting...");
        log("================================");

        for (
            let i = 0;
            i < MODULES.length;
            i++
        ) {
            try {
                await loadModule(
                    MODULES[i]
                );
            } catch (e) {
                loaderError(
                    "MODULE_ERROR",
                    e.message,
                    MODULES[i][1]
                );
            }
        }

        finish();
    }

    /* -----------------------------------------------------
       START MODULES
    ----------------------------------------------------- */

    function startModules() {

        setTimeout(function () {

            try {
                if (
                    typeof window.loadBookings ===
                    "function"
                ) {
                    window.loadBookings();
                }
            } catch (e) {
                loaderError(
                    "BOOKINGS_START",
                    e.message,
                    "js/bookings.js"
                );
            }

        }, 100);

        setTimeout(function () {

            try {
                if (
                    typeof window.updateDashboard ===
                    "function"
                ) {
                    window.updateDashboard();
                }
            } catch (e) {
                loaderError(
                    "DASHBOARD_START",
                    e.message,
                    "js/dashboard.js"
                );
            }

        }, 150);

        setTimeout(function () {

            try {
                if (
                    typeof window.updateRoomsPage ===
                    "function"
                ) {
                    window.updateRoomsPage();
                }
            } catch (e) {
                loaderError(
                    "ROOMS_START",
                    e.message,
                    "js/rooms.js"
                );
            }

        }, 200);

        setTimeout(function () {

            try {
                if (
                    typeof window.renderSettings ===
                    "function"
                ) {
                    window.renderSettings();
                }
            } catch (e) {
                loaderError(
                    "SETTINGS_START",
                    e.message,
                    "js/settings.js"
                );
            }

        }, 250);
    }

    /* -----------------------------------------------------
       FINISH
    ----------------------------------------------------- */

    function finish() {

        const loader =
            window.ROYAL_APP.loader;

        loader.finishedAt =
            new Date().toISOString();

        window.ROYAL_APP.ready = true;

        log("================================");
        log("LOADING COMPLETE");
        log("Loaded:", loader.loaded);
        log("Failed:", loader.failed);
        log("================================");

        /* Health */
        setTimeout(function () {

            try {
                if (
                    typeof window.updateAppHealth ===
                    "function"
                ) {
                    window.updateAppHealth();
                }
            } catch (e) {
                console.error(e);
            }

        }, 50);

        /* Ready event */
        try {

            window.dispatchEvent(
                new CustomEvent(
                    "royalAppReady",
                    {
                        detail: loader
                    }
                )
            );

            document.dispatchEvent(
                new CustomEvent(
                    "royalAppReady",
                    {
                        detail: loader
                    }
                )
            );

        } catch (e) {
            console.error(e);
        }

        /* Start application */
        startModules();

        /* Final Error Center check */
        setTimeout(function () {

            try {

                if (
                    typeof window.startErrorMonitor ===
                    "function"
                ) {

                    window.startErrorMonitor();

                    log(
                        "Error Center verified."
                    );
                }

            } catch (e) {

                loaderError(
                    "ERROR_CENTER",
                    e.message,
                    "js/error-monitor.js"
                );
            }

        }, 400);
    }

    /* -----------------------------------------------------
       PUBLIC STATUS
    ----------------------------------------------------- */

    window.getRoyalLoaderStatus =
        function () {

            const loader =
                window.ROYAL_APP.loader;

            return {
                version: VERSION,
                ready:
                    window.ROYAL_APP.ready,
                loaded:
                    loader.loaded.slice(),
                failed:
                    loader.failed.slice(),
                startedAt:
                    loader.startedAt,
                finishedAt:
                    loader.finishedAt
            };
        };

    /* -----------------------------------------------------
       MANUAL MODULE LOAD
    ----------------------------------------------------- */

    window.loadRoyalModule =
        function (file, name) {

            return loadModule([
                name || file,
                file,
                false
            ]);
        };

    /* -----------------------------------------------------
       RELOAD
    ----------------------------------------------------- */

    window.reloadRoyalApp =
        function () {
            window.location.reload();
        };

    /* -----------------------------------------------------
       START
    ----------------------------------------------------- */

    function startLoader() {

        if (
            window.ROYAL_APP.loaderStarted
        ) {
            return;
        }

        window.ROYAL_APP.loaderStarted =
            true;

        log(
            "Starting Royal Palace App..."
        );

        loadAll().catch(
            function (error) {

                loaderError(
                    "CENTRAL_LOADER",
                    error.message,
                    "js/app-loader.js"
                );

                /* Error Center fallback */

                try {
                    if (
                        typeof window
                            .startErrorMonitor ===
                        "function"
                    ) {
                        window.startErrorMonitor();
                    }
                } catch (e) {
                    console.error(e);
                }
            }
        );
    }

    window.startRoyalAppLoader =
        startLoader;

    /* -----------------------------------------------------
       START NOW
    ----------------------------------------------------- */

    startLoader();

})();
