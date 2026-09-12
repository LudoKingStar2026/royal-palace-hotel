/* =========================================================
   ROYAL PALACE HOTEL
   CENTRAL APP LOADER
   VERSION: 1.0
   ========================================================= */

(function () {
    "use strict";

    const APP_LOADER_VERSION = "1.0";

    /*
     * जिन modules को Admin Panel में चलाना है,
     * उनकी list सिर्फ यहीं maintain होगी।
     */
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

    window.ROYAL_APP = window.ROYAL_APP || {};

    window.ROYAL_APP.loader = {
        version: APP_LOADER_VERSION,
        modules: MODULES,
        loaded: [],
        failed: []
    };

    /* =====================================================
       LOAD ONE MODULE
       ===================================================== */

    function loadModule(module) {

        return new Promise(function (resolve) {

            /*
             * अगर file पहले से loaded है,
             * duplicate script नहीं लगाएंगे।
             */
            const existing =
                document.querySelector(
                    'script[data-royal-module="' +
                    module.file +
                    '"]'
                );

            if (existing) {

                window.ROYAL_APP.loader.loaded.push(
                    module.name
                );

                resolve(true);
                return;
            }

            const script =
                document.createElement("script");

            script.src =
                module.file +
                "?v=" +
                Date.now();

            script.async = false;

            script.dataset.royalModule =
                module.file;

            script.dataset.moduleName =
                module.name;

            /* =========================================
               SUCCESS
            ========================================= */

            script.onload = function () {

                console.log(
                    "✅ Royal Palace Module Loaded:",
                    module.name
                );

                window.ROYAL_APP.loader.loaded.push(
                    module.name
                );

                resolve(true);
            };

            /* =========================================
               ERROR
            ========================================= */

            script.onerror = function () {

                console.error(
                    "❌ Royal Palace Module Failed:",
                    module.name,
                    module.file
                );

                window.ROYAL_APP.loader.failed.push(
                    {
                        name: module.name,
                        file: module.file
                    }
                );

                /*
                 * Error Monitor मौजूद हो तो
                 * उसे error भेजेंगे।
                 */
                if (
                    typeof window.reportAppError ===
                    "function"
                ) {

                    window.reportAppError(
                        "MODULE_LOAD_ERROR",
                        module.name +
                        " load नहीं हो सकी।",
                        module.file
                    );
                }

                resolve(false);
            };

            document.head.appendChild(script);
        });
    }

    /* =====================================================
       LOAD ALL MODULES
    ===================================================== */

    async function loadAllModules() {

        console.log(
            "===================================="
        );

        console.log(
            "ROYAL PALACE CENTRAL APP LOADER"
        );

        console.log(
            "Version:",
            APP_LOADER_VERSION
        );

        console.log(
            "Starting module loading..."
        );

        console.log(
            "===================================="
        );

        for (
            let i = 0;
            i < MODULES.length;
            i++
        ) {

            await loadModule(
                MODULES[i]
            );
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

        console.log(
            "===================================="
        );

        console.log(
            "ROYAL PALACE APP LOADING COMPLETE"
        );

        console.log(
            "Loaded:",
            loaded
        );

        console.log(
            "Failed:",
            failed
        );

        console.log(
            "===================================="
        );

        window.ROYAL_APP.ready = true;

        /*
         * Custom event
         * बाकी system इससे पता लगा सकता है
         * कि सभी modules load हो चुके हैं।
         */
        document.dispatchEvent(
            new CustomEvent(
                "royalAppReady",
                {
                    detail:
                        window.ROYAL_APP.loader
                }
            )
        );

        /*
         * Error Monitor को final status भेजना।
         */
        if (
            typeof window.updateAppHealth ===
            "function"
        ) {

            window.updateAppHealth();
        }
    }

    /* =====================================================
       PUBLIC RELOAD
    ===================================================== */

    window.reloadRoyalApp =
        function () {

            console.log(
                "🔄 Reloading Royal Palace App..."
            );

            window.location.reload();
        };

    /* =====================================================
       START
    ===================================================== */

    function startLoader() {

        /*
         * Loader खुद दोबारा execute न हो।
         */
        if (
            window.ROYAL_APP.loaderStarted
        ) {
            return;
        }

        window.ROYAL_APP.loaderStarted =
            true;

        loadAllModules();
    }

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            startLoader
        );

    } else {

        startLoader();
    }

})();
