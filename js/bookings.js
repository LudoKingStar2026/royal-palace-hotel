/* =========================================================
   ROYAL PALACE HOTEL
   SUPABASE BOOKING MANAGEMENT
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

    let supabaseClient = null;

    let allBookings = [];

    let filteredBookings = [];

    let currentSearch = "";

    let currentStatus = "all";


    /* =====================================================
       START SUPABASE
    ===================================================== */

    function initSupabase() {

        try {

            if (!window.supabase) {

                showBookingError(
                    "Supabase library load नहीं हुई। कृपया page refresh करें।"
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
                "Supabase connection शुरू नहीं हो सकी।"
            );

            return false;
        }
    }


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

        return "₹" + number.toLocaleString("en-IN");
    }


    function formatDate(value) {

        if (!value) {
            return "-";
        }

        const date = new Date(value);

        if (isNaN(date.getTime())) {
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

        if (value === "pending") {
            return "pending";
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
       LOAD BOOKINGS
    ===================================================== */

    async function loadBookings() {

        const container =
            document.getElementById("bookingHistory");

        if (!container) {
            return;
        }

        container.innerHTML = `
            <div class="loading-box">
                Loading bookings...
            </div>
        `;


        if (!supabaseClient) {

            if (!initSupabase()) {
                return;
            }
        }


        try {

            const result =
                await supabaseClient
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
                    "Bookings load नहीं हो सकीं।"
                );

                return;
            }


            allBookings =
                Array.isArray(result.data)
                    ? result.data
                    : [];


            applyFilters();

            updateDashboardStats();

        } catch (error) {

            console.error(
                "Booking loading error:",
                error
            );

            showBookingError(
                "Bookings load करते समय error आया।"
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
            allBookings.filter(function (booking) {

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
            });


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
            document.getElementById("bookingHistory");

        if (!container) {
            return;
        }


        if (!filteredBookings.length) {

            if (allBookings.length === 0) {

                container.innerHTML = `
                    <div class="empty-bookings">
                        <div class="empty-icon">📅</div>

                        <h3>No Bookings Found</h3>

                        <p>
                            Supabase में अभी कोई booking record नहीं मिला।
                        </p>
                    </div>
                `;

            } else {

                container.innerHTML = `
                    <div class="empty-bookings">
                        <div class="empty-icon">🔎</div>

                        <h3>No Matching Bookings</h3>

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
                <strong>${filteredBookings.length}</strong>
                of
                <strong>${allBookings.length}</strong>
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
                    booking.guest_name || "-";

                const room =
                    booking.room || "-";

                const guests =
                    booking.guests || 0;

                const checkin =
                    formatDate(
                        booking.checkin
                    );

                const checkout =
                    formatDate(
                        booking.checkout
                    );

                const total =
                    money(booking.total);

                const status =
                    booking.status || "Pending";

                const statusClass =
                    getStatusClass(status);


                html += `

                    <tr>

                        <td>

                            <strong class="booking-id">
                                ${escapeHTML(bookingId)}
                            </strong>

                        </td>


                        <td>

                            <div class="guest-cell">

                                <strong>
                                    ${escapeHTML(guest)}
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

                            <span class="status-badge ${statusClass}">
                                ${escapeHTML(status)}
                            </span>

                        </td>


                        <td>

                            <div class="booking-action">

                                <button
                                    class="booking-action-btn"
                                    onclick="toggleBookingMenu('${escapeHTML(bookingId)}')">
                                    ⋮
                                </button>

                                <div
                                    id="bookingMenu-${escapeHTML(bookingId)}"
                                    class="booking-menu">

                                    <button
                                        onclick="viewBooking('${escapeHTML(bookingId)}')">
                                        👁️ View Details
                                    </button>

                                    <button
                                        onclick="editBooking('${escapeHTML(bookingId)}')">
                                        ✏️ Edit / Update
                                    </button>

                                    <button
                                        onclick="confirmBooking('${escapeHTML(bookingId)}')">
                                        ✅ Confirm Booking
                                    </button>

                                    <button
                                        onclick="cancelBooking('${escapeHTML(bookingId)}')">
                                        ❌ Cancel Booking
                                    </button>

                                    <button
                                        onclick="copyBookingId('${escapeHTML(bookingId)}')">
                                        📋 Copy Booking ID
                                    </button>

                                    <button
                                        class="danger-action"
                                        onclick="deleteBooking('${escapeHTML(bookingId)}')">
                                        🗑️ Delete Booking
                                    </button>

                                </div>

                            </div>

                        </td>

                    </tr>
                `;
            }
        );


        html += `

                    </tbody>

                </table>

            </div>
        `;


        container.innerHTML = html;
    }


    /* =====================================================
       OPEN / CLOSE THREE DOT MENU
    ===================================================== */

    window.toggleBookingMenu =
        function (bookingId) {

            document
                .querySelectorAll(".booking-menu")
                .forEach(function (menu) {

                    if (
                        menu.id !==
                        "bookingMenu-" + bookingId
                    ) {
                        menu.classList.remove("show");
                    }
                });


            const menu =
                document.getElementById(
                    "bookingMenu-" + bookingId
                );


            if (menu) {

                menu.classList.toggle("show");
            }
        };


    /* =====================================================
       VIEW DETAILS
    ===================================================== */

    window.viewBooking =
        function (bookingId) {

            closeBookingMenus();


            const booking =
                allBookings.find(
                    function (item) {

                        return String(
                            getBookingId(item)
                        ) === String(bookingId);
                    }
                );


            if (!booking) {

                alert("Booking नहीं मिली।");

                return;
            }


            const details =

                "BOOKING DETAILS\n\n" +

                "Booking ID: " +
                (booking.booking_id || "-") +

                "\nGuest: " +
                (booking.guest_name || "-") +

                "\nRoom: " +
                (booking.room || "-") +

                "\nGuests: " +
                (booking.guests || "-") +

                "\nNights: " +
                (booking.nights || "-") +

                "\nCheck-in: " +
                formatDate(booking.checkin) +

                "\nCheck-out: " +
                formatDate(booking.checkout) +

                "\nPrice / Night: " +
                money(booking.price_per_night) +

                "\nTotal: " +
                money(booking.total) +

                "\nStatus: " +
                (booking.status || "-");


            alert(details);
        };


    /* =====================================================
       EDIT BOOKING
    ===================================================== */

    window.editBooking =
        async function (bookingId) {

            closeBookingMenus();


            const booking =
                allBookings.find(
                    function (item) {

                        return String(
                            getBookingId(item)
                        ) === String(bookingId);
                    }
                );


            if (!booking) {

                alert("Booking नहीं मिली।");

                return;
            }


            const guestName =
                prompt(
                    "Guest Name:",
                    booking.guest_name || ""
                );


            if (guestName === null) {
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


            if (!guestName.trim()) {

                alert(
                    "Guest name खाली नहीं हो सकता।"
                );

                return;
            }


            try {

                const result =
                    await supabaseClient
                        .from(TABLE_NAME)
                        .update({

                            guest_name:
                                guestName.trim(),

                            room:
                                room.trim()

                        })
                        .eq(
                            "booking_id",
                            bookingId
                        );


                if (result.error) {

                    alert(
                        "Update failed:\n\n" +
                        result.error.message
                    );

                    return;
                }


                alert(
                    "Booking successfully updated ✅"
                );


                await loadBookings();

            } catch (error) {

                console.error(error);

                alert(
                    "Booking update करते समय error आया।"
                );
            }
        };


    /* =====================================================
       CONFIRM BOOKING
    ===================================================== */

    window.confirmBooking =
        async function (bookingId) {

            closeBookingMenus();


            const booking =
                allBookings.find(
                    function (item) {

                        return String(
                            getBookingId(item)
                        ) === String(bookingId);
                    }
                );


            if (!booking) {

                alert("Booking नहीं मिली।");

                return;
            }


            const ok =
                confirm(
                    "क्या आप इस booking को Confirm करना चाहते हैं?\n\n" +
                    bookingId
                );


            if (!ok) {
                return;
            }


            await updateBookingStatus(
                bookingId,
                "Confirmed"
            );
        };


    /* =====================================================
       CANCEL BOOKING
    ===================================================== */

    window.cancelBooking =
        async function (bookingId) {

            closeBookingMenus();


            const booking =
                allBookings.find(
                    function (item) {

                        return String(
                            getBookingId(item)
                        ) === String(bookingId);
                    }
                );


            if (!booking) {

                alert("Booking नहीं मिली।");

                return;
            }


   
