export const dashboardDefault = {
  version: 1,
  modules: [
    { name: "Room", icon: "room.png", navigate: "RoomBooking" },
    { name: "Banquet", icon: "banquet.png", navigate: "BanquetBooking" },
  ],
};
export const drawerDefault = {
    version: 1,
    drawer_menu: [
        {
            id: 1,
            title: "Privacy Policy",
            icon: "account-lock",
            data: " ",
            type: "info",
            screen: null,
            params: "{\"index\":0,\"name\":\"Privacy Policy\"}",
            visible: 1,
            menu_order: 1,
            created_at: null,
            updated_at: null
        },
        {
            id: 2,
            title: "Terms & Conditions",
            icon: "clipboard-list-outline",
            data: " ",
            type: "info",
            screen: null,
            params: "{\"index\":1,\"name\":\"Terms & Conditions\"}",
            visible: 1,
            menu_order: 2,
            created_at: null,
            updated_at: null
        },
        {
            id: 3,
            title: "Disclaimer",
            icon: "alert-circle-outline",
            data: " ",
            type: "info",
            screen: null,
            params: "{\"index\":2,\"name\":\"Disclaimer\"}",
            visible: 1,
            menu_order: 3,
            created_at: null,
            updated_at: null
        },
        {
            id: 4,
            title: "Manage Buddies",
            icon: "account-group",
            data: " ",
            type: "screen",
            screen: "Buddies",
            params: null,
            visible: 1,
            menu_order: 4,
            created_at: null,
            updated_at: null
        },
        {
            id: 5,
            title: "Refund & Returns Policy",
            icon: "shield-refresh",
            data: " ",
            type: "info",
            screen: null,
            params: "{\"index\":3,\"name\":\"Refund & Returns Policy\"}",
            visible: 1,
            menu_order: 5,
            created_at: null,
            updated_at: null
        },
        {
            id: 6,
            title: "About Us",
            icon: "information-outline",
            data: " ",
            type: "info",
            screen: null,
            params: "{\"index\":4,\"name\":\"About Us\"}",
            visible: 1,
            menu_order: 6,
            created_at: null,
            updated_at: null
        },
        {
            id: 7,
            title: "Contact Us",
            icon: "contacts-outline",
            data: " ",
            type: "screen",
            screen: "Contact",
            params: "{\"name\":\"Contact Us\"}",
            visible: 1,
            menu_order: 7,
            created_at: null,
            updated_at: null
        }
    ]
};
