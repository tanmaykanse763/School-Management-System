sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], function (Controller, JSONModel, MessageToast) {
    "use strict";

    var STORAGE_KEY = "eduPortalSettings";

    var oDefaults = {
        emailNotifications: true,
        smsAlerts: false,
        leaveStatusUpdates: true,
        bonafideAlerts: true,
        darkMode: false,
        twoFactorAuth: false,
        loginActivityAlerts: true,
        showProfile: true,
        dataExport: false,
        language: "en",
        dateFormat: "DD/MM/YYYY",
        compactView: false,
        autoApplyHolidays: false,
        attendanceReminders: true,
        reminderTime: "08:00"
    };

    return Controller.extend("schoolui.controller.Settings", {

        onInit: function () {
            var oSaved = this._loadFromStorage();
            var oData = Object.assign({}, oDefaults, oSaved);

            this.getView().setModel(new JSONModel(oData), "settings");

            
            this._applyDarkMode(oData.darkMode);
            this._applyCompactMode(oData.compactView);
        },

        
        _loadFromStorage: function () {
            try {
                var s = localStorage.getItem(STORAGE_KEY);
                return s ? JSON.parse(s) : {};
            } catch (e) { return {}; }
        },

        _saveToStorage: function () {
            try {
                var oData = this.getView().getModel("settings").getData();
                localStorage.setItem(STORAGE_KEY, JSON.stringify(oData));
            } catch (e) { }
        },

    
        _applyDarkMode: function (bEnabled) {
            sap.ui.getCore().applyTheme(
                bEnabled ? "sap_horizon_dark" : "sap_horizon"
            );
        },

        
        _applyCompactMode: function (bEnabled) {
            document.body.classList.toggle("sapUiSizeCompact", bEnabled);
        },

       
        onEmailNotificationsChange: function (oEvent) {
            this._saveToStorage();
            MessageToast.show("Email Notifications: " +
                (oEvent.getParameter("state") ? "Enabled" : "Disabled"));
        },

        onSmsAlertsChange: function (oEvent) {
            this._saveToStorage();
            MessageToast.show("SMS Alerts: " +
                (oEvent.getParameter("state") ? "Enabled" : "Disabled"));
        },

        onLeaveStatusUpdatesChange: function (oEvent) {
            this._saveToStorage();
            MessageToast.show("Leave Status Updates: " +
                (oEvent.getParameter("state") ? "Enabled" : "Disabled"));
        },

        onBonafideAlertsChange: function (oEvent) {
            this._saveToStorage();
            MessageToast.show("Bonafide Alerts: " +
                (oEvent.getParameter("state") ? "Enabled" : "Disabled"));
        },

        
        onDarkModeChange: function (oEvent) {
            var bState = oEvent.getParameter("state");
            this._applyDarkMode(bState);
            this._saveToStorage();
            MessageToast.show("Dark Mode: " + (bState ? "Enabled" : "Disabled"));
        },

        
        onTwoFactorAuthChange: function (oEvent) {
            this._saveToStorage();
            MessageToast.show("Two-Factor Auth: " +
                (oEvent.getParameter("state") ? "Enabled" : "Disabled"));
        },

        onLoginActivityAlertsChange: function (oEvent) {
            this._saveToStorage();
            MessageToast.show("Login Alerts: " +
                (oEvent.getParameter("state") ? "Enabled" : "Disabled"));
        },

        onShowProfileChange: function (oEvent) {
            this._saveToStorage();
            MessageToast.show("Show Profile: " +
                (oEvent.getParameter("state") ? "Enabled" : "Disabled"));
        },

        onDataExportChange: function (oEvent) {
            this._saveToStorage();
            MessageToast.show("Data Export: " +
                (oEvent.getParameter("state") ? "Enabled" : "Disabled"));
        },

        
        onLanguageChange: function (oEvent) {
            this._saveToStorage();
            MessageToast.show("Language: " +
                oEvent.getParameter("selectedItem").getText());
        },

        onDateFormatChange: function (oEvent) {
            this._saveToStorage();
            MessageToast.show("Date Format: " +
                oEvent.getParameter("selectedItem").getText());
        },

        onCompactViewChange: function (oEvent) {
            var bState = oEvent.getParameter("state");
            this._applyCompactMode(bState);
            this._saveToStorage();
            MessageToast.show("Compact View: " + (bState ? "Enabled" : "Disabled"));
        },

        
        onAutoApplyHolidaysChange: function (oEvent) {
            this._saveToStorage();
            MessageToast.show("Auto-Apply Holidays: " +
                (oEvent.getParameter("state") ? "Enabled" : "Disabled"));
        },

        onAttendanceRemindersChange: function (oEvent) {
            this._saveToStorage();
            MessageToast.show("Attendance Reminders: " +
                (oEvent.getParameter("state") ? "Enabled" : "Disabled"));
        },

        onReminderTimeChange: function (oEvent) {
            this._saveToStorage();
            MessageToast.show("Reminder Time: " +
                oEvent.getParameter("selectedItem").getText());
        }
    });
});