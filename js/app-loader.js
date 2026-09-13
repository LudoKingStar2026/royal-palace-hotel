/* =========================================================
   ROYAL PALACE HOTEL
   CENTRAL APP LOADER
   VERSION 6.0
   ========================================================= */

(function () {
    "use strict";

    if (window.__ROYAL_LOADER_STARTED__) {
        return;
    }

    window.__ROYAL_LOADER_STARTED__ = true;

    const VERSION = "6.0";

    const MODULES = [
        ["App Core", "js/app-core.js"],
        ["Error Monitor", "js/error-monitor.js"],
        ["Mobile Menu", "js/menu.js"],
        ["Dashboard", "js/dashboard.js"],
        ["Rooms", "js/rooms.js"],
        ["Bookings", "js/bookings.js"],
        ["Settings", "js/settings.js"]
    ];

    window.ROYAL_APP = window.ROYAL_APP || {};

    window.ROYAL_APP.loader = {
        version: VERSION,
        modules: [],
        loaded: [],
        failed: [],
        startedAt: new Date().toISOString(),
        finishedAt: null
    };

    window.ROYAL_APP.ready = false;

    function log() {
        console.log(
            "[ROYAL PALACE]",
            ...arguments
        );
    }

    function reportError(type, message, source) {
        console.error(
            "[ROYAL ERROR]",
            type,
            message,
            source || ""
        );

        try {
            if (typeof window.reportAppError === "function") {
                window.reportAppError(
                    type,
                    message,
                    source || "app-loader.js"
                );
            }
        } catch (e) {}
    }

    function loadScript(name, file) {
        return new Promise(function (resolve) {

            const existing = document.querySelector(
                'script[data-royal-module="' + file + '"]'
            );

            if (existing) {
                if (!window.ROYAL_APP.loader.loaded.includes(name)) {
                    window.ROYAL_APP.loader.loaded.push(name);
                }

                resolve(true);
                return;
            }

            log("Loading:", name, file);

            const script = document.createElement("script");

            script.type = "text/javascript";
            script.async = false;
            script.src = file + "?v=6.0";

            script.dataset.royalModule = file;
            script.dataset.moduleName = name;

            script.onload = function () {

                log("Loaded:", name);

                window.ROYAL_APP.loader.loaded.push(name);

                if (
                    name === "Error Monitor" &&
                    typeof window.startErrorMonitor === "function"
                ) {
                    try {
                        window.startErrorMonitor();
                    } catch (e) {
                        reportError(
                            "ERROR_MONITOR",
                            e.message,
                            file
                        );
                    }
                }

                resolve(true);
            };

            script.onerror = function () {

                console.error(
                    "FAILED:",
                    name,
                    file
                );

                window.ROYAL_APP.loader.failed.push({
                    name: name,
                    file: file
                });

                reportError(
                    "MODULE_LOAD_ERROR",
                    name + " load नहीं हो सकी",
                    file
                );

                resolve(false);
            };

            document.head.appendChild(script);
        });
    }

    async function loadAllModules() {

        log("==============================");
        log("ROYAL PALACE HOTEL");
        log("CENTRAL LOADER V" + VERSION);
        log("==============================");

        for (let i = 0; i < MODULES.length; i++) {

            const module = MODULES[i];

            window.ROYAL_APP.loader.modules.push({
                name: module[0],
                file: module[1]
            });

            try {
                await loadScript(
                    module[0],
                    module[1]
                );
            } catch (error) {

                reportError(
                    "MODULE_EXCEPTION",
                    error.message,
                    module[1]
                );
            }
        }

        finishLoader();
    async function startFunctions() {

    /*
     * BOOKINGS
     * पहले booking load पूरा होने दें।
     * अगर bookings.js पहले से loading कर रहा है,
     * तो royalBookingsLoaded event का इंतजार करेंगे।
     */

    let bookingLoaded = false;

    const bookingReady = new Promise(function (resolve) {

        function done() {

            if (bookingLoaded) {
                return;
            }

            bookingLoaded = true;

            window.removeEventListener(
                "royalBookingsLoaded",
                done
            );

            resolve(true);
        }

        window.addEventListener(
            "royalBookingsLoaded",
            done,
            {
                once: true
            }
        );

        /*
         * अगर bookings पहले ही loaded हो चुका है
         * तो event का इंतजार करने की जरूरत नहीं।
         */
        try {

            if (
                typeof window.getBookings ===
                "function"
            ) {

                const current =
                    window.getBookings();

                if (
                    Array.isArray(current) &&
                    window.ROYAL_APP &&
                    window.ROYAL_APP.ready
                ) {
                    done();
                }

            }

        } catch (e) {
            console.warn(
                "Booking ready check:",
                e
            );
        }

    });

    try {

        if (
            typeof window.loadBookings ===
            "function"
        ) {

            window.loadBookings();

        }

    } catch (e) {

        reportError(
            "BOOKINGS",
            e.message,
            "bookings.js"
        );

    }

    /*
     * Booking event का इंतजार।
     */
    await Promise.race([
        bookingReady,
        new Promise(function (resolve) {

            setTimeout(
                resolve,
                10000
            );

        })
    ]);


    /*
     * DASHBOARD
     * अब booking data उपलब्ध होने के बाद
     * dashboard को update करें।
     */

    try {

        if (
            typeof window.updateDashboard ===
            "function"
        ) {

            window.updateDashboard();

        }

    } catch (e) {

        reportError(
            "DASHBOARD",
            e.message,
            "dashboard.js"
        );

    }


    /*
     * ROOMS
     */

    try {

        if (
            typeof window.updateRoomsPage ===
            "function"
        ) {

            window.updateRoomsPage();

        }

    } catch (e) {

        reportError(
            "ROOMS",
            e.message,
            "rooms.js"
        );

    }


    /*
     * SETTINGS
     */

    try {

        if (
            typeof window.renderSettings ===
            "function"
        ) {

            window.renderSettings();

        }

    } catch (e) {

        reportError(
            "SETTINGS",
            e.message,
            "settings.js"
        );

    }

    }
       
    function finishLoader() {

        window.ROYAL_APP.loader.finishedAt =
            new Date().toISOString();

        window.ROYAL_APP.ready = true;

        log(
            "Loaded:",
            window.ROYAL_APP.loader.loaded
        );

        log(
            "Failed:",
            window.ROYAL_APP.loader.failed
        );

        try {
            window.dispatchEvent(
                new CustomEvent(
                    "royalAppReady",
                    {
                        detail: window.ROYAL_APP.loader
                    }
                )
            );
        } catch (e) {}

        startFunctions();

        setTimeout(function () {

            try {
                if (
                    typeof window.startErrorMonitor ===
                    "function"
                ) {
                    window.startErrorMonitor();
                }
            } catch (e) {
                reportError(
                    "ERROR_CENTER",
                    e.message,
                    "error-monitor.js"
                );
            }

        }, 500);

        setTimeout(function () {

            try {
                if (
                    typeof window.updateAppHealth ===
                    "function"
                ) {
                    window.updateAppHealth();
                }
            } catch (e) {}

        }, 700);
    }

    window.getRoyalLoaderStatus = function () {

        return {
            version: VERSION,
            ready: window.ROYAL_APP.ready,
            loaded:
                window.ROYAL_APP.loader.loaded.slice(),
            failed:
                window.ROYAL_APP.loader.failed.slice(),
            modules:
                window.ROYAL_APP.loader.modules.slice()
        };
    };

    window.loadRoyalModule = function (
        file,
        name
    ) {
        return loadScript(
            name || file,
            file
        );
    };

    window.reloadRoyalApp = function () {
        window.location.reload();
    };

    function start() {

        if (window.__ROYAL_LOADER_RUNNING__) {
            return;
        }

        window.__ROYAL_LOADER_RUNNING__ = true;

        loadAllModules().catch(function (error) {

            reportError(
                "CENTRAL_LOADER",
                error.message,
                "app-loader.js"
            );

        });
    }

    window.startRoyalAppLoader = start;

    /*
       IMPORTANT:
       Loader admin.html के बिल्कुल अंत में है,
       इसलिए DOM पहले से उपलब्ध है।
    */

    start();

})();
