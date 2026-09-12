/* =========================================================
   ROYAL PALACE HOTEL
   BOOKING MANAGEMENT - DEBUG VERSION
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

    const REQUEST_TIMEOUT = 10000;

    let allBookings = [];
    let filteredBookings = [];

    let currentSearch = "";
    let currentStatus = "all";


    /* =====================================================
       HELPERS
    ===================================================== */

    function escapeHTML(value) {

        if (value === null || value === undefined) {
            return "";
        }

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    function money(value) {

        const number = Number(value || 0);

        return "₹" +
            number.toLocaleString("en-IN");
    }


    function formatDate(value) {

        if (!value) {
            return "-";
        }

        const date = new Date(value);

        if (isNaN(date.getTime())) {
            return String(value);
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


    function getStatusClass(status) {

        const value =
            String(status || "")
                .toLowerCase();

        if (value === "confirmed") {
            return "confirmed";
        }

        if (value === "cancelled") {
            return "cancelled";
        }

        return "pending";
    }


    function getBookingId(booking) {

        return (
            booking.booking_id ||
            booking.id ||
            ""
        );
    }


    /* =====================================================
       ERROR DISPLAY
    ===================================================== */

    function showBookingError(
        title,
        message,
        details
    ) {

        const container =
            document.getElementById(
                "bookingHistory"
            );

        if (!container) {
            return;
        }

        container.innerHTML = `

            <div class="booking-error"
                 style="
                    margin:20px 0;
                    padding:24px;
                    border:2px solid #ef4444;
                    border-radius:16px;
                    background:#fff1f2;
                 ">

                <div
                    style="
                        font-size:36px;
                        margin-bottom:10px;
                    ">
                    ⚠️
                </div>

                <h3
                    style="
                        margin:0 0 10px;
                        color:#b91c1c;
                    ">
                    ${escapeHTML(title)}
                </h3>

                <p
                    style="
                        margin:0 0 12px;
                        color:#374151;
                        line-height:1.6;
                    ">
                    ${escapeHTML(message)}
                </p>

                ${
                    details
                    ?
                    `
                    <div
                        style="
                            margin-top:14px;
                            padding:14px;
                            border-radius:10px;
                            background:#111827;
                            color:#f9fafb;
                            font-family:monospace;
                            font-size:12px;
                            line-height:1.6;
                            overflow:auto;
                        ">
                        ${escapeHTML(details)}
                    </div>
                    `
                    :
                    ""
                }

                <button
                    class="primary-btn"
                    onclick="reloadBookings()"
                    style="
                        margin-top:16px;
                    ">
                    🔄 Retry
                </button>

            </div>
        `;
    }


    /* =====================================================
       LOAD BOOKINGS DIRECTLY FROM SUPABASE REST API
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
                Loading bookings...
            </div>

        `;


        console.log(
            "ROYAL PALACE: Starting booking request..."
        );


        const endpoint =
            SUPABASE_URL +
            "/rest/v1/" +
            TABLE_NAME +
            "?select=*";


        console.log(
            "ROYAL PALACE: Supabase URL:",
            endpoint
        );


        /* =================================================
           TIMEOUT CONTROLLER
        ================================================= */

        const controller =
            new AbortController();

        const timeout =
            setTimeout(function () {

                controller.abort();

            }, REQUEST_TIMEOUT);


        try {

            const response =
                await fetch(
                    endpoint,
                    {
                        method: "GET",

                        headers: {
                            "apikey":
                                SUPABASE_KEY,

                            "Authorization":
                                "Bearer " +
                                SUPABASE_KEY,

                            "Content-Type":
                                "application/json",

                            "Accept":
                                "application/json"
                        },

                        signal:
                            controller.signal
                    }
                );


            clearTimeout(timeout);


            console.log(
                "ROYAL PALACE: HTTP status:",
                response.status
            );


            const rawText =
                await response.text();


            console.log(
                "ROYAL PALACE: Response:",
                rawText
            );


            /* =============================================
               HTTP ERROR
            ============================================= */

            if (!response.ok) {

                let errorMessage =
                    rawText;

                try {

                    const errorJSON =
                        JSON.parse(rawText);

                    errorMessage =
                        errorJSON.message ||
                        errorJSON.error_description ||
                        errorJSON.hint ||
                        rawText;

                } catch (e) {

                    // Keep raw response
                }


                showBookingError(

                    "Supabase Database Error",

                    "Bookings database request failed.",

                    "HTTP STATUS: " +
                    response.status +
                    "\n\n" +
                    errorMessage

                );

                return;
            }


            /* =============================================
               EMPTY RESPONSE
            ============================================= */

            if (!rawText) {

                showBookingError(

                    "Empty Database Response",

                    "Supabase ने कोई data response नहीं दिया.",

                    "Endpoint:\n" +
                    endpoint

                );

                return;
            }


            /* =============================================
               PARSE JSON
            ============================================= */

            let data;

            try {

                data =
                    JSON.parse(rawText);

            } catch (parseError) {

                showBookingError(

                    "Invalid Database Response",

                    "Supabase से valid JSON response नहीं मिला.",

                    rawText

                );

                return;
            }


            /* =============================================
               DATA CHECK
            ============================================= */

            if (!Array.isArray(data)) {

                showBookingError(

                    "Unexpected Database Data",

                    "Supabase response array नहीं है.",

                    JSON.stringify(
                        data,
                        null,
                        2
                    )

                );

                return;
            }


            /* =============================================
               SUCCESS
            ============================================= */

            allBookings =
                data;

            console.log(
                "ROYAL PALACE: Bookings loaded:",
                allBookings.length
            );


            /* Newest first */

            allBookings.sort(
                function (a, b) {

                    const dateA =
                        new Date(
                            a.checkin || 0
                        ).getTime();

                    const dateB =
                        new Date(
                            b.checkin || 0
                        ).getTime();

                    return dateB - dateA;

                }
            );


            applyFilters();

            updateDashboardStats();


        } catch (error) {

            clearTimeout(timeout);


            console.error(
                "ROYAL PALACE BOOKING ERROR:",
                error
            );


            /* =============================================
               TIMEOUT
            ============================================= */

            if (
                error &&
                error.name ===
                "AbortError"
            ) {

                showBookingError(

                    "Database Request Timeout",

                    "Supabase ने 10 seconds के अंदर response नहीं दिया.",

                    "Possible causes:\n" +
                    "1. Network connection problem\n" +
                    "2. Supabase API problem\n" +
                    "3. RLS / database access problem\n" +
                    "4. Browser request blocked\n\n" +
                    "Supabase URL:\n" +
                    SUPABASE_URL

                );

                return;
            }


            /* =============================================
               NETWORK ERROR
            ============================================= */

            showBookingError(

                "Network / Connection Error",

                error &&
                error.message
                    ?
                    error.message
                    :
                    "Supabase से connection नहीं हो सका.",

                "Supabase URL:\n" +
                SUPABASE_URL +
                "\n\n" +
                "Table:\n" +
                TABLE_NAME

            );

        }

    }


    /* =====================================================
       FILTER
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
                            booking.booking_id ||
                            ""
                        ).toLowerCase();

                    const guest =
                        String(
                            booking.guest_name ||
                            ""
                        ).toLowerCase();

                    const room =
                        String(
                            booking.room ||
                            ""
                        ).toLowerCase();

                    const status =
                        String(
                            booking.status ||
                            ""
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

                            <strong
                                class="booking-id">

                                ${safeId}

                            </strong>

                        </td>


                        <td>

                            <div
                                class="guest-cell">

                                <strong>
                                    ${escapeHTML(
                                        guest
                                    )}
                                </strong>

                            </div>

                        </td>


                        <td>
                            ${escapeHTML(room)}
                        </td>


                        <td>
                            ${escapeHTML(guests)}
                        </td>


                        <td>
                            ${escapeHTML(checkin)}
                        </td>


                        <td>
                            ${escapeHTML(checkout)}
                        </td>


                        <td>

                            <strong>
                                ${escapeHTML(total)}
                            </strong>

                        </td>


                        <td>

                            <span
                                class="status-badge ${statusClass}">

                                ${escapeHTML(status)}

                            </span>

                        </td>


                        <td>

                            <div
                                class="booking-action">

                                <button
                                    class="booking-action-btn"
                                    onclick="toggleBookingMenu('${safeId}')">

                                    ⋮

                                </button>


                                <div
                                    id="bookingMenu-${safeId}"
                                    class="booking-
