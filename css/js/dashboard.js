/* =========================================================
   ROYAL PALACE HOTEL
   DASHBOARD MODULE
========================================================= */

(function () {

    "use strict";

    const BOOKING_KEY = "royal_palace_bookings";


    /* =====================================================
       DEMO BOOKINGS
    ===================================================== */

    const demoBookings = [
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


    /* =====================================================
       GET BOOKINGS
    ===================================================== */

    function getBookings() {

        try {

            const saved =
                localStorage.getItem(BOOKING_KEY);

            if (!saved) {
                localStorage.setItem(
                    BOOKING_KEY,
                    JSON.stringify(demoBookings)
                );

                return demoBookings;
            }

            const bookings = JSON.parse(saved);

            if (Array.isArray(bookings)) {
                return bookings;
            }

        } catch (error) {

            console.error(
                "Booking data error:",
                error
            );

        }

        return demoBookings;
    }


    /* =====================================================
       SAVE BOOKINGS
    ===================================================== */

    function saveBookings(bookings) {

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
       NUMBER FORMAT
    ===================================================== */

    function formatNumber(number) {

        return Number(number || 0)
            .toLocaleString("en-IN");

    }


    /* =====================================================
       MONEY FORMAT
    ===================================================== */

    function formatMoney(amount) {

        return "₹" +
            formatNumber(amount);

    }


    /* =====================================================
       STATUS
    ===================================================== */

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


    /* =====================================================
       UPDATE STATISTICS
    ===================================================== */

    function updateStatistics(bookings) {

        const totalRooms =
            document.getElementById("statRooms");

        const totalBookings =
            document.getElementById("statBookings");

        const confirmedBookings =
            document.getElementById("statConfirmed");

        const totalRevenue =
            document.getElementById("statRevenue");


        const confirmed =
            bookings.filter(function (booking) {

                return String(
                    booking.status
                ).toLowerCase() === "confirmed";

            });


        const revenue =
            confirmed.reduce(
                function (total, booking) {

                    return total +
                        Number(
                            booking.amount || 0
                        );

                },
                0
            );


        if (totalRooms) {
            totalRooms.textContent = "12";
        }

        if (totalBookings) {
            totalBookings.textContent =
                bookings.length;
        }

        if (confirmedBookings) {
            confirmedBookings.textContent =
                confirmed.length;
        }

        if (totalRevenue) {
            totalRevenue.textContent =
                formatMoney(revenue);
        }

    }


    /* =====================================================
       RECENT BOOKINGS
    ===================================================== */

    function updateRecentBookings(bookings) {

        const container =
            document.getElementById(
                "recentBookings"
            );

        if (!container) {
            return;
        }


        if (!bookings.length) {

            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📋</div>
                    <h3>No bookings yet</h3>
                    <p>New bookings will appear here.</p>
                </div>
            `;

            return;
        }


        const recent =
            bookings.slice(-5).reverse();


        container.innerHTML =
            recent.map(function (booking) {

                return `
                    <div class="booking-row">

                        <div class="booking-main">

                            <div class="booking-avatar">
                                ${String(
                                    booking.guest || "G"
                                ).charAt(0).toUpperCase()}
                            </div>

                            <div class="booking-info">

                                <strong>
                                    ${booking.guest || "Guest"}
                                </strong>

                                <span>
                                    ${booking.room || "Room"}
                                </span>

                            </div>

                        </div>


                        <div class="booking-id">
                            ${booking.id || "-"}
                        </div>


                        <div class="booking-status">

                            <span class="status-badge ${statusClass(
                                booking.status
                            )}">
                                ${statusText(
                                    booking.status
                                )}
                            </span>

                        </div>


                        <div class="booking-amount">
                            ${formatMoney(
                                booking.amount
                            )}
                        </div>

                    </div>
                `;

            }).join("");

    }


    /* =====================================================
       ROOM OVERVIEW
    ===================================================== */

    function updateRoomOverview(bookings) {

        const container =
            document.getElementById(
                "roomOverview"
            );

        if (!container) {
            return;
        }


        const totalRooms = 12;


        const activeBookings =
            bookings.filter(function (booking) {

                return String(
                    booking.status
                ).toLowerCase() === "confirmed";

            }).length;


        const bookedRooms =
            Math.min(
                activeBookings,
                totalRooms
            );


        const availableRooms =
            totalRooms - bookedRooms;


        const occupancy =
            Math.round(
                (bookedRooms / totalRooms) * 100
            );


        container.innerHTML = `

            <div class="room-overview-grid">

                <div class="room-overview-item">

                    <div class="room-overview-icon">
                        🛏️
                    </div>

                    <div>
                        <strong>
                            ${totalRooms}
                        </strong>

                        <span>
                            Total Rooms
                        </span>
                    </div>

                </div>


                <div class="room-overview-item">

                    <div class="room-overview-icon">
                        ✅
                    </div>

                    <div>
                        <strong>
                            ${availableRooms}
                        </strong>

                        <span>
                            Available
                        </span>
                    </div>

                </div>


                <div class="room-overview-item">

                    <div class="room-overview-icon">
                        🔒
                    </div>

                    <div>
                        <strong>
                            ${bookedRooms}
                        </strong>

                        <span>
                            Booked
                        </span>
                    </div>

                </div>

            </div>


            <div class="occupancy-section">

                <div class="occupancy-header">

                    <strong>
                        Occupancy
                    </strong>

                    <span>
                        ${occupancy}%
                    </span>

                </div>

                <div class="occupancy-bar">

                    <div
                        class="occupancy-fill"
                        style="width:${occupancy}%">
                    </div>

                </div>

            </div>

        `;

    }


    /* =====================================================
       UPDATE DASHBOARD
    ===================================================== */

    function updateDashboard() {

        const bookings =
            getBookings();

        updateStatistics(bookings);

        updateRecentBookings(bookings);

        updateRoomOverview(bookings);

    }


    /* =====================================================
       ADD DEMO DATA
    ===================================================== */

    function initializeDashboard() {

        const bookings =
            getBookings();

        saveBookings(bookings);

        updateDashboard();

    }


    /* =====================================================
       GLOBAL ACCESS
    ===================================================== */

    window.updateDashboard =
        updateDashboard;

    window.getDashboardBookings =
        getBookings;

    window.saveDashboardBookings =
        saveBookings;


    /* =====================================================
       START
    ===================================================== */

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            initializeDashboard();

        }
    );


})();
