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

            // var oUser = sap.ushell.Container.getService("UserInfo").getUser();
            // var sEmail = oUser.getEmail();
            var sEmail = "samruddhi.chaure@cloudstine.com";

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