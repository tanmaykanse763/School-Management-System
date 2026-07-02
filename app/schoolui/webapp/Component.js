sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel"
], function (UIComponent, JSONModel) {

    "use strict";

    return UIComponent.extend("schoolui.Component", {

        metadata: {
            manifest: "json"
        },

        init: async function () {

            // Initialize Component
            UIComponent.prototype.init.apply(this, arguments);

            // Get OData Model
            const oModel = this.getModel();

            if (!oModel) {
                console.error("OData Model not found");
                this.getRouter().initialize();
                return;
            }

            try {

                // Wait until metadata is loaded
                await oModel.getMetaModel().requestObject("/");
                console.log("Metadata Loaded Successfully");
                
                // Call CAP Function Import
                const oBinding = oModel.bindContext("/getUserInfo(...)");

                await oBinding.execute();

                const oContext = oBinding.getBoundContext();

                if (!oContext) {
                    throw new Error("No context returned from getUserInfo()");
                }

                const oUser = oContext.getObject();

                if (!oUser) {
                    throw new Error("User object is empty");
                }

                // Store globally
                this.userInfo = oUser;

                this.loggedInUser = (oUser.email || "").trim().toLowerCase();

                this.loggedInRole = oUser.role || "";

                console.log("Role             :", this.loggedInRole);

                const oRoleModel = new JSONModel({

                    isAdmin: this.loggedInRole === "Admin",

                    isStudent: this.loggedInRole === "Student"

                });

                this.setModel(oRoleModel, "role");

                
                console.log("JWT USER INFORMATION");

                console.table({
                    ID: oUser.id,
                    Name: oUser.name,
                    Email: oUser.email,
                    Role: this.loggedInRole,
                    Token: oUser.token
                });

                console.log("ID               :", oUser.id);
                console.log("Name             :", oUser.name);
                console.log("Email from JWT   :", oUser.email);
                console.log("Stored Email     :", this.loggedInUser);
                console.log("Role             :", oUser.role);
                console.log("Is Admin         :", oRoleModel.getProperty("/isAdmin"));
                console.log("Is Student       :", oRoleModel.getProperty("/isStudent"));
                console.log("Token            :", oUser.token);


            } catch (oError) {

                console.error("ERROR WHILE LOADING USER");

                console.error(oError);

                if (oError.responseText) {
                    console.error(oError.responseText);
                }

                this.loggedInUser = "";

                this.loggedInRole = "";

                this.setModel(new JSONModel({

                    isAdmin: false,

                    isStudent: false

                }), "role");
            }

            console.log(" Initializing Router");
            console.log("Logged User :", this.loggedInUser);
            console.log("Logged Role :", this.loggedInRole);

            // Initialize Router after user info is loaded
            this.getRouter().initialize();

        }

    });

});