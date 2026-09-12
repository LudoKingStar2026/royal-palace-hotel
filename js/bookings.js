/* =========================================================
   ROYAL PALACE HOTEL
   BOOKING HISTORY MODULE
========================================================= */

(function () {

    "use strict";

    const BOOKING_KEY = "royal_palace_bookings";

    let bookings = [];

    let searchText = "";

    let statusFilter = "all";


    /* =====================================================
       LOAD BOOKINGS
    ===================================================== */

    function loadBookings() {

        try {

            const saved =
                localStorage.getItem(BOOKING_KEY);

            if (saved) {

                const parsed =
                    JSON.parse(saved);

                if (Array.isArray(parsed)) {

                    bookings = parsed;

                    return;
                }
            }

        } catch (error) {

            console.error(
                "Booking data error:",
                error
            );
        }


        bookings = [

            {
                id: "RP1001",
                guest: "Rahul Kumar",
                room: "Premium Room",
                checkIn: "2026-09-12",
                checkOut: "2026-09-14",
                amount: 5000,
                status: "confirmed"
            },

            {
                id: "RP1002",
                guest: "Amit Singh",
                room: "Royal Suite",
                checkIn: "2026-09-15",
                checkOut: "2026-09-17",
                amount: 9000,
                status: "pending"
            },

            {
                id: "RP1003",
                guest: "Neha Sharma",
                room: "Royal Palace Suite",
                checkIn: "2026-09-18",
                checkOut: "2026-09-20",
                amount: 13000,
                status: "confirmed"
            }

        ];

        saveBookings();

    }


    /* =====================================================
       SAVE BOOKINGS
    ===================================================== */

    function saveBookings() {

        try {

            localStorage.setItem(
                BOOKING_KEY,
                JSON.stringify(bookings)
            );

        } catch (error) {

            console.error(
                "Unable to save bookings:",
                error
            );

        }

    }


    /* =====================================================
       MONEY FORMAT
    ===================================================== */

    function formatMoney(value) {

        return "₹" +
            Number(value || 0)
            .toLocaleString("en-IN");

    }


    /* =====================================================
       DATE FORMAT
    ===================================================== */

    function formatDate(value) {

        if (!value) {
            return "-";
        }

        const date =
            new Date(value + "T00:00:00");

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


    /* =====================================================
       STATUS
    ===================================================== */

    function statusText(status) {

        const value =
            String(status || "")
            .toLowerCase();

        if (value === "confirmed") {
            return "Confirmed";
        }

        if (value === "cancelled") {
            return "Cancelled";
        }

        return "Pending";

    }


    function statusClass(status) {

        const value =
            String(status || "")
            .toLowerCase();

        if (value === "confirmed") {
            return "status-confirmed";
        }

        if (value === "cancelled") {
            return "status-cancelled";
        }

        return "status-pending";

    }


    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    function escapeHTML(value) {

        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    /* =====================================================
       FILTER BOOKINGS
    ===================================================== */

    function getFilteredBookings() {

        return bookings.filter(function (booking) {

            const text = (

                (booking.id || "") + " " +
                (booking.guest || "") + " " +
                (booking.room || "") + " " +
                (booking.checkIn || "") + " " +
                (booking.checkOut || "")

            ).toLowerCase();


            const matchesSearch =
                text.includes(searchText);


            const bookingStatus =
                String(
                    booking.status || "pending"
                ).toLowerCase();


            const matchesStatus =
                statusFilter === "all" ||
                bookingStatus === statusFilter;


            return (
                matchesSearch &&
                matchesStatus
            );

        });

    }


    /* =====================================================
       RENDER BOOKING HISTORY
    ===================================================== */

    function renderBookings() {

        const container =
            document.getElementById(
                "bookingHistory"
            );

        if (!container) {
            return;
        }


        const filtered =
            getFilteredBookings();


        if (!filtered.length) {

            container.innerHTML = `

                <div class="empty-state">

                    <div class="empty-icon">
                        ▤
                    </div>

                    <h3>
                        No bookings found
                    </h3>

                    <p>
                        Try another search or filter.
                    </p>

                </div>

            `;

            return;

        }


        container.innerHTML = `

            <div class="booking-toolbar">

                <input
                    type="search"
                    id="bookingSearch"
                    placeholder="Search booking, guest or room..."
                    value="${escapeHTML(searchText)}"
                    oninput="searchBookings(this.value)"
                >


                <select
                    id="bookingStatusFilter"
                    onchange="filterBookings(this.value)"
                >

                    <option value="all"
                        ${statusFilter === "all" ? "selected" : ""}>
                        All Status
                    </option>

                    <option value="confirmed"
                        ${statusFilter === "confirmed" ? "selected" : ""}>
                        Confirmed
                    </option>

                    <option value="pending"
                        ${statusFilter === "pending" ? "selected" : ""}>
                        Pending
                    </option>

                    <option value="cancelled"
                        ${statusFilter === "cancelled" ? "selected" : ""}>
                        Cancelled
                    </option>

                </select>

            </div>


            <div class="booking-table-wrap">

                <table class="booking-table">

                    <thead>

                        <tr>

                            <th>
                                Booking
                            </th>

                            <th>
                                Guest
                            </th>

                            <th>
                                Room
                            </th>

                            <th>
                                Stay
                            </th>

                            <th>
                                Amount
                            </th>

                            <th>
                                Status
                            </th>

                            <th>
                                Actions
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        ${filtered.map(function (booking) {

                            return `

                                <tr>

                                    <td>

                                        <div class="booking-id-cell">

                                            <strong>
                                                ${escapeHTML(
                                                    booking.id
                                                )}
                                            </strong>

                                        </div>

                                    </td>


                                    <td>

                                        <div class="guest-cell">

                                            <div class="guest-avatar">
                                                ${escapeHTML(
                                                    String(
                                                        booking.guest || "G"
                                                    )
                                                    .charAt(0)
                                                    .toUpperCase()
                                                )}
                                            </div>

                                            <strong>
                                                ${escapeHTML(
                                                    booking.guest ||
                                                    "Guest"
                                                )}
                                            </strong>

                                        </div>

                                    </td>


                                    <td>
                                        ${escapeHTML(
                                            booking.room ||
                                            "Room"
                                        )}
                                    </td>


                                    <td>

                                        <div class="stay-cell">

                                            <span>
                                                ${formatDate(
                                                    booking.checkIn
                                                )}
                                            </span>

                                            <small>
                                                to
                                            </small>

                                            <span>
                                                ${formatDate(
                                                    booking.checkOut
                                                )}
                                            </span>

                                        </div>

                                    </td>


                                    <td>

                                        <strong>
                                            ${formatMoney(
                                                booking.amount
                                            )}
                                        </strong>

                                    </td>


                                    <td>

                                        <span
                                            class="status-badge ${statusClass(
                                                booking.status
                                            )}"
                                        >
                                            ${statusText(
                                                booking.status
                                            )}
                                        </span>

                                    </td>


                                    <td>

                                        <div class="booking-actions">

                                            <button
                                                type="button"
                                                title="View Details"
                                                onclick="viewBooking('${booking.id}')"
                                            >
                                                👁️
                                            </button>

                                            <button
                                                type="button"
                                                title="Edit Booking"
                                                onclick="editBooking('${booking.id}')"
                                            >
                                                ✏️
                                            </button>

                                            <button
                                                type="button"
                                                title="More Actions"
                                                onclick="toggleBookingMenu('${booking.id}')"
                                            >
                                                ⋮
                                            </button>

                                        </div>


                                        <div
                                            id="bookingMenu-${escapeHTML(
                                                booking.id
                                            )}"
                                            class="booking-menu"
                                        >

                                            <button
                                                type="button"
                                                onclick="viewBooking('${booking.id}')"
                                            >
                                                👁️ View Details
                                            </button>

                                            <button
                                                type="button"
                                                onclick="editBooking('${booking.id}')"
                                            >
                                                ✏️ Edit / Update
                                            </button>

                                            <button
                                                type="button"
                                                onclick="confirmBooking('${booking.id}')"
                                            >
                                                ✅ Confirm Booking
                                            </button>

                                            <button
                                                type="button"
                                                onclick="cancelBooking('${booking.id}')"
                                            >
                                                ❌ Cancel Booking
                                            </button>

                                            <button
                                                type="button"
                                                onclick="copyBookingId('${booking.id}')"
                                            >
                                                📋 Copy Booking ID
                                            </button>

                                            <button
                                                type="button"
                                                class="danger-action"
                                                onclick="deleteBooking('${booking.id}')"
                                            >
                                                🗑️ Delete Booking
                                            </button>

                                        </div>

                                    </td>

                                </tr>

                            `;

                        }).join("")}

                    </tbody>

                </table>

            </div>

        `;

    }


    /* =====================================================
       UPDATE PAGE
    ===================================================== */

    function updateBookingsPage() {

        renderBookings();

        if (typeof window.updateDashboard === "function") {
            window.updateDashboard();
        }

    }


    /* =====================================================
       SEARCH
    ===================================================== */

    function searchBookings(value) {

        searchText =
            String(value || "")
            .toLowerCase()
            .trim();

        renderBookings();

    }


    /* =====================================================
       FILTER
    ===================================================== */

    function filterBookings(value) {

        statusFilter =
            String(value || "all")
            .toLowerCase();

        renderBookings();

    }


    /* =====================================================
       FIND BOOKING
    ===================================================== */

    function findBooking(id) {

        return bookings.find(function (booking) {

            return booking.id === id;

        });

    }


    /* =====================================================
       VIEW BOOKING
    ===================================================== */

    function viewBooking(id) {

        const booking =
            findBooking(id);

        if (!booking) {
            return;
        }


        alert(

            "BOOKING DETAILS\n\n" +

            "Booking ID: " +
            booking.id +

            "\nGuest: " +
            booking.guest +

            "\nRoom: " +
            booking.room +

            "\nCheck-in: " +
            formatDate(booking.checkIn) +

            "\nCheck-out: " +
            formatDate(booking.checkOut) +

            "\nAmount: " +
            formatMoney(booking.amount) +

            "\nStatus: " +
            statusText(booking.status)

        );

    }


    /* =====================================================
       EDIT BOOKING
    ===================================================== */

    function editBooking(id) {

        const booking =
            findBooking(id);

        if (!booking) {
            return;
        }


        const guest =
            prompt(
                "Guest Name:",
                booking.guest || ""
            );


        if (guest === null) {
            return;
        }


        const room =
            prompt(
                "Room Name:",
                booking.room || ""
            );


        if (room === null) {
            return;
        }


        const amount =
            prompt(
                "Booking Amount:",
                booking.amount || 0
            );


        if (amount === null) {
            return;
        }


        booking.guest =
            guest.trim() || booking.guest;

        booking.room =
            room.trim() || booking.room;

        booking.amount =
            Number(amount) || 0;


        saveBookings();

        updateBookingsPage();

    }


    /* ==============================================
