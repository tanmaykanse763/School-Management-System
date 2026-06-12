sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel"
], function (UIComponent, JSONModel) {
    "use strict";

    return UIComponent.extend("schoolui.Component", {

        metadata: {
            manifest: "json"
        },

        init: function () {

            // Base init
            UIComponent.prototype.init.apply(this, arguments);

            var oNotificationModel = new JSONModel({
                notifications: []
            });

            this.setModel(oNotificationModel, "notification");

            // Apply saved dark mode

            try {
                var sData = localStorage.getItem("eduPortalSettings");

                if (sData) {
                    var oData = JSON.parse(sData);

                    if (oData.darkMode === true) {
                        sap.ui.getCore().applyTheme("sap_horizon_dark");
                    }
                }

            } catch (e) {
                console.log("Dark mode load failed", e);
            }


            // Initialize Router

            this.getRouter().initialize();
        }

    });
});