/* =========================================================
   ROYAL PALACE HOTEL
   CENTRAL APPLICATION CORE
   VERSION: 1.0
   ========================================================= */

(function () {
    "use strict";

    /* =====================================================
       APP CONFIGURATION
    ===================================================== */

    const APP_VERSION = "1.0";

    const SUPABASE_URL =
        "https://mvvfqkcgaxcipjkiyuae.supabase.co";

    const SUPABASE_KEY =
        "sb_publishable_YbyO8KHdQxXyv6afqJZfWg_Eu2aw57x";

    window.ROYAL_APP = window.ROYAL_APP || {};

    window.ROYAL_APP.core = {
        version: APP_VERSION,
        supabaseUrl: SUPABASE_URL,
        supabaseKey: SUPABASE_KEY,
        connected: false,
        started: false,
        errors: [],
        modules: {}
    };

    /* =====================================================
       SYSTEM LOG
    ===================================================== */

    window.royalLog = function (message, data) {

        console.log(
            "[ROYAL PALACE]",
            message,
            data || ""
        );
    };

    /* =====================================================
       ERROR REGISTRATION
    ===================================================== */

    window.reportAppError = function (
        type,
        message,
        source,
        extra
    ) {

        const error = {

            id:
                "ERR-" +
                Date.now(),

            type:
                type || "UNKNOWN_ERROR",

            message:
                message || "Unknown error",

            source:
                source || "Unknown",

            extra:
                extra || "",

            time:
                new Date().toLocaleString("en-IN")
        };

        window.ROYAL_APP.core.errors.push(
            error
        );

        console.error(
            "ROYAL PALACE ERROR:",
            error
        );

        /*
         * Error Monitor मौजूद हो तो
         * उसे तुरंत notification भेजेंगे।
         */
        if (
            typeof window.onRoyalAppError ===
            "function"
        ) {

            try {

                window.onRoyalAppError(
                    error
                );

            } catch (monitorError) {

                console.error(
                    "Error Monitor failed:",
                    monitorError
                );
            }
        }

        return error;
    };

    /* =====================================================
       MODULE STATUS
    ===================================================== */

    window.registerRoyalModule =
        function (
            moduleName,
            status,
            details
        ) {

            window.ROYAL_APP.core.modules[
                moduleName
            ] = {

                status:
                    status || "unknown",

                details:
                    details || "",

                time:
                    new Date().toLocaleString(
                        "en-IN"
                    )
            };

            royalLog(
                "Module status:",
                moduleName +
                " → " +
                status
            );

            if (
                typeof window.updateAppHealth ===
                "function"
            ) {

                window.updateAppHealth();
            }
        };

    /* =====================================================
       SAFE FETCH
    ===================================================== */

    window.royalFetch =
        async function (
            url,
            options = {},
            timeout = 10000
        ) {

            const controller =
                new AbortController();

            const timer =
                setTimeout(
                    function () {

                        controller.abort();

                    },
                    timeout
                );

            try {

                const response =
                    await fetch(
                        url,
                        {
                            ...options,
                            signal:
                                controller.signal
                        }
                    );

                const text =
                    await response.text();

                if (
                    !response.ok
                ) {

                    let errorText =
                        text;

                    try {

                        const json =
                            JSON.parse(
                                text
                            );

                        errorText =
                            json.message ||
                            json.error_description ||
                            json.error ||
                            text;

                    } catch (e) {}

                    const error =
                        new Error(
                            "HTTP " +
                            response.status +
                            " " +
                            response.statusText +
                            " — " +
                            errorText
                        );

                    error.status =
                        response.status;

                    error.responseText =
                        text;

                    throw error;
                }

                if (!text) {

                    return null;
                }

                try {

                    return JSON.parse(
                        text
                    );

                } catch (e) {

                    return text;
                }

            } finally {

                clearTimeout(
                    timer
                );
            }
        };

    /* =====================================================
       SUPABASE HEADERS
    ===================================================== */

    window.getSupabaseHeaders =
        function () {

            return {

                "apikey":
                    SUPABASE_KEY,

                "Authorization":
                    "Bearer " +
                    SUPABASE_KEY,

                "Accept":
                    "application/json",

                "Content-Type":
                    "application/json"
            };
        };

    /* =====================================================
       SUPABASE TEST
    ===================================================== */

    window.testSupabase =
        async function () {

            royalLog(
                "Testing Supabase connection..."
            );

            registerRoyalModule(
                "Supabase",
                "checking"
            );

            try {

                const result =
                    await royalFetch(

                        SUPABASE_URL +
                        "/rest/v1/bookings?select=booking_id&limit=1",

                        {
                            method: "GET",

                            headers:
                                getSupabaseHeaders()
                        },

                        10000
                    );

                window.ROYAL_APP.core.connected =
                    true;

                registerRoyalModule(
                    "Supabase",
                    "connected",
                    "Database API is responding."
                );

                royalLog(
                    "Supabase connected successfully."
                );

                return {
                    success: true,
                    data: result
                };

            } catch (error) {

                window.ROYAL_APP.core.connected =
                    false;

                registerRoyalModule(
                    "Supabase",
                    "error",
                    error.message
                );

                reportAppError(
                    "SUPABASE_CONNECTION_ERROR",
                    error.message,
                    "app-core.js",
                    error.responseText || ""
                );

                return {
                    success: false,
                    error: error
                };
            }
        };

    /* =====================================================
       APP HEALTH
    ===================================================== */

    window.getAppHealth =
        function () {

            const modules =
                window.ROYAL_APP
                    .core
                    .modules;

            const errors =
                window.ROYAL_APP
                    .core
                    .errors;

            const moduleNames =
                Object.keys(
                    modules
                );

            const failedModules =
                moduleNames.filter(
                    function (name) {

                        return (
                            modules[name]
                                .status ===
                            "error"
                        );
                    }
                );

            return {

                version:
                    APP_VERSION,

                supabase:
                    window.ROYAL_APP
                        .core
                        .connected,

                modules:
                    modules,

                totalModules:
                    moduleNames.length,

                failedModules:
                    failedModules.length,

                errors:
                    errors,

                errorCount:
                    errors.length,

                healthy:
                    failedModules.length ===
                        0 &&
                    errors.length ===
                        0
            };
        };

    /* =====================================================
       HEALTH UPDATE
    ===================================================== */

    window.updateAppHealth =
        function () {

            const health =
                getAppHealth();

            console.log(
                "ROYAL PALACE SYSTEM HEALTH:",
                health
            );

            document.dispatchEvent(
                new CustomEvent(
                    "royalAppHealthChanged",
                    {
                        detail:
                            health
                    }
                )
            );

            return health;
        };

    /* =====================================================
       CLEAR ERRORS
    ===================================================== */

    window.clearAppErrors =
        function () {

            window.ROYAL_APP
                .core
                .errors = [];

            updateAppHealth();

            royalLog(
                "All application errors cleared."
            );
        };

    /* =====================================================
       GET ERRORS
    ===================================================== */

    window.getAppErrors =
        function () {

            return [
                ...window.ROYAL_APP
                    .core
                    .errors
            ];
        };

    /* =====================================================
       GLOBAL JAVASCRIPT ERROR
    ===================================================== */

    window.addEventListener(
        "error",
        function (event) {

            /*
             * खुद Error Center की
             * internal error को duplicate
             * नहीं करेंगे।
             */

            reportAppError(

                "JAVASCRIPT_ERROR",

                event.message ||
                    "Unknown JavaScript error",

                event.filename ||
                    "Unknown file",

                "Line: " +
                    (event.lineno || "?") +
                    ", Column: " +
                    (event.colno || "?")
            );
        }
    );

    /* =====================================================
       PROMISE ERROR
    ===================================================== */

    window.addEventListener(
        "unhandledrejection",
        function (event) {

            const reason =
                event.reason;

            reportAppError(

                "PROMISE_ERROR",

                reason?.message ||
                    String(
                        reason ||
                        "Unhandled Promise rejection"
                    ),

                "Unhandled Promise",

                ""
            );
        }
    );

    /* =====================================================
       APP START
    ===================================================== */

    function startCore() {

        if (
            window.ROYAL_APP
                .core
                .started
        ) {

            return;
        }

        window.ROYAL_APP
            .core
            .started = true;

        royalLog(
            "Central Core Started."
        );

        royalLog(
            "App Version:",
            APP_VERSION
        );

        registerRoyalModule(
            "App Core",
            "ready",
            "Central application core is running."
        );

        updateAppHealth();

        /*
         * Supabase को background में test करेंगे।
         * इससे बाकी UI block नहीं होगा।
         */

        testSupabase();
    }

    /* =====================================================
       START AFTER DOM
    ===================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            startCore
        );

    } else {

        startCore();
    }

})();
