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

            UIComponent.prototype.init.apply(this, arguments);

            // Logged In User (Single Place)

                var oUser = sap.ushell.Container.getService("UserInfo").getUser();
                this.loggedInUser = oUser.getEmail();
                // Local Testing
                // this.loggedInUser = "samruddhi.chaure@cloudstine.com";

            console.log("Logged In User:", this.loggedInUser);


            // Role Model
            var oRoleModel = new JSONModel({
                isAdmin: false,
                isStudent: false
            });

            this.getRouter().initialize();
        }
    });
});