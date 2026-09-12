/* =========================================================
   ROYAL PALACE HOTEL
   CENTRAL APP LOADER
   VERSION: 3.0
   ========================================================= */

(function () {
    "use strict";

    const APP_LOADER_VERSION = "3.0";

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

    window.ROYAL_APP =
        window.ROYAL_APP || {};

    window.ROYAL_APP.loader = {
        version: APP_LOADER_VERSION,
        modules: MODULES,
        loaded: [],
        failed: [],
        startedAt:
            new Date().toISOString(),
        finishedAt: null
    };

    window.ROYAL_APP.loaderStarted =
        false;

    window.ROYAL_APP.ready =
        false;

    /* =====================================================
       LOG
    ===================================================== */

    function loaderLog(message, data) {

        if (
            typeof data !== "undefined"
        ) {
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

            try {

                window.reportAppError(
                    type,
                    message,
                    source ||
                        "js/app-loader.js",
                    extra || {}
                );

            } catch (error) {

                console.error(
                    "Error reporting loader error:",
                    error
                );
            }
        }
    }

    /* =====================================================
       LOAD ONE MODULE
    ===================================================== */

    function loadModule(module) {

        return new Promise(
            function (resolve) {

                if (
                    !module ||
                    !module.file
                ) {
                    resolve(false);
                    return;
                }

                loaderLog(
                    "Loading:",
                    module.name
                );

                /*
                 * Prevent duplicate loading.
                 */

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
                        !window.ROYAL_APP
                            .loader
                            .loaded
                            .includes(
                                module.name
                            )
                    ) {

                        window.ROYAL_APP
                            .loader
                            .loaded
                            .push(
                                module.name
                            );
                    }

                    resolve(true);
                    return;
                }

                const script =
                    document.createElement(
                        "script"
                    );

                /*
                 * Cache-busting ensures GitHub Pages
                 * does not keep an old JS version.
                 */

                script.src =
                    module.file +
                    "?v=" +
                    Date.now();

                /*
                 * IMPORTANT:
                 * Keep execution ordered.
                 */

                script.async = false;

                script.dataset.royalModule =
                    module.file;

                script.dataset.moduleName =
                    module.name;

                script.onload =
                    function () {

                        loaderLog(
                            "✅ Loaded:",
                            module.name
                        );

                        if (
                            !window.ROYAL_APP
                                .loader
                                .loaded
                                .includes(
                                    module.name
                                )
                        ) {

                            window.ROYAL_APP
                                .loader
                                .loaded
                                .push(
                                    module.name
                                );
                        }

                        /*
                         * Special startup hook.
                         *
                         * This allows modules that were
                         * dynamically loaded after the
                         * DOM event to initialize correctly.
                         */

                        try {

                            if (
                                module.name ===
                                "Error Monitor"
                            ) {

                                if (
                                    typeof window
                                        .startErrorMonitor ===
                                    "function"
                                ) {

                                    window
                                        .startErrorMonitor();
                                }

                            }

                        } catch (error) {

                            reportLoaderError(
                                "MODULE_INIT_ERROR",
                                module.name +
                                    " initialization failed.",
                                module.file,
                                {
                                    error:
                                        String(
                                            error
                                        )
                                }
                            );
                        }

                        resolve(true);
                    };

                script.onerror =
                    function () {

                        console.error(
                            "❌ Module failed:",
                            module.name,
                            module.file
                        );

                        window.ROYAL_APP
                            .loader
                            .failed
                            .push({
                                name:
                                    module.name,

                                file:
                                    module.file,

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

                        resolve(false);
                    };

                document.head.appendChild(
                    script
                );
            }
        );
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

        for (
            let i = 0;
            i < MODULES.length;
            i++
        ) {

            const module =
                MODULES[i];

            try {

                await loadModule(
                    module
                );

            } catch (error) {

                console.error(
                    "❌ Unexpected module error:",
                    module.name,
                    error
                );

                window.ROYAL_APP
                    .loader
                    .failed
                    .push({
                        name:
                            module.name,

                        file:
                            module.file,

                        required:
                            module.required,

                        error:
                            String(
                                error
                            )
                    });

                reportLoaderError(
                    "MODULE_RUNTIME_ERROR",
                    module.name +
                        " में unexpected error आया।",
                    module.file,
                    {
                        error:
                            String(
                                error
                            )
                    }
                );
            }
        }

        finishLoading();
    }

    /* =====================================================
       FINISH LOADING
    ===================================================== */

    function finishLoading() {

        const loaded =
            window.ROYAL_APP
                .loader
                .loaded;

        const failed =
            window.ROYAL_APP
                .loader
                .failed;

        window.ROYAL_APP
            .loader
            .finishedAt =
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

        /*
         * App is now ready.
         */

        window.ROYAL_APP.ready =
            true;

        /*
         * Tell every module that
         * central loading is complete.
         */

        try {

            document.dispatchEvent(
                new CustomEvent(
                    "royalAppReady",
                    {
                        detail:
                            window
                                .ROYAL_APP
                                .loader
                    }
                )
            );

        } catch (error) {

            console.error(
                "Ready event error:",
                error
            );
        }

        /*
         * Update health system.
         */

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

        /* ================================================
           BOOKING START
        ================================================ */

        setTimeout(
            function () {

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
                                    String(
                                        error
                                    )
                            }
                        );
                    }
                }

            },
            100
        );

        /* ================================================
           DASHBOARD START
        ================================================ */

        setTimeout(
            function () {

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
                                    String(
                                        error
                                    )
                            }
                        );
                    }
                }

            },
            150
        );

        /* ================================================
           SETTINGS START
        ================================================ */

        setTimeout(
            function () {

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
                                    String(
                                        error
                                    )
                            }
                        );
                    }
                }

            },
            200
        );

        /* ================================================
           ROOMS START
        ================================================ */

        setTimeout(
            function () {

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
                                    String(
                                        error
                                    )
                            }
                        );
                    }
                }

            },
            250
        );
    }

    /* =====================================================
       RELOAD APP
    ===================================================== */

    window.reloadRoyalApp =
        function () {

            loaderLog(
                "🔄 Reloading Royal Palace App..."
            );

            window.location.reload();
        };

    /* =====================================================
       LOAD MODULE MANUALLY
    ===================================================== */

    window.loadRoyalModule =
        function (
            file,
            name
        ) {

            if (!file) {

                console.error(
                    "Royal module file missing."
                );

                return Promise.resolve(
                    false
                );
            }

            return loadModule({
                name:
                    name || file,

                file:
                    file,

                required:
                    false
            });
        };

    /* =====================================================
       LOADER STATUS
    ===================================================== */

    window.getRoyalLoaderStatus =
        function () {

            return {

                version:
                    APP_LOADER_VERSION,

                ready:
                    window.ROYAL_APP
                        .ready,

                loaded:
                    [
                        ...
                        window
                            .ROYAL_APP
                            .loader
                            .loaded
                    ],

                failed:
                    [
                        ...
                        window
                            .ROYAL_APP
                            .loader
                            .failed
                    ],

                startedAt:
                    window.ROYAL_APP
                        .loader
                        .startedAt,

                finishedAt:
                    window.ROYAL_APP
                        .loader
                        .finishedAt
            };
        };

    /* =====================================================
       START LOADER
    ===================================================== */

    function startLoader() {

        if (
            window.ROYAL_APP
                .loaderStarted
        ) {
            return;
        }

        window.ROYAL_APP
            .loaderStarted =
            true;

        /*
         * IMPORTANT FIX:
         *
         * Do NOT wait for DOMContentLoaded here.
         *
         * The loader itself is already included
         * in admin.html. Starting immediately means
         * dynamically loaded modules get a chance to
         * register their DOMContentLoaded handlers
         * before that event fires.
         */

        loadAllModules()
            .catch(
                function (error) {

                    co
