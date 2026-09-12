/* =========================================================
   ROYAL PALACE HOTEL
   BOOKING SYSTEM — CENTRAL CONNECTED VERSION
   VERSION: 7.0
   ========================================================= */

(function () {
    "use strict";

    /* =====================================================
       CONFIG
    ===================================================== */

    const SUPABASE_URL =
        "https://mvvfqkcgaxcipjkiyuae.supabase.co";

    const SUPABASE_KEY =
        "sb_publishable_YbyO8KHdQxXyv6afqJZfWg_Eu2aw57x";

    const TABLE_NAME = "bookings";
    const REQUEST_TIMEOUT = 10000;

    /* =====================================================
       STATE
    ===================================================== */

    const state = {
        bookings: [],
        search: "",
        status: "all",
        loaded: false,
        loading: false
    };

    window.__ROYAL_BOOKINGS_SCRIPT_LOADED__ = true;
    window.__ROYAL_BOOKINGS_VERSION__ = "7.0";

    /* =====================================================
       HELPERS
    ===================================================== */

    function getHistoryBox() {
        return document.getElementById("bookingHistory");
    }

    function escapeHTML(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function money(value) {
        const number = Number(value || 0);

        return "₹" + number.toLocaleString("en-IN");
    }

    function formatDate(value) {
        if (!value) return "-";

        const date = new Date(value);

        if (isNaN(date.getTime())) {
            return escapeHTML(value);
        }

        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    }

    function getBookingId(booking) {
        return String(
            booking.booking_id ||
            booking.id ||
            booking.bookingId ||
            ""
        );
    }

    function getStatusClass(status) {
        const value =
            String(status || "").toLowerCase();

        if (value === "confirmed") {
            return "confirmed";
        }

        if (value === "cancelled") {
            return "cancelled";
        }

        if (value === "pending") {
            return "pending";
        }

        return "pending";
    }

    function getGuestName(booking) {
        return (
            booking.guest_name ||
            booking.guestName ||
            "-"
        );
    }

    /* =====================================================
       ERROR REPORTING
    ===================================================== */

    function reportError(type, message, extra) {

        console.error(
            "[ROYAL BOOKINGS]",
            type,
            message,
            extra || ""
        );

        if (
            typeof window.reportAppError ===
            "function"
        ) {
            window.reportAppError(
                type,
                message,
                "js/bookings.js",
                extra || {}
            );
        }
    }

    /* =====================================================
       LOADING UI
    ===================================================== */

    function showLoading(message) {

        const box = getHistoryBox();

        if (!box) return;

        box.innerHTML = `
            <div class="loading-box"
                 style="
                    padding:45px;
                    text-align:center;
                 ">

                <div style="
                    font-size:32px;
                    margin-bottom:12px;
                ">
                    ⏳
                </div>

                <strong style="
                    font-size:16px;
                ">
                    ${escapeHTML(
                        message ||
                        "Loading bookings..."
                    )}
                </strong>

                <div style="
                    margin-top:7px;
                    color:#777;
                    font-size:13px;
                ">
                    Please wait...
                </div>

            </div>
        `;
    }

    function showError(message) {

        const box = getHistoryBox();

        if (!box) return;

        box.innerHTML = `
            <div style="
                margin:20px 0;
                padding:25px;
                border-radius:16px;
                background:#fff1f2;
                border:1px solid #fecdd3;
                color:#7f1d1d;
            ">

                <div style="
                    font-size:22px;
                    font-weight:800;
                    margin-bottom:10px;
                ">
                    ❌ Bookings Load Failed
                </div>

                <div style="
                    line-height:1.6;
                    margin-bottom:15px;
                ">
                    ${escapeHTML(message)}
                </div>

                <button
                    type="button"
                    onclick="loadBookings()"
                    style="
                        padding:11px 18px;
                        border:0;
                        border-radius:10px;
                        background:#6d28d9;
                        color:#fff;
                        font-weight:700;
                        cursor:pointer;
                    "
                >
                    🔄 Try Again
                </button>

            </div>
        `;
    }

    /* =====================================================
       SUPABASE REQUEST
    ===================================================== */

    async function supabaseFetch(url, options) {

        const controller =
            new AbortController();

        const timer = setTimeout(
            function () {
                controller.abort();
            },
            REQUEST_TIMEOUT
        );

        try {

            const response = await fetch(
                url,
                {
                    ...(options || {}),
                    signal:
                        controller.signal
                }
            );

            const text =
                await response.text();

            if (!response.ok) {

                let message = text;

                try {

                    const json =
                        JSON.parse(text);

                    message =
                        json.message ||
                        json.error_description ||
                        json.error ||
                        text;

                } catch (e) {}

                throw new Error(
                    "HTTP " +
                    response.status +
                    " — " +
                    message
                );
            }

            if (!text) {
                return [];
            }

            try {
                return JSON.parse(text);
            } catch (error) {

                throw new Error(
                    "Invalid JSON response from Supabase."
                );
            }

        } finally {

            clearTimeout(timer);
        }
    }

    /* =====================================================
       LOAD BOOKINGS
    ===================================================== */

    async function loadBookings() {

        if (state.loading) {
            return;
        }

        state.loading = true;

        showLoading(
            "Connecting to Supabase..."
        );

        const url =
            SUPABASE_URL +
            "/rest/v1/" +
            TABLE_NAME +
            "?select=*";

        try {

            const data =
                await supabaseFetch(
                    url,
                    {
                        method: "GET",
                        headers: {
                            "apikey":
                                SUPABASE_KEY,

                            "Authorization":
                                "Bearer " +
                                SUPABASE_KEY,

                            "Accept":
                                "application/json",

                            "Content-Type":
                                "application/json"
                        }
                    }
                );

            if (!Array.isArray(data)) {

                throw new Error(
                    "Supabase response is not an array."
                );
            }

            state.bookings = data;
            state.loaded = true;

            renderBookings();

            syncDashboard();

            if (
                typeof window.updateAppHealth ===
                "function"
            ) {
                try {
                    window.updateAppHealth();
                } catch (e) {}
            }

            document.dispatchEvent(
                new CustomEvent(
                    "royalBookingsLoaded",
                    {
                        detail: {
                            count: data.length
                        }
                    }
                )
            );

            console.log(
                "✅ Royal Palace bookings loaded:",
                data.length
            );

        } catch (error) {

            console.error(
                "❌ Booking loading failed:",
                error
            );

            reportError(
                "BOOKING_LOAD_ERROR",
                error?.message ||
                "Unable to load bookings.",
                {
                    table:
                        TABLE_NAME
                }
            );

            if (
                error &&
                error.name === "AbortError"
            ) {

                showError(
                    "Supabase request timed out after 10 seconds."
                );

            } else {

                showError(
                    error?.message ||
                    "Unable to connect to the bookings database."
                );
            }

        } finally {

            state.loading = false;
        }
    }

    /* =====================================================
       FILTER
    ===================================================== */

    function getFilteredBookings() {

        let result =
            [...state.bookings];

        if (state.status !== "all") {

            result =
                result.filter(
                    function (booking) {

                        return String(
                            booking.status || ""
                        ).toLowerCase() ===
                        String(
                            state.status
                        ).toLowerCase();

                    }
                );
        }

        if (state.search) {

            const search =
                state.search.toLowerCase();

            result =
                result.filter(
                    function (booking) {

                        const text = [

                            getBookingId(
                                booking
                            ),

                            getGuestName(
                                booking
                            ),

                            booking.room,

                            booking.status,

                            booking.checkin,

                            booking.checkout

                        ]
                            .filter(Boolean)
                            .join(" ")
                            .toLowerCase();

                        return text.includes(
                            search
                        );
                    }
                );
        }

        return result;
    }

    /* =====================================================
       RENDER
    ===================================================== */

    function renderBookings() {

        const box =
            getHistoryBox();

        if (!box) {
            return;
        }

        const bookings =
            getFilteredBookings();

        if (!state.bookings.length) {

            box.innerHTML = `
                <div style="
                    padding:45px;
                    text-align:center;
                    color:#777;
                ">

                    <div style="
                        font-size:42px;
                    ">
                        📭
                    </div>

                    <h3>
                        No bookings found
                    </h3>

                    <p>
                        Your bookings table is currently empty.
                    </p>

                </div>
            `;

            return;
        }

        if (!bookings.length) {

            box.innerHTML = `
                <div style="
                    padding:45px;
                    text-align:center;
                    color:#777;
                ">

                    <div style="
                        font-size:38px;
                    ">
                        🔍
                    </div>

                    <h3>
                        No matching bookings
                    </h3>

                    <p>
                        Try another search or status filter.
                    </p>

                </div>
            `;

            return;
        }

        let html = `

            <div style="
                width:100%;
                overflow-x:auto;
            ">

                <table style="
                    width:100%;
                    min-width:950px;
                    border-collapse:collapse;
                ">

                    <thead>

                        <tr>

                            <th style="
                                text-align:left;
                                padding:14px;
                            ">
                                Booking ID
                            </th>

                            <th style="
                                text-align:left;
                                padding:14px;
                            ">
                                Guest
                            </th>

                            <th style="
                                text-align:left;
                                padding:14px;
                            ">
                                Room
                            </th>

                            <th style="
                                text-align:left;
                                padding:14px;
                            ">
                                Check-in
                            </th>

                            <th style="
                                text-align:left;
                                padding:14px;
                            ">
                                Check-out
                            </th>

                            <th style="
                                text-align:left;
                                padding:14px;
                            ">
                                Guests
                            </th>

                            <th style="
                                text-align:left;
                                padding:14px;
                            ">
                                Total
                            </th>

                            <th style="
                                text-align:left;
                                padding:14px;
                            ">
                                Status
                            </th>

                            <th style="
                                text-align:center;
                                padding:14px;
                            ">
                                Action
                            </th>

                        </tr>

                    </thead>

                    <tbody>
        `;

        bookings.forEach(
            function (booking, index) {

                const bookingId =
                    getBookingId(
                        booking
                    );

                const menuId =
                    "bookingMenu_" +
                    index;

                const status =
                    booking.status ||
                    "Pending";

                html += `

                    <tr style="
                        border-top:1px solid #eee;
                    ">

                        <td style="
                            padding:14px;
                        ">
                            <strong>
                                ${escapeHTML(
                                    bookingId ||
                                    "-"
                                )}
                            </strong>
                        </td>

                        <td style="
                            padding:14px;
                        ">
                            ${escapeHTML(
                                getGuestName(
                                    booking
                                )
                            )}
                        </td>

                        <td style="
                            padding:14px;
                        ">
                            ${escapeHTML(
                                booking.room ||
                                "-"
                            )}
                        </td>

                        <td style="
                            padding:14px;
                        ">
                            ${formatDate(
                                booking.checkin
                            )}
                        </td>

                        <td style="
                            padding:14px;
                        ">
                            ${formatDate(
                                booking.checkout
                            )}
                        </td>

                        <td style="
                            padding:14px;
                        ">
                            ${escapeHTML(
                                booking.guests ||
                                "-"
                            )}
                        </td>

                        <td style="
                            padding:14px;
                        ">
                            <strong>
                                ${money(
                                    booking.total
                                )}
                            </strong>
                        </td>

                        <td style="
                            padding:14px;
                        ">

                            <span class="
                                status-badge
                                ${getStatusClass(
                                    status
                                )}
                            ">
                                ${escapeHTML(
                                    status
                                )}
                            </span>

                        </td>

                        <td style="
                            padding:14px;
                            text-align:center;
                            position:relative;
                        ">

                            <button
                                type="button"
                                onclick="toggleBookingMenu('${menuId}')"
                                style="
                                    width:36px;
                                    height:36px;
                                    border:0;
                                    bord
