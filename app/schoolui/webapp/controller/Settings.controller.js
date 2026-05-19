sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], function (
    Controller,
    JSONModel,
    MessageToast
) {
    "use strict";

    return Controller.extend(
        "schoolui.controller.Settings",
        {

            // INIT

            onInit: function () {

                // GET SAVED DARK MODE

                var bDarkMode =
                    localStorage.getItem("darkMode") === "true";

                // APPLY SAVED THEME

                if (bDarkMode) {

                    sap.ui.getCore().applyTheme(
                        "sap_horizon_dark"
                    );

                }

                else {

                    sap.ui.getCore().applyTheme(
                        "sap_horizon"
                    );

                }

                // EMAIL MODEL

                this.getView().setModel(
                    new JSONModel({
                        enabled: true
                    }),
                    "emailSwitch"
                );

                // SMS MODEL

                this.getView().setModel(
                    new JSONModel({
                        enabled: false
                    }),
                    "smsSwitch"
                );

                // LEAVE STATUS MODEL

                this.getView().setModel(
                    new JSONModel({
                        enabled: true
                    }),
                    "leaveSwitch"
                );

                // BONAFIDE MODEL

                this.getView().setModel(
                    new JSONModel({
                        enabled: true
                    }),
                    "bonafideSwitch"
                );

                // THEME MODEL

                this.getView().setModel(
                    new JSONModel({
                        enabled: bDarkMode
                    }),
                    "themeSwitch"
                );

            },

            // EMAIL NOTIFICATIONS

            onEmailNotificationChange: function (oEvent) {

                var bState =
                    oEvent.getParameter("state");

                this.getView()
                    .getModel("emailSwitch")
                    .setProperty("/enabled", bState);

                MessageToast.show(
                    bState
                    ? "Email Notifications Enabled"
                    : "Email Notifications Disabled"
                );

            },

            // SMS ALERTS

            onSmsChange: function (oEvent) {

                var bState =
                    oEvent.getParameter("state");

                this.getView()
                    .getModel("smsSwitch")
                    .setProperty("/enabled", bState);

                MessageToast.show(
                    bState
                    ? "SMS Alerts Enabled"
                    : "SMS Alerts Disabled"
                );

            },

            // LEAVE STATUS UPDATES

            onLeaveStatusChange: function (oEvent) {

                var bState =
                    oEvent.getParameter("state");

                this.getView()
                    .getModel("leaveSwitch")
                    .setProperty("/enabled", bState);

                MessageToast.show(
                    bState
                    ? "Leave Status Updates Enabled"
                    : "Leave Status Updates Disabled"
                );

            },

            // BONAFIDE ALERTS

            onBonafideChange: function (oEvent) {

                var bState =
                    oEvent.getParameter("state");

                this.getView()
                    .getModel("bonafideSwitch")
                    .setProperty("/enabled", bState);

                MessageToast.show(
                    bState
                    ? "Bonafide Alerts Enabled"
                    : "Bonafide Alerts Disabled"
                );

            },

            // DARK MODE THEME

            onThemeChange: function (oEvent) {

                var bState =
                    oEvent.getParameter("state");

                // UPDATE MODEL

                this.getView()
                    .getModel("themeSwitch")
                    .setProperty("/enabled", bState);

                // SAVE THEME

                localStorage.setItem(
                    "darkMode",
                    bState
                );

                // APPLY DARK MODE

                if (bState) {

                    sap.ui.getCore().applyTheme(
                        "sap_horizon_dark"
                    );

                    MessageToast.show(
                        "Dark Mode Enabled"
                    );

                }

                // APPLY LIGHT MODE

                else {

                    sap.ui.getCore().applyTheme(
                        "sap_horizon"
                    );

                    MessageToast.show(
                        "Dark Mode Disabled"
                    );

                }

            }

        }
    );

});