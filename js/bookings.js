/* =========================================================
   ROYAL PALACE HOTEL
   SUPABASE BOOKING MANAGEMENT + DEBUG SYSTEM
========================================================= */

(function () {

    "use strict";

    /* =====================================================
       SUPABASE CONFIG
    ===================================================== */

    const SUPABASE_URL =
        "https://mvvfqkcgaxcipjkiyuae.supabase.co";

    const SUPABASE_KEY =
        "sb_publishable_YbyO8KHdQxXyv6afqJZfWg_Eu2aw57x";

    const TABLE_NAME = "bookings";

    const REQUEST_TIMEOUT = 15000;

    let supabaseClient = null;

    let allBookings = [];
    let filteredBookings = [];

    let currentSearch = "";
    let currentStatus = "all";

    let lastErrorText = "";


    /* =====================================================
       SUPABASE INITIALIZATION
    ===================================================== */

    function initSupabase() {

        try {

            if (!window.supabase) {

                showBookingError(
                    "SUPABASE LIBRARY LOAD FAILED",
                    "Supabase JavaScript library page पर load नहीं हुई।",
                    "window.supabase नहीं मिला।",
                    "Check करें कि admin.html में Supabase CDN script मौजूद है।"
                );

                return false;
            }

            supabaseClient =
                window.supabase.createClient(
                    SUPABASE_URL,
                    SUPABASE_KEY
                );

            return true;

        } catch (error) {

            console.error(
                "Supabase initialization error:",
                error
            );

            showBookingError(
                "SUPABASE INITIALIZATION ERROR",
                "Supabase client start नहीं हो पाया।",
                error.message || String(error),
                "Supabase URL और Publishable Key check करें।"
            );

            return false;
        }
    }


    /* =====================================================
       HTML ESCAPE
    ===================================================== */

    function escapeHTML(value) {

        if (
            value === null ||
            value === undefined
        ) {
            return "";
        }

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    /* =====================================================
       MONEY
    ===================================================== */

    function money(value) {

        const number =
            Number(value || 0);

        return (
            "₹" +
            number.toLocaleString("en-IN")
        );
    }


    /* =====================================================
       DATE
    ===================================================== */

    function formatDate(value) {

        if (!value) {
            return "-";
        }

        const date =
            new Date(value);

        if (
            isNaN(
                date.getTime()
            )
        ) {
            return value;
        }

        return date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    }


    /* =====================================================
       STATUS CLASS
    ===================================================== */

    function getStatusClass(status) {

        const value =
            String(status || "")
                .toLowerCase();

        if (
            value === "confirmed"
        ) {
            return "confirmed";
        }

        if (
            value === "cancelled"
        ) {
            return "cancelled";
        }

        if (
            value === "pending"
        ) {
            return "pending";
        }

        return "pending";
    }


    /* =====================================================
       BOOKING ID
    ===================================================== */

    function getBookingId(booking) {

        return (
            booking.booking_id ||
            booking.id ||
            ""
        );
    }


    /* =====================================================
       REQUEST WITH TIMEOUT
    ===================================================== */

    async function runWithTimeout(
        promise,
        timeout
    ) {

        let timer;

        const timeoutPromise =
            new Promise(function (_, reject) {

                timer =
                    setTimeout(
                        function () {

                            reject(
                                new Error(
                                    "REQUEST_TIMEOUT: Supabase ने " +
                                    timeout +
                                    "ms के अंदर response नहीं दिया।"
                                )
                            );

                        },
                        timeout
                    );
            });

        try {

            return await Promise.race([
                promise,
                timeoutPromise
            ]);

        } finally {

            clearTimeout(timer);
        }
    }


    /* =====================================================
       LOAD BOOKINGS
    ===================================================== */

    async function loadBookings() {

        const container =
            document.getElementById(
                "bookingHistory"
            );

        if (!container) {
            return;
        }

        container.innerHTML = `
            <div class="loading-box">
                <div style="font-size:32px;margin-bottom:10px;">
                    ⏳
                </div>

                <strong>
                    Loading bookings...
                </strong>

                <p style="margin-top:8px;">
                    Supabase database से connection बनाया जा रहा है।
                </p>
            </div>
        `;


        /* -----------------------------------------------
           INIT
        ------------------------------------------------ */

        if (!supabaseClient) {

            const initialized =
                initSupabase();

            if (!initialized) {
                return;
            }
        }


        /* -----------------------------------------------
           DATABASE REQUEST
        ------------------------------------------------ */

        try {

            console.log(
                "Royal Palace: Loading bookings..."
            );

            console.log(
                "Supabase URL:",
                SUPABASE_URL
            );

            console.log(
                "Supabase table:",
                TABLE_NAME
            );


            const request =
                supabaseClient
                    .from(TABLE_NAME)
                    .select("*")
                    .order(
                        "checkin",
                        {
                            ascending: false
                        }
                    );


            const result =
                await runWithTimeout(
                    request,
                    REQUEST_TIMEOUT
                );


            /* -------------------------------------------
               SUPABASE ERROR
            -------------------------------------------- */

            if (result.error) {

                console.error(
                    "SUPABASE BOOKING ERROR:",
                    result.error
                );

                showBookingError(
                    "DATABASE QUERY ERROR",
                    result.error.message ||
                    "Bookings load नहीं हो सकीं।",
                    "Code: " +
                    (result.error.code || "N/A") +
                    " | Details: " +
                    (result.error.details || "N/A"),
                    getSuggestedFix(
                        result.error
                    )
                );

                return;
            }


            /* -------------------------------------------
               SUCCESS
            -------------------------------------------- */

            allBookings =
                Array.isArray(result.data)
                    ? result.data
                    : [];


            console.log(
                "Royal Palace: Bookings loaded successfully.",
                allBookings
            );


            applyFilters();

            updateDashboardStats();

        } catch (error) {

            console.error(
                "BOOKING LOAD EXCEPTION:",
                error
            );


            const message =
                error &&
                error.message
                    ? error.message
                    : String(error);


            if (
                message.includes(
                    "REQUEST_TIMEOUT"
                )
            ) {

                showBookingError(
                    "REQUEST TIMEOUT",
                    "Supabase से response समय पर नहीं आया।",
                    message,
                    "Internet connection और Supabase project status check करें।"
                );

            } else {

                showBookingError(
                    "JAVASCRIPT / NETWORK ERROR",
                    "Bookings request चलाते समय unexpected error आया।",
                    message,
                    "Browser network connection और Supabase configuration check करें।"
                );
            }
        }
    }


    /* =====================================================
       SUGGEST FIX
    ===================================================== */

    function getSuggestedFix(error) {

        const message =
            String(
                error &&
                error.message
                    ? error.message
                    : ""
            ).toLowerCase();

        const code =
            String(
                error &&
                error.code
                    ? error.code
                    : ""
            ).toLowerCase();


        if (
            code === "42501" ||
            message.includes("permission") ||
            message.includes("row-level security") ||
            message.includes("rls")
        ) {

            return (
                "RLS / Permission issue लगता है। " +
                "bookings table में anon role के लिए SELECT policy check करें।"
            );
        }


        if (
            message.includes("relation") &&
            message.includes("does not exist")
        ) {

            return (
                "bookings table नहीं मिल रही। " +
                "Supabase में table का नाम exactly 'bookings' check करें।"
            );
        }


        if (
            message.includes("column") &&
            message.includes("does not exist")
        ) {

            return (
                "Query में इस्तेमाल किया गया column database में नहीं मिला। " +
                "checkin column और बाकी booking columns check करें।"
            );
        }


        if (
            message.includes("fetch") ||
            message.includes("network")
        ) {

            return (
                "Network/CORS/Supabase connection check करें।"
            );
        }


        return (
            "Supabase table, RLS policies, API key और network connection check करें।"
        );
    }


    /* =====================================================
       APPLY FILTERS
    ===================================================== */

    function applyFilters() {

        const search =
            currentSearch
                .trim()
                .toLowerCase();


        filteredBookings =
            allBookings.filter(
                function (booking) {

                    const id =
                        String(
                            booking.booking_id || ""
                        ).toLowerCase();

                    const guest =
                        String(
                            booking.guest_name || ""
                        ).toLowerCase();

                    const room =
                        String(
                            booking.room || ""
                        ).toLowerCase();

                    const status =
                        String(
                            booking.status || ""
                        ).toLowerCase();


                    const searchMatch =
                        !search ||
                        id.includes(search) ||
                        guest.includes(search) ||
                        room.includes(search);


                    const statusMatch =
                        currentStatus === "all" ||
                        status ===
                        currentStatus.toLowerCase();


                    return (
                        searchMatch &&
                        statusMatch
                    );
                }
            );


        renderBookings();
    }


    /* =====================================================
       SEARCH
    ===================================================== */

    window.searchBookings =
        function (value) {

            currentSearch =
                value || "";

            applyFilters();
        };


    /* =====================================================
       STATUS FILTER
    ===================================================== */

    window.filterBookings =
        function (value) {

            currentStatus =
                value || "all";

            applyFilters();
        };


    /* =====================================================
       RENDER BOOKINGS
    ===================================================== */

    function renderBookings() {

        const container =
            document.getElementById(
                "bookingHistory"
            );

        if (!container) {
            return;
        }


        /* -----------------------------------------------
           EMPTY
        ------------------------------------------------ */

        if (!filteredBookings.length) {

            if (!allBookings.length) {

                container.innerHTML = `
                    <div class="empty-bookings">

                        <div class="empty-icon">
                            📅
                        </div>

                        <h3>
                            No Bookings Found
                        </h3>

                        <p>
                            Supabase में अभी कोई booking record नहीं मिला।
                        </p>

                    </div>
                `;

            } else {

                container.innerHTML = `
                    <div class="empty-bookings">

                        <div class="empty-icon">
                            🔎
                        </div>

                        <h3>
                            No Matching Bookings
                        </h3>

                        <p>
                            Search या status filter बदलकर फिर कोशिश करें।
                        </p>

                    </div>
                `;
            }

            return;
        }


        /* -----------------------------------------------
           TABLE
        ------------------------------------------------ */

        let html = `

            <div class="booking-count">

                Showing
                <strong>
                    ${filteredBookings.length}
                </strong>

                of

                <strong>
                    ${allBookings.length}
                </strong>

                bookings

            </div>


            <div class="booking-table-wrap">

                <table class="booking-table">

                    <thead>

                        <tr>

                            <th>Booking ID</th>
                            <th>Guest</th>
                            <th>Room</th>
                            <th>Guests</th>
                            <th>Check-in</th>
                            <th>Check-out</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Action</th>

                        </tr>

                    </thead>

                    <tbody>
        `;


        filteredBookings.forEach(
            function (booking) {

                const bookingId =
                    getBookingId(booking);

                const guest =
                    booking.guest_name ||
                    "-";

                const room =
                    booking.room ||
                    "-";

                const guests =
                    booking.guests ||
                    0;

                const checkin =
                    formatDate(
                        booking.checkin
                    );

                const checkout =
                    formatDate(
                        booking.checkout
                    );

                const total =
                    money(
                        booking.total
                    );

                const status =
                    booking.status ||
                    "Pending";

                const statusClass =
                    getStatusClass(
                        status
                    );


                const safeId =
                    escapeHTML(
                        bookingId
                    );


                html += `

                    <tr>

                        <td>

                            <strong class="booking-id">

                                ${safeId}

                            </strong>

                        </td>


                        <td>

                            <div class="guest-cell">

                                <strong>

                                    ${escapeHTML(
                                        guest
                                    )}

                                </strong>

                            </div>

                        </td>


                        <td>

                            ${escapeHTML(
                                room
                            )}

                        </td>


                        <td>

                            ${escapeHTML(
                                guests
                            )}

                        </td>


                        <td>

                            ${escapeHTML(
                                checkin
                            )}

                        </td>


                        <td>

                            ${escapeHTML(
                                checkout
                            )}

                        </td>


                        <td>

                            <strong>

                                ${escapeHTML(
                                    total
                                )}

                            </strong>

                        </td>


                        <td>

                            <span
                                class="status-badge ${statusClass}">

                                ${escapeHTML(
                                    status
                                )}

                            </span>

                        </td>


                        <td>

                            <div class="booking-action">

                                <button
                                    class="booking-action-btn"
                                    onclick="toggleBookingMenu('${safeId}')">

                                    ⋮

                                </button>
          
