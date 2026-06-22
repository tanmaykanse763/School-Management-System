sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/ResponsivePopover",
    "sap/m/List",
    "sap/m/Button",
    "sap/m/Bar",
    "sap/m/Title",
    "sap/m/ObjectStatus",
    "sap/m/IconTabBar",
    "sap/m/IconTabFilter",
    "sap/m/CustomListItem",
    "sap/m/HBox",
    "sap/m/VBox",
    "sap/m/Text",
    "sap/m/Label",
    "sap/ui/core/Icon",
    "sap/m/Toolbar",
    "sap/m/ToolbarSpacer",
    "sap/m/MessageToast"
], function (
    Controller, JSONModel,
    ResponsivePopover, List, Button, Bar, Title,
    ObjectStatus, IconTabBar, IconTabFilter, CustomListItem,
    HBox, VBox, Text, Label, Icon, Toolbar, ToolbarSpacer, MessageToast
) {
    "use strict";

    return Controller.extend("schoolui.controller.App", {


        onInit: function () {

            // // Router
            var oRouter = this.getOwnerComponent().getRouter();

            //    var oUser = sap.ushell.Container.getService("UserInfo").getUser();
            //    var sEmail = oUser.getEmail();
            //    console.log("Logged in user email:", sEmail);

            // // Initialize router
            // oRouter.initialize();

            // Attach route matched event
            oRouter.attachRouteMatched(this.onRouteMatched, this);
        

            // Notification tooltip model (bell unread count)
            this._oNotifModel = new JSONModel({
                unreadCount: 0
            });

            this.getView().setModel(this._oNotifModel, "notif");

            // Popover instance cache
            this._oNotifPopover = null;
        },


        onToggleSideNav: function () {
            var oToolPage = this.byId("toolPage");
            oToolPage.setSideExpanded(!oToolPage.getSideExpanded());
        },


        onNavItemSelect: function (oEvent) {
            var sKey = oEvent.getParameter("item").getKey();
            this.getOwnerComponent().getRouter().navTo(sKey);
        },


        onOpenNotifications: async function (oEvent) {

            var oButton = oEvent.getSource();

            if (!this._oNotifPopover) {

                this._oNotifPopover = await sap.ui.core.Fragment.load({
                    id: this.getView().getId(),
                    name: "schoolui.view.fragments.NotificationPopover",
                    controller: this
                });

                this.getView().addDependent(this._oNotifPopover);
            }

            // REFRESH LISTS
            this._refreshNotificationLists();

            this._oNotifPopover.openBy(oButton);
        },

        onRouteMatched: function () {

            var oSearchField = this.byId("globalSearchField");

            if (oSearchField) {
                oSearchField.setVisible(true);
                oSearchField.setWidth("250px");
                oSearchField.setValue("");
            }
        },


        onMarkAllRead: function () {
            this._aNotifications.forEach(function (n) { n.read = true; });
            this._oNotifModel.setProperty("/unreadCount", 0);
            this._refreshPopover();
            MessageToast.show("All notifications marked as read");
        },


        addNotification: function (oNotif) {

            var oNotificationModel =
                this.getOwnerComponent().getModel("notification");

            var aNotifications =
                oNotificationModel.getProperty("/notifications") || [];

            oNotif.read = false;

            aNotifications.unshift(oNotif);

            oNotificationModel.setProperty(
                "/notifications",
                aNotifications
            );

            if (this._oNotifPopover) {
                this._refreshNotificationLists();
            }
        },

        _refreshNotificationLists: function () {

            var aAll = this._aNotifications || [];

            var aLeave = aAll.filter(function (oItem) {
                return oItem.type === "leave";
            });

            var aBonafide = aAll.filter(function (oItem) {
                return oItem.type === "bonafide";
            });

            // Unread count
            var iUnread = aAll.filter(function (oItem) {
                return !oItem.read;
            }).length;

            var oUnreadCount = sap.ui.core.Fragment.byId(
                this.getView().getId(),
                "osUnreadCount"
            );

            if (oUnreadCount) {
                oUnreadCount.setText(iUnread + " unread");
            }

            // Update tab counts
            sap.ui.core.Fragment.byId(this.getView().getId(), "tabAll")
                .setCount(aAll.length);

            sap.ui.core.Fragment.byId(this.getView().getId(), "tabLeave")
                .setCount(aLeave.length);

            sap.ui.core.Fragment.byId(this.getView().getId(), "tabBonafide")
                .setCount(aBonafide.length);

            // Fill lists
            this._fillList("listAllNotif", aAll);
            this._fillList("listLeaveNotif", aLeave);
            this._fillList("listBonafideNotif", aBonafide);
        },


        _fillList: function (sListId, aData) {

            var oList = sap.ui.core.Fragment.byId(
                this.getView().getId(),
                sListId
            );

            oList.removeAllItems();

            if (aData.length === 0) {
                oList.addItem(new sap.m.CustomListItem({
                    content: [
                        new sap.m.Text({
                            text: "No notifications yet"
                        })
                    ]
                }));
                return;
            }

            aData.forEach(function (oItem) {

                var oListItem = new sap.m.CustomListItem({
                    content: [
                        new sap.m.HBox({
                            alignItems: "Center",
                            items: [

                                new sap.ui.core.Icon({
                                    src: oItem.icon,
                                    size: "1.3rem",
                                    color: oItem.iconColor
                                }),

                                new sap.m.VBox({
                                    class: "sapUiSmallMarginBegin",
                                    items: [

                                        new sap.m.Title({
                                            text: oItem.title,
                                            level: "H6"
                                        }),

                                        new sap.m.Text({
                                            text: oItem.description
                                        }),

                                        new sap.m.ObjectStatus({
                                            text: oItem.statusText,
                                            state: oItem.statusState
                                        }),

                                        new sap.m.Label({
                                            text: oItem.time
                                        })

                                    ]
                                })
                            ]
                        })
                    ]
                });

                oList.addItem(oListItem);

            });
        },


        onNavItemSelect: function (oEvent) {

            var sKey =
                oEvent.getParameter("item")
                    .getKey();

            this.getOwnerComponent()
                .getRouter()
                .navTo(sKey);

        },

        onMarkAllRead: function () {

            this._aNotifications.forEach(function (oItem) {
                oItem.read = true;
            });

            this._refreshNotificationLists();

            sap.m.MessageToast.show("All notifications marked as read");
        },
        onViewAllNotifications: function () {

            if (this._oNotifPopover) {
                this._oNotifPopover.close();
            }
        },


        _getUnreadCount: function () {
            return this._aNotifications.filter(function (n) {
                return !n.read;
            }).length;
        },

        onSearchApp: function (oEvent) {

            var sValue = oEvent.getParameter("query");

            if (!sValue) {
                return;
            }

            sValue = sValue.toLowerCase().trim();

            // DASHBOARD
            if (
                sValue === "dashboard" ||
                sValue.includes("dashboard")
            ) {
                this.getOwnerComponent()
                    .getRouter()
                    .navTo("Dashboard");
            }

            // LEAVE REQUESTS
            else if (
                sValue === "leave" ||
                sValue.includes("leave request") ||
                sValue.includes("leave")
            ) {
                this.getOwnerComponent()
                    .getRouter()
                    .navTo("LeaveRequests");
            }

            // BONAFIDE CERTIFICATE
            else if (
                sValue === "bonafide" ||
                sValue.includes("bonafide") ||
                sValue.includes("certificate")
            ) {
                this.getOwnerComponent()
                    .getRouter()
                    .navTo("BonafideCert");
            }

            // MY PROFILE
            else if (
                sValue === "profile" ||
                sValue.includes("my profile") ||
                sValue.includes("profile")
            ) {
                this.getOwnerComponent()
                    .getRouter()
                    .navTo("MyProfile");
            }

            // SETTINGS
            else if (
                sValue === "settings" ||
                sValue.includes("settings")
            ) {
                this.getOwnerComponent()
                    .getRouter()
                    .navTo("Settings");
            }

            // INVALID SEARCH
            else {
                sap.m.MessageToast.show("No matching page found");
            }

            // HIDE SEARCH FIELD AFTER ENTER
            var oSearchField = this.byId("globalSearchField");

            if (oSearchField) {
                oSearchField.setVisible(false);
                oSearchField.setValue("");
            }
        },


        _stateToHighlight: function (sState) {
            var mMap = {
                "Success": "Success",
                "Warning": "Warning",
                "Error": "Error",
                "Information": "Information"
            };
            return mMap[sState] || "None";
        }

    });
});