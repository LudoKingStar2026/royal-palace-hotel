/* =========================================================
   ROYAL PALACE HOTEL
   CENTRAL APP CORE
   VERSION: 7.0
   ========================================================= */

(function () {
    "use strict";

    const CORE_VERSION = "7.0";

    /* =====================================================
       SUPABASE CONFIG
    ===================================================== */

    const SUPABASE_URL =
        "https://mvvfqkcgaxcipjkiyuae.supabase.co";

    const SUPABASE_KEY =
        "sb_publishable_YbyO8KHdQxXyv6afqJZfWg_Eu2aw57x";
   
/* =====================================================
   ADMIN SUPABASE AUTH
===================================================== */

   window.ROYAL_ADMIN_AUTH = {
    storageKey: "royal_palace_admin_auth",
    session: null,
    user: null,
    accessToken: null
};
   window.getRoyalAdminSession = async function () {

    try {

       await window.loadRoyalSupabaseSDK();

        if (!window.supabase ||
            typeof window.supabase.createClient !== "function") {

            console.warn(
                "[ROYAL AUTH] Supabase SDK not available."
            );

            return null;
        }

        if (!window.ROYAL_ADMIN_AUTH.client) {

            window.ROYAL_ADMIN_AUTH.client =
                window.supabase.createClient(
                    SUPABASE_URL,
                    SUPABASE_KEY,
                    {
                        auth: {
                            storageKey:
                                "royal_palace_admin_auth",

                            persistSession: true,

                            autoRefreshToken: true,

                            detectSessionInUrl: true
                        }
                    }
                );
        }

        const client =
            window.ROYAL_ADMIN_AUTH.client;

        const result =
            await client.auth.getSession();

        if (result.error) {
            throw result.error;
        }

        const session =
            result.data &&
            result.data.session
                ? result.data.session
                : null;

        window.ROYAL_ADMIN_AUTH.session =
            session;

        window.ROYAL_ADMIN_AUTH.user =
            session ? session.user : null;

        window.ROYAL_ADMIN_AUTH.accessToken =
            session
                ? session.access_token
                : null;

        return session;

    } catch (error) {

        console.error(
            "[ROYAL AUTH] Session error:",
            error
        );

        window.ROYAL_ADMIN_AUTH.session = null;
        window.ROYAL_ADMIN_AUTH.user = null;
        window.ROYAL_ADMIN_AUTH.accessToken = null;

        return null;
    }
};

   window.getRoyalAdminAccessToken = async function () {

    const session =
        await window.getRoyalAdminSession();

    return session
        ? session.access_token
        : null;
};
   window.loadRoyalSupabaseSDK = function () {

    return new Promise(function (resolve) {

        if (
            window.supabase &&
            typeof window.supabase.createClient === "function"
        ) {
            resolve(true);
            return;
        }

        const existing =
            document.querySelector(
                'script[data-royal-supabase-sdk="1"]'
            );

        if (existing) {
            existing.addEventListener(
                "load",
                function () {
                    resolve(
                        !!(
                            window.supabase &&
                            typeof window.supabase.createClient ===
                                "function"
                        )
                    );
                },
                { once: true }
            );
            return;
        }

        const script =
            document.createElement("script");

        script.src =
            "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";

        script.async = true;

        script.setAttribute(
            "data-royal-supabase-sdk",
            "1"
        );

        script.onload = function () {
            resolve(
                !!(
                    window.supabase &&
                    typeof window.supabase.createClient ===
                        "function"
                )
            );
        };
       
  window.getRoyalAdminHeaders = async function () {

    const token =
        await window.getRoyalAdminAccessToken();

    return {
        "apikey": SUPABASE_KEY,

        "Authorization":
            "Bearer " +
            (token || SUPABASE_KEY),

        "Content-Type":
            "application/json",

        "Accept":
            "application/json"
    };
};

       window.isRoyalAdminLoggedIn = async function () {

    const session =
        await window.getRoyalAdminSession();

    return !!session;
};

       window.startRoyalAdminAuthListener = function () {

    try {

        if (!window.ROYAL_ADMIN_AUTH.client) {
            return;
        }

        window.ROYAL_ADMIN_AUTH.client.auth.onAuthStateChange(
            function (event, session) {

                window.ROYAL_ADMIN_AUTH.session =
                    session || null;

                window.ROYAL_ADMIN_AUTH.user =
                    session ? session.user : null;

                window.ROYAL_ADMIN_AUTH.accessToken =
                    session
                        ? session.access_token
                        : null;

                window.dispatchEvent(
                    new CustomEvent(
                        "royalAdminAuthChanged",
                        {
                            detail: {
                                event: event,
                                session: session
                            }
                        }
                    )
                );
            }
        );

    } catch (error) {

        console.error(
            "[ROYAL AUTH] Listener error:",
            error
        );
    }
};

       window.startRoyalAdminAuth = async function () {

    const session =
        await window.getRoyalAdminSession();

    if (window.ROYAL_ADMIN_AUTH.client) {
        window.startRoyalAdminAuthListener();
    }

    window.royalLog(
        "Admin authentication:",
        session
            ? "SIGNED IN"
            : "NOT SIGNED IN"
    );

    return session;
};
       
        script.onerror = function () {
            console.error(
                "[ROYAL AUTH] Supabase SDK load failed."
            );

            resolve(false);
        };

        document.head.appendChild(script);
    });
};

    /* =====================================================
       GLOBAL ROYAL APP
    ===================================================== */

    window.ROYAL_APP =
        window.ROYAL_APP || {};


    window.ROYAL_APP.core = {

        version: CORE_VERSION,

        supabaseUrl: SUPABASE_URL,

        supabaseKey: SUPABASE_KEY,

        connected: false,

        started: false,

        errors: [],

        modules: {}

    };


    /* =====================================================
       LOGGER
    ===================================================== */

    window.royalLog = function (
        message,
        data
    ) {

        if (data !== undefined) {

            console.log(
                "[ROYAL APP]",
                message,
                data
            );

        } else {

            console.log(
                "[ROYAL APP]",
                message
            );
        }
    };


    /* =====================================================
       ERROR REPORTING
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
                extra || {},

            time:
                new Date().toISOString()

        };


        window.ROYAL_APP.core.errors
            .push(error);


        console.error(
            "❌ Royal Palace Error:",
            error
        );


        /* ---------------------------------------------
           Keep only last 100 errors
        --------------------------------------------- */

        if (
            window.ROYAL_APP.core.errors.length >
            100
        ) {

            window.ROYAL_APP.core.errors =
                window.ROYAL_APP.core.errors
                    .slice(-100);

        }


        /* ---------------------------------------------
           Error Monitor callback
        --------------------------------------------- */

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
                    "Error Monitor callback failed:",
                    monitorError
                );
            }
        }


        /* ---------------------------------------------
           Health update
        --------------------------------------------- */

        if (
            typeof window.updateAppHealth ===
            "function"
        ) {

            try {

                window.updateAppHealth();

            } catch (healthError) {

                console.error(
                    "Health update failed:",
                    healthError
                );
            }
        }


        return error;
    };


    /* =====================================================
       REGISTER MODULE
    ===================================================== */

    window.registerRoyalModule =
        function (
            name,
            data
        ) {

            if (!name) {
                return;
            }


            window.ROYAL_APP.core.modules[
                name
            ] = {

                name:
                    name,

                loaded:
                    true,

                loadedAt:
                    new Date().toISOString(),

                data:
                    data || {}

            };


            window.royalLog(
                "Module registered:",
                name
            );


            if (
                typeof window.updateAppHealth ===
                "function"
            ) {

                window.updateAppHealth();
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

                "Content-Type":
                    "application/json",

                "Accept":
                    "application/json"

            };
        };


    /* =====================================================
       SAFE FETCH
    ===================================================== */

    window.royalFetch =
        async function (
            url,
            options,
            timeout
        ) {

            const controller =
                new AbortController();


            const requestTimeout =
                timeout || 15000;


            const timer =
                setTimeout(
                    function () {

                        controller.abort();

                    },
                    requestTimeout
                );


            try {

                const fetchOptions =
                    Object.assign(
                        {},
                        options || {},
                        {
                            signal:
                                controller.signal
                        }
                    );


                const response =
                    await fetch(
                        url,
                        fetchOptions
                    );


                clearTimeout(timer);


                return response;

            } catch (error) {

                clearTimeout(timer);


                if (
                    error &&
                    error.name ===
                    "AbortError"
                ) {

                    window.reportAppError(
                        "FETCH_TIMEOUT",
                        "Request timeout हो गया।",
                        url,
                        {
                            timeout:
                                requestTimeout
                        }
                    );

                } else {

                    window.reportAppError(
                        "FETCH_ERROR",
                        error &&
                        error.message
                            ? error.message
                            : "Network request failed.",
                        url
                    );

                }


                throw error;
            }
        };


    /* =====================================================
       TEST SUPABASE
    ===================================================== */

    window.testSupabase =
        async function () {

            window.royalLog(
                "Testing Supabase connection..."
            );


            const url =
                SUPABASE_URL +
                "/rest/v1/bookings" +
                "?select=booking_id" +
                "&limit=1";


            try {

                const response =
                    await window.royalFetch(
                        url,
                        {
                            method:
                                "GET",

                            headers:
                                window.getSupabaseHeaders()
                        },
                        15000
                    );


                if (
                    !response.ok
                ) {

                    let errorText =
                        "";


                    try {

                        errorText =
                            await response.text();

                    } catch (e) {

                        errorText =
                            "Unknown Supabase error.";

                    }


                    window.ROYAL_APP.core
                        .connected = false;


                    window.reportAppError(
                        "SUPABASE_HTTP_ERROR",
                        "Supabase ने HTTP " +
                        response.status +
                        " response दिया।",
                        "Supabase",
                        {
                            status:
                                response.status,

                            response:
                                errorText
                        }
                    );


                    window.dispatchEvent(
                        new CustomEvent(
                            "royalSupabaseStatus",
                            {
                                detail: {
                                    connected:
                                        false,

                                    status:
                                        response.status,

                                    error:
                                        errorText
                                }
                            }
                        )
                    );


                    return false;
                }


                const data =
                    await response.json();


                window.ROYAL_APP.core
                    .connected = true;


                window.ROYAL_APP.core
                    .supabaseTest =
                    {

                        success:
                            true,

                        testedAt:
                            new Date()
                                .toISOString(),

                        sample:
                            data

                    };


                window.royalLog(
                    "✅ Supabase connected."
                );


                window.dispatchEvent(
                    new CustomEvent(
                        "royalSupabaseStatus",
                        {
                            detail: {
                                connected:
                                    true,

                                status:
                                    response.status,

                                sample:
                                    data
                            }
                        }
                    )
                );


                if (
                    typeof window.updateAppHealth ===
                    "function"
                ) {

                    window.updateAppHealth();
                }


                return true;

            } catch (error) {

                window.ROYAL_APP.core
                    .connected = false;


                window.reportAppError(
                    "SUPABASE_CONNECTION_ERROR",
                    error &&
                    error.message
                        ? error.message
                        : "Supabase connection failed.",
                    "Supabase",
                    {
                        error:
                            String(error)
                    }
                );


                window.dispatchEvent(
                    new CustomEvent(
                        "royalSupabaseStatus",
                        {
                            detail: {
                                connected:
                                    false,

                                error:
                                    String(error)
                            }
                        }
                    )
                );


                return false;
            }
        };


    /* =====================================================
       APP HEALTH
    ===================================================== */

    window.getAppHealth =
        function () {

            const core =
                window.ROYAL_APP.core;


            const loader =
                window.ROYAL_APP.loader ||
                null;


            const failedModules =
                loader
                    ? loader.failed || []
                    : [];


            const loadedModules =
                loader
                    ? loader.loaded || []
                    : [];


            let status =
                "healthy";


            if (
                !core.connected
            ) {

                status =
                    "warning";
            }


            if (
                failedModules.length >
                0
            ) {

                status =
                    "error";
            }


            if (
                core.errors.length >
                0 &&
                status ===
                "healthy"
            ) {

                status =
                    "warning";
            }


            return {

                status:
                    status,

                coreVersion:
                    CORE_VERSION,

                supabase:
                    core.connected,

                loadedModules:
                    loadedModules,

                failedModules:
                    failedModules,

                errors:
                    core.errors,

                errorCount:
                    core.errors.length,

                timestamp:
                    new Date()
                        .toISOString()

            };
        };


    /* =====================================================
       UPDATE HEALTH
    ===================================================== */

    window.updateAppHealth =
        function () {

            const health =
                window.getAppHealth();


            window.ROYAL_APP.health =
                health;


            window.dispatchEvent(
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
       GET ERRORS
    ===================================================== */

    window.getAppErrors =
        function () {

            return [
                ...
                window.ROYAL_APP.core.errors
            ];
        };


    /* =====================================================
       CLEAR ERRORS
    ===================================================== */

    window.clearAppErrors =
        function () {

            window.ROYAL_APP.core.errors =
                [];


            window.updateAppHealth();


            window.royalLog(
                "Application error log cleared."
            );
        };


    /* =====================================================
       GLOBAL JAVASCRIPT ERROR
    ===================================================== */

    window.addEventListener(
        "error",
        function (event) {

            /*
             * Ignore harmless browser errors
             * without a useful source.
             */

            if (
                !event.message &&
                !event.filename
            ) {

                return;
            }


            window.reportAppError(
                "JAVASCRIPT_ERROR",

                event.message ||
                "JavaScript error",

                event.filename ||
                "Browser",

                {

                    line:
                        event.lineno,

                    column:
                        event.colno

                }
            );
        }
    );


    /* =====================================================
       UNHANDLED PROMISE
    ===================================================== */

    window.addEventListener(
        "unhandledrejection",
        function (event) {

            let message =
                "Unhandled Promise rejection.";


            if (
                event.reason
            ) {

                if (
                    event.reason.message
                ) {

                    message =
                        event.reason.message;

                } else {

                    message =
                        String(
                            event.reason
                        );
                }
            }


            window.reportAppError(
                "UNHANDLED_PROMISE",
                message,
                "Promise"
            );
        }
    );


    /* =====================================================
       START CORE
    ===================================================== */

    async function startCore() {

        if (
            window.ROYAL_APP.core.started
        ) {

            return;
        }


        window.ROYAL_APP.core.started =
            true;


        window.royalLog(
            "===================================="
        );

        window.royalLog(
            "ROYAL PALACE APP CORE"
        );

        window.royalLog(
            "Version:",
            CORE_VERSION
        );

        window.royalLog(
            "Starting..."
        );

        window.royalLog(
            "===================================="
        );


        window.registerRoyalModule(
            "App Core",
            {
                version:
                    CORE_VERSION
            }
        );


        /*
         * Supabase test
         *
         * इसे await करेंगे ताकि connection
         * status properly establish हो.
         */

        await window.testSupabase();


        window.updateAppHealth();


        window.royalLog(
            "App Core started."
        );
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
            startCore,
            {
                once: true
            }
        );

    } else {

        startCore();

    }

})();
