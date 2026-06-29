sap.ui.define([
    "sap/ui/core/UIComponent"
], function (UIComponent) {
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
                console.error("❌ OData Model not found");
                this.getRouter().initialize();
                return;
            }

            try {

                // Wait until metadata is loaded
                await oModel.getMetaModel().requestObject("/");

                console.log("========================================");
                console.log("✅ Metadata Loaded Successfully");
                console.log("========================================");

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

                console.log("========================================");
                console.log("JWT USER INFORMATION");
                console.log("========================================");

                console.table({
                    ID: oUser.id,
                    Name: oUser.name,
                    Email: oUser.email,
                    Role: oUser.role,
                    Token: oUser.token
                });

                console.log("ID               :", oUser.id);
                console.log("Name             :", oUser.name);
                console.log("Email from JWT   :", oUser.email);
                console.log("Stored Email     :", this.loggedInUser);
                console.log("Role             :", oUser.role);
                console.log("Token            :", oUser.token);

                console.log("========================================");

            } catch (oError) {

                console.error("========================================");
                console.error("❌ ERROR WHILE LOADING USER");
                console.error("========================================");

                console.error(oError);

                if (oError.responseText) {
                    console.error(oError.responseText);
                }

                this.loggedInUser = "";
            }

            console.log("========================================");
            console.log("🚀 Initializing Router");
            console.log("Logged User :", this.loggedInUser);
            console.log("========================================");

            // Initialize Router after user info is loaded
            this.getRouter().initialize();

        }

    });

});