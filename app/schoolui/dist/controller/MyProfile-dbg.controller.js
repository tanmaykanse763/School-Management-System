sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (
    Controller,
    Filter,
    FilterOperator
) {
    "use strict";

    return Controller.extend("schoolui.controller.MyProfile", {

        onInit: async function () {
            var oModel = this.getOwnerComponent().getModel();
            await oModel.getMetaModel().requestObject("/");

            console.log("OData Metadata Loaded");

            // const oUserInfo = await sap.ushell.Container.getServiceAsync("UserInfo");
            // const sEmail = oUserInfo.getUser().getEmail();

            //    var oUser = sap.ushell.Container.getService("UserInfo").getUser();
            //    var sEmail = oUser.getEmail();
            var sEmail = this.getOwnerComponent().loggedInUser;

            if (!sEmail) {
                console.error("Logged user email not available.");
                return;
            }

            // Filter
            var oFilter = new Filter(
                "email",
                FilterOperator.EQ,
                sEmail
            );

            // Bind Users entity with filter
            var oListBinding = oModel.bindList(
                "/Users",
                null,
                null,
                [oFilter]
            );

            // Get matched contexts
            var aContexts = await oListBinding.requestContexts();

            if (aContexts.length > 0) {

                // Get path of matched user
                var sPath = aContexts[0].getPath();

                // Directly bind element to view
                this.getView().bindElement({
                    path: sPath
                });

                console.log("Bound Path:", sPath);
            }
            else {
                console.log("User not found");
            }
        }
    });
});

// sap.ui.define([
//     "sap/ui/core/mvc/Controller",
//     "sap/ui/model/Filter",
//     "sap/ui/model/FilterOperator"
// ], function (
//     Controller,
//     Filter,
//     FilterOperator
// ) {
//     "use strict";

//     return Controller.extend("schoolui.controller.MyProfile", {

//         onInit: function () {
//             var oRouter = this.getOwnerComponent().getRouter();
//             oRouter.getRoute("MyProfile").attachMatched(this._loadUserProfile, this);
//         },

//         _loadUserProfile: async function () {
//             var oView = this.getView();
//             var oModel = this.getOwnerComponent().getModel();
//             var sEmail = this.getOwnerComponent().loggedInUser;

//             if (!sEmail) {
//                 console.error("❌ No logged in user email found in component");
//                 return;
//             }

//             console.log("📧 Loading profile for email:", sEmail);

//             try {
//                 // Wait for OData metadata to be ready
//                 await oModel.getMetaModel().requestObject("/");

//                 // Lowercase to avoid case mismatch
//                 var sEmailLower = sEmail.toLowerCase();

//                 // Apply filter on email
//                 var oFilter = new Filter("email", FilterOperator.EQ, sEmailLower);

//                 // Bind list with filter
//                 var oListBinding = oModel.bindList("/Users", null, null, [oFilter]);

//                 // Request matching contexts
//                 var aContexts = await oListBinding.requestContexts();

//                 if (aContexts.length > 0) {
//                     var sPath = aContexts[0].getPath();

//                     console.log("✅ User found. Binding path:", sPath);

//                     oView.bindElement({
//                         path: sPath,
//                         events: {
//                             dataReceived: function (oEvent) {
//                                 var oData = oEvent.getParameter("data");
//                                 if (oData) {
//                                     console.log("✅ Data received:", oData);
//                                 } else {
//                                     console.warn("⚠️ dataReceived fired but data is empty");
//                                 }
//                             },
//                             change: function () {
//                                 var oContext = oView.getBindingContext();
//                                 if (oContext) {
//                                     console.log("✅ Binding context active:", oContext.getObject());
//                                 } else {
//                                     console.warn("⚠️ change fired but context is null");
//                                 }
//                             }
//                         }
//                     });

//                 } else {
//                     console.error("❌ No user found matching email:", sEmailLower);
//                 }

//             } catch (oError) {
//                 console.error("❌ Error while loading user profile:", oError);
//             }
//         }

//     });
// });