/* =========================================================
   ROYAL PALACE HOTEL
   SUPABASE BOOKING HISTORY
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


    /* =====================================================
       SUPABASE CLIENT
    ===================================================== */

    let supabaseClient = null;
    let bookingsData = [];

    function createSupabaseClient() {

        if (supabaseClient) {
            return supabaseClient;
        }

        if (!window.supabase) {
            return null;
        }

        supabaseClient =
            window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_KEY
            );

        window.royalPalaceSupabase =
            supabaseClient;

        return supabaseClient;
    }


    /* =====================================================
       LOAD SUPABASE LIBRARY
    ===================================================== */

    function loadSupabaseLibrary(callback) {

        if (window.supabase) {

            callback();
            return;

        }

        const existing =
            document.querySelector(
                'script[src*="supabase-js"]'
            );

        if (existing) {

            existing.addEventListener(
                "load",
                callback,
                { once: true }
            );

            return;
        }

        const script =
            document.createElement("script");

        script.src =
            "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";

        script.onload = callback;

        script.onerror = function () {

            console.error(
                "Supabase library could not be loaded."
            );

            showBookingError(
                "Supabase connection library load नहीं हो सकी।"
            );

        };

        document.head.appendChild(script);
    }


    /* =====================================================
       HELPERS
    ===================================================== */

    function escapeHTML(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    function money(value) {

        const number =
            Number(value || 0);

        return "₹" +
            number.toLocaleString("en-IN");
    }


    function normalizeStatus(status) {

        const value =
            String(status || "")
                .trim()
                .toLowerCase();

        if (value === "confirmed") {
            return "Confirmed";
        }

        if (
            value === "cancelled" ||
            value === "canceled"
        ) {
            return "Cancelled";
        }

        if (value === "pending") {
            return "Pending";
        }

        return status || "Pending";
    }


    function statusClass(status) {

        const value =
            normalizeStatus(status)
                .toLowerCase();

        if (value === "confirmed") {
            return "status-confirmed";
        }

        if (value === "cancelled") {
            return "status-cancelled";
        }

        return "status-pending";
    }


    function formatDate(value) {

        if (!value) {
            return "-";
        }

        const date =
            new Date(value);

        if (Number.isNaN(date.getTime())) {
            return escapeHTML(value);
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


    function showBookingError(message) {

        const container =
            document.getElementById(
                "bookingHistory"
            );

        if (!container) {
            return;
        }

        container.innerHTML = `

            <div style="
                padding:30px;
                text-align:center;
                color:#b42318;
                background:#fff5f5;
                border:1px solid #f3c7c7;
                border-radius:14px;
            ">

                <div style="
                    font-size:34px;
                    margin-bottom:10px;
                ">
                    ⚠️
                </div>

                <strong>
                    Booking data load नहीं हो सका
                </strong>

                <div style="
                    margin-top:8px;
                    color:#666;
                ">
                    ${escapeHTML(message)}
                </div>

            </div>

        `;
    }


    /* =====================================================
       LOAD BOOKINGS
    ===================================================== */

    async function loadBookings() {

        const client =
            createSupabaseClient();

        if (!client) {

            showBookingError(
                "Supabase client available नहीं है।"
            );

            return;
        }


        const container =
            document.getElementById(
                "bookingHistory"
            );

        if (container) {

            container.innerHTML = `

                <div style="
                    padding:40px;
                    text-align:center;
                    color:#666;
                ">

                    <div style="
                        font-size:32px;
                        margin-bottom:10px;
                    ">
                        ⏳
                    </div>

                    Loading bookings...

                </div>

            `;
        }


        try {

            const result =
                await client
                    .from(TABLE_NAME)
                    .select("*")
                    .order(
                        "checkin",
                        {
                            ascending: false
                        }
                    );


            if (result.error) {

                console.error(
                    "Supabase booking error:",
                    result.error
                );

                showBookingError(
                    result.error.message ||
                    "Database से bookings नहीं मिलीं।"
                );

                return;
            }


            bookingsData =
                Array.isArray(result.data)
                    ? result.data
                    : [];


            window.royalPalaceBookings =
                bookingsData;


            renderBookings(
                bookingsData
            );


            updateBookingStats();


            if (
                typeof window.updateDashboard ===
                "function"
            ) {

                window.updateDashboard(
                    bookingsData
                );

            }

        } catch (error) {

            console.error(
                "Booking load error:",
                error
            );

            showBookingError(
                error.message ||
                "Unexpected error."
            );

        }

    }


    /* =====================================================
       RENDER BOOKINGS
    ===================================================== */

    function renderBookings(list) {

        const container =
            document.getElementById(
                "bookingHistory"
            );

        if (!container) {
            return;
        }


        if (!list.length) {

            container.innerHTML = `

                <div style="
                    padding:45px;
                    text-align:center;
                    color:#777;
                ">

                    <div style="
                        font-size:40px;
                        margin-bottom:10px;
                    ">
                        📭
                    </div>

                    <strong>
                        No bookings found
                    </strong>

                </div>

            `;

            return;
        }


        let html = `

            <div class="booking-table-wrapper">

                <table class="booking-table">

                    <thead>

                        <tr>

                            <th>Booking ID</th>

                            <th>Guest</th>

                            <th>Room</th>

                            <th>Check-in</th>

                            <th>Check-out</th>

                            <th>Guests</th>

                            <th>Total</th>

                            <th>Status</th>

                            <th>Action</th>

                        </tr>

                    </thead>

                    <tbody>

        `;


        list.forEach(function (booking) {

            const bookingId =
                booking.booking_id || "-";

            const guest =
                booking.guest_name || "-";

            const room =
                booking.room || "-";

            const checkin =
                booking.checkin || "";

            const checkout =
                booking.checkout || "";

            const guests =
                booking.guests ?? "-";

            const total =
                booking.total ?? 0;

            const status =
                normalizeStatus(
                    booking.status
                );


            html += `

                <tr>

                    <td>

                        <strong>
                            ${escapeHTML(bookingId)}
                        </strong>

                    </td>

                    <td>
                        ${escapeHTML(guest)}
                    </td>

                    <td>
                        ${escapeHTML(room)}
                    </td>

                    <td>
                        ${formatDate(checkin)}
                    </td>

                    <td>
                        ${formatDate(checkout)}
                    </td>

                    <td>
                        ${escapeHTML(guests)}
                    </td>

                    <td>

                        <strong>
                            ${money(total)}
                        </strong>

                    </td>

                    <td>

                        <span class="
                            booking-status
                            ${statusClass(status)}
                        ">

                            ${escapeHTML(status)}

                        </span>

                    </td>

                    <td>

                        <button
                            type="button"
                            class="booking-action-btn"
                            onclick="
                                toggleBookingMenu(
                                    '${escapeHTML(bookingId)}'
                                )
                            "
                            title="Actions"
                        >
                            ⋮
                        </button>

                        <div
                            id="booking-menu-${escapeHTML(bookingId)}"
                            class="booking-actions-menu"
                        >

                            <button
                                type="button"
                                onclick="
                                    viewBooking(
                                        '${escapeHTML(bookingId)}'
                                    )
                                "
                            >
                                👁️ View Details
                            </button>

                            <button
                                type="button"
                                onclick="
                                    editBooking(
                                        '${escapeHTML(bookingId)}'
                                    )
                                "
                            >
                                ✏️ Edit / Update
                            </button>

                            <button
                                type="button"
                                onclick="
                                    confirmBooking(
                                        '${escapeHTML(bookingId)}'
                                    )
                                "
                            >
                                ✅ Confirm Booking
                            </button>

                            <button
                                type="button"
                                onclick="
                                    cancelBooking(
                                        '${escapeHTML(bookingId)}'
                                    )
                                "
                            >
                                ❌ Cancel Booking
                            </button>

                            <button
                                type="button"
                                onclick="
                                    copyBookingId(
                                        '${escapeHTML(bookingId)}'
                                    )
                                "
                            >
                                📋 Copy Booking ID
                            </button>

                            <button
                                type="button"
                                class="danger-action"
                                onclick="
                                    deleteBooking(
                                        '${escapeHTML(bookingId)}'
                                    )
                                "
                            >
                                🗑️ Delete Booking
                            </button>

                        </div>

                    </td>

                </tr>

            `;

        });


        html += `

                    </tbody>

                </table>

            </div>

        `;


        container.innerHTML =
            html;

    }


    /* =====================================================
       SEARCH
    ===================================================== */

    function searchBookings(value) {

        const search =
            String(value || "")
                .trim()
                .toLowerCase();


        if (!search) {

            renderBookings(
                bookingsData
            );

            return;
        }


        const filtered =
            bookingsData.filter(
                function (booking) {

                    return [

                        booking.booking_id,
                        booking.guest_name,
                        booking.room,
                        booking.status

                    ]
                        .join(" ")
                        .toLowerCase()
                        .includes(search);

                }
            );


        renderBookings(
            filtered
        );

    }


    /* =====================================================
       FILTER
    ===================================================== */

    function filterBookings(value) {

        const filter =
            String(value || "")
                .trim()
                .toLowerCase();


        if (
            !filter ||
            filter === "all"
        ) {

            renderBookings(
                bookingsData
            );

            return;
        }


        const filtered =
            bookingsData.filter(
                function (booking) {

                    return normalizeStatus(
                        booking.status
                    ).toLowerCase() === filter;

                }
            );


        renderBookings(
            filtered
        );

    }


    /* =====================================================
       FIND BOOKING
    ===================================================== */

    function findBooking(bookingId) {

        return bookingsData.find(
            function (booking) {

                return String(
                    booking.booking_id
                ) === String(
                    bookingId
                );

            }
        );

    }


    /* =====================================================
       VIEW DETAILS
    ===================================================== */

    function viewBooking(bookingId) {

        const booking =
            findBooking(bookingId);

        if (!booking) {
            return;
        }


        alert(

            "BOOKING DETAILS\n\n" +

            "Booking ID: " +
            (booking.booking_id || "-") +

            "\nGuest: " +
            (booking.guest_name || "-") +

            "\nRoom: " +
            (booking.room || "-") +

            "\nCheck-in: " +
            (booking.checkin || "-") +

            "\nCheck-out: " +
            (booking.checkout || "-") +

            "\nGuests: " +
            (booking.guests ?? "-") +

            "\nNights: " +
            (booking.nights ?? "-") +

            "\nPrice/Night: " +
            money(
                booking.price_per_night
            ) +

            "\nTotal: " +
            money(
                booking.total
            ) +

            "\nStatus: " +
            normalizeStatus(
                booking.status
            )

        );

    }


    /* =====================================================
       EDIT BOOKING
    ===================================================== */

    async function editBooking(bookingId) {

        const client =
            createSupabaseClient();

        const booking =
            findBooking(bookingId);

        if (!client || !booking) {
            return;
        }


        const guest =
            prompt(
                "Guest Name:",
                booking.guest_name || ""
            );


        if (guest === null) {
            return;
        }


        const room =
            prompt(
                "Room:",
                booking.room || ""
            );


        if (room === null) {
            return;
        }


        try {

            const result =
                await client
                    .from(TABLE_NAME)
                    .update({

                        guest_name:
                            guest.trim(),

                        room:
                            room.trim()

                    })
                    .eq(
                        "booking_id",
                        bookingId
                    )
                    .select()
                    .single();


            if (result.error) {

                alert(
                    "Update failed:\n" +
                    result.error.message
                );

                return;
            }


            alert(
                "Booking updated successfully."
            );


            await loadBookings();

        } catch (error) {

            alert(
                "Update error:\n" +
                error.message
            );

        }

    }


    /* =====================================================
       CONFIRM BOOKING
    ===================================================== */

    async function confirmBooking(bookingId) {

        const booking =
            findBooking(bookingId);

        if (!booking) {
            return;
    
