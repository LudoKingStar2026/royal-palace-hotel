/* ============================================================
   ROYAL PALACE HOTEL
   HOTEL SYNC BRIDGE
   Version: 1.0
   Admin <-> Supabase <-> User Panel
   ============================================================ */

(function () {
    "use strict";

    const VERSION = "1.0";

    const SUPABASE_URL =
        "https://mvvfqkcgaxcipjkiyuae.supabase.co";

    const SUPABASE_KEY =
        "sb_publishable_YbyO8KHdQxXyv6afqJZfWg_Eu2aw57x";

    const ROOMS_TABLE = "hotel_rooms";
    const SETTINGS_TABLE = "hotel_settings";

    let client = null;
    let realtimeChannel = null;
    let initialized = false;

    const state = {
        rooms: [],
        settings: null,
        lastRoomsJSON: "",
        lastSettingsJSON: ""
    };

    /* ============================================================
       SUPABASE
       ============================================================ */

    function getSupabaseClient() {
        try {
            if (client) {
                return client;
            }

            if (
                window.supabase &&
                typeof window.supabase.createClient === "function"
            ) {
                client = window.supabase.createClient(
                    SUPABASE_URL,
                    SUPABASE_KEY
                );

                return client;
            }

            console.warn(
                "[HotelSync] Supabase SDK not available."
            );

            return null;

        } catch (error) {
            console.error(
                "[HotelSync] Supabase initialization error:",
                error
            );

            return null;
        }
    }

    /* ============================================================
       NORMALIZE ROOM
       ============================================================ */

    function normalizeRoom(room) {
        if (!room || typeof room !== "object") {
            return null;
        }

        return {
            id:
                room.id ||
                room.room_id ||
                room.roomId ||
                "",

            room_number:
                room.room_number ||
                room.roomNumber ||
                room.number ||
                "",

            name:
                room.name ||
                room.room_name ||
                "Room",

            type:
                room.type ||
                room.room_type ||
                "Standard",

            price:
                Number(
                    room.price ??
                    room.price_per_night ??
                    room.pricePerNight ??
                    0
                ),

            status:
                room.status ||
                "available",

            description:
                room.description ||
                "",

            image:
                room.image ||
                room.image_url ||
                "",

            capacity:
                Number(
                    room.capacity ??
                    room.guests ??
                    2
                )
        };
    }

    function normalizeSettings(settings) {
        if (!settings || typeof settings !== "object") {
            return null;
        }

        return {
            id: settings.id || 1,

            hotel_name:
                settings.hotel_name ||
                settings.hotelName ||
                "Royal Palace Hotel",

            phone:
                settings.phone || "",

            email:
                settings.email || "",

            address:
                settings.address || "",

            admin_name:
                settings.admin_name ||
                settings.adminName ||
                "",

            admin_role:
                settings.admin_role ||
                settings.adminRole ||
                "",

            notifications:
                settings.notifications !== false
        };
    }

    /* ============================================================
       LOAD ROOMS FROM SUPABASE
       ============================================================ */

    async function fetchRooms() {
        const db = getSupabaseClient();

        if (!db) {
            return [];
        }

        try {
            const result = await db
                .from(ROOMS_TABLE)
                .select("*")
                .order("room_number", {
                    ascending: true
                });

            if (result.error) {
                throw result.error;
            }

            const rows = Array.isArray(result.data)
                ? result.data
                : [];

            state.rooms = rows
                .map(normalizeRoom)
                .filter(Boolean);

            state.lastRoomsJSON =
                JSON.stringify(state.rooms);

            return state.rooms;

        } catch (error) {
            console.error(
                "[HotelSync] Room fetch failed:",
                error
            );

            return [];
        }
    }

    /* ============================================================
       LOAD SETTINGS FROM SUPABASE
       ============================================================ */

    async function fetchSettings() {
        const db = getSupabaseClient();

        if (!db) {
            return null;
        }

        try {
            const result = await db
                .from(SETTINGS_TABLE)
                .select("*")
                .eq("id", 1)
                .maybeSingle();

            if (result.error) {
                throw result.error;
            }

            if (!result.data) {
                return null;
            }

            state.settings =
                normalizeSettings(result.data);

            state.lastSettingsJSON =
                JSON.stringify(state.settings);

            return state.settings;

        } catch (error) {
            console.error(
                "[HotelSync] Settings fetch failed:",
                error
            );

            return null;
        }
    }

    /* ============================================================
       LOAD EVERYTHING
       ============================================================ */

    async function loadAll() {
        const rooms = await fetchRooms();
        const settings = await fetchSettings();

        applyRoomsToUserPanel(rooms);
        applySettingsToUserPanel(settings);

        emit("hotelSyncUpdated", {
            rooms: rooms,
            settings: settings
        });

        return {
            rooms: rooms,
            settings: settings
        };
    }

    /* ============================================================
       USER PANEL - ROOMS
       ============================================================ */

    function applyRoomsToUserPanel(rooms) {
        if (!Array.isArray(rooms)) {
            return;
        }

        /*
         * We deliberately do not destroy your existing design.
         * We only update room information where matching elements
         * can be safely detected.
         */

        const cards =
            document.querySelectorAll(
                "[data-room-id]"
            );

        cards.forEach(function (card) {
            const id =
                card.getAttribute("data-room-id");

            const room =
                rooms.find(function (item) {
                    return String(item.id) === String(id);
                });

            if (!room) {
                return;
            }

            updateRoomCard(card, room);
        });

        /*
         * Also expose current rooms globally so your existing
         * hotel JavaScript can use them.
         */

        window.ROYAL_HOTEL_ROOMS = rooms;

        try {
            window.dispatchEvent(
                new CustomEvent(
                    "royalHotelRoomsUpdated",
                    {
                        detail: rooms
                    }
                )
            );
        } catch (error) {
            console.warn(
                "[HotelSync] Room event failed:",
                error
            );
        }
    }

    function updateRoomCard(card, room) {
        if (!card || !room) {
            return;
        }

        const nameElement =
            card.querySelector(
                "[data-room-name]"
            );

        const priceElement =
            card.querySelector(
                "[data-room-price]"
            );

        const statusElement =
            card.querySelector(
                "[data-room-status]"
            );

        if (nameElement) {
            nameElement.textContent =
                room.name;
        }

        if (priceElement) {
            priceElement.textContent =
                "₹" +
                Number(room.price || 0).toLocaleString(
                    "en-IN"
                );
        }

        if (statusElement) {
            statusElement.textContent =
                room.status;
        }

        card.setAttribute(
            "data-room-status",
            room.status
        );
    }

    /* ============================================================
       USER PANEL - SETTINGS
       ============================================================ */

    function applySettingsToUserPanel(settings) {
        if (!settings) {
            return;
        }

        window.ROYAL_HOTEL_SETTINGS =
            settings;

        /*
         * Only update elements which explicitly opt into
         * synchronization. Existing design remains untouched.
         */

        const hotelNameElements =
            document.querySelectorAll(
                "[data-hotel-name]"
            );

        hotelNameElements.forEach(
            function (element) {
                element.textContent =
                    settings.hotel_name;
            }
        );

        const phoneElements =
            document.querySelectorAll(
                "[data-hotel-phone]"
            );

        phoneElements.forEach(
            function (element) {
                element.textContent =
                    settings.phone;
            }
        );

        const emailElements =
            document.querySelectorAll(
                "[data-hotel-email]"
            );

        emailElements.forEach(
            function (element) {
                element.textContent =
                    settings.email;
            }
        );

        const addressElements =
            document.querySelectorAll(
                "[data-hotel-address]"
            );

        addressElements.forEach(
            function (element) {
                element.textContent =
                    settings.address;
            }
        );

        try {
            window.dispatchEvent(
                new CustomEvent(
                    "royalHotelSettingsUpdated",
                    {
                        detail: settings
                    }
                )
            );
        } catch (error) {
            console.warn(
                "[HotelSync] Settings event failed:",
                error
            );
        }
    }

    /* ============================================================
       REALTIME
       ============================================================ */

    function startRealtime() {
        const db = getSupabaseClient();

        if (!db) {
            return;
        }

        try {
            if (realtimeChannel) {
                try {
                    db.removeChannel(
                        realtimeChannel
                    );
                } catch (error) {
                    console.warn(
                        "[HotelSync] Old channel cleanup:",
                        error
                    );
                }
            }

            realtimeChannel =
                db.channel(
                    "royal-palace-hotel-sync"
                );

            realtimeChannel
                .on(
                    "postgres_changes",
                    {
                        event: "*",
                        schema: "public",
                        table: ROOMS_TABLE
                    },
                    async function () {
                        console.log(
                            "[HotelSync] Room change received."
                        );

                        await fetchRooms();

                        applyRoomsToUserPanel(
                            state.rooms
                        );

                        emit(
                            "royalHotelRoomsChanged",
                            state.rooms
                        );
                    }
                )
                .on(
                    "postgres_changes",
                    {
                        event: "*",
                        schema: "public",
                        table: SETTINGS_TABLE
                    },
                    async function () {
                        console.log(
                            "[HotelSync] Settings change received."
                        );

                        await fetchSettings();

                        applySettingsToUserPanel(
                            state.settings
                        );

                        emit(
                            "royalHotelSettingsChanged",
                            state.settings
                        );
                    }
                )
                .subscribe(function (status) {
                    console.log(
                        "[HotelSync] Realtime:",
                        status
                    );
                });

        } catch (error) {
            console.error(
                "[HotelSync] Realtime error:",
                error
            );
        }
    }

    /* ============================================================
       ADMIN LOCAL DATA DETECTOR
       ============================================================ */

    function getLocalRooms() {
        try {
            const raw =
                localStorage.getItem(
                    "royal_palace_rooms"
                );

            if (!raw) {
                return [];
            }

            const data = JSON.parse(raw);

            if (!Array.isArray(data)) {
                return [];
            }

            return data
                .map(normalizeRoom)
                .filter(Boolean);

        } catch (error) {
            console.warn(
                "[HotelSync] Local rooms read failed:",
                error
            );

            return [];
        }
    }

    function getLocalSettings() {
        try {
            const raw =
                localStorage.getItem(
                    "royal_palace_settings"
                );

            if (!raw) {
                return null;
            }

            return normalizeSettings(
                JSON.parse(raw)
            );

        } catch (error) {
            console.warn(
                "[HotelSync] Local settings read failed:",
                error
            );

            return null;
        }
    }

    /*
     * This watcher does NOT write to Supabase.
     *
     * It watches the existing Admin Panel data and tells the
     * application that a synchronization is available.
     *
     * Secure database writes should be performed through
     * Supabase Auth or a protected backend/Edge Function.
     */

    function watchAdminData() {
        let previousRooms = "";
        let previousSettings = "";

        setInterval(function () {
            try {
                const rooms =
                    getLocalRooms();

                const settings =
                    getLocalSettings();

                const roomsJSON =
                    JSON.stringify(rooms);

                const settingsJSON =
                    JSON.stringify(settings);

                if (
                    roomsJSON &&
                    roomsJSON !== previousRooms
                ) {
                    previousRooms =
                        roomsJSON;

                    emit(
                        "royalAdminRoomsChanged",
                        rooms
                    );
                }

                if (
                    settingsJSON &&
                    settingsJSON !== previousSettings
                ) {
                    previousSettings =
                        settingsJSON;

                    emit(
                        "royalAdminSettingsChanged",
                        settings
                    );
                }

            } catch (error) {
                console.warn(
                    "[HotelSync] Admin watcher:",
                    error
                );
            }
        }, 1000);
    }

    /* ============================================================
       EVENTS
       ============================================================ */

    function emit(name, detail) {
        try {
            window.dispatchEvent(
                new CustomEvent(
                    name,
                    {
                        detail: detail
                    }
                )
            );
        } catch (error) {
            console.warn(
                "[HotelSync] Event error:",
                error
            );
        }
    }

    /* ============================================================
       PUBLIC API
       ============================================================ */

    window.RoyalHotelSync = {

        version: VERSION,

        getRooms: function () {
            return state.rooms.slice();
        },

        getSettings: function () {
            return state.settings;
        },

        fetchRooms: fetchRooms,

        fetchSettings: fetchSettings,

        loadAll: loadAll,

        refresh: loadAll,

        startRealtime: startRealtime,

        isReady: function () {
            return initialized;
        },

        getConfig: function () {
            return {
                url: SUPABASE_URL,
                roomsTable: ROOMS_TABLE,
                settingsTable: SETTINGS_TABLE
            };
        }
    };

    /* ============================================================
       START
       ============================================================ */

    async function start() {
        if (initialized) {
            return;
        }

        initialized = true;

        console.log(
            "[HotelSync] Royal Palace Hotel Sync " +
            VERSION
        );

        getSupabaseClient();

        await loadAll();

        startRealtime();

        /*
         * Admin page can keep using its existing localStorage
         * system without changing the visual interface.
         */

        watchAdminData();

        emit(
            "royalHotelSyncReady",
            {
                version: VERSION
            }
        );
    }

    if (
        document.readyState ===
        "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            start,
            {
                once: true
            }
        );
    } else {
        start();
    }

})();
