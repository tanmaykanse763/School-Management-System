sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (
    Controller
) {
    "use strict";

    return Controller.extend(
        "schoolui.controller.MyProfile",
        {

            onInit: function () {

                var oModel =
                    this.getOwnerComponent().getModel();

                // CHECK MODEL

                if (!oModel) {

                    console.log(
                        "OData Model Not Found"
                    );

                    return;

                }

                // USERS ENTITY

                var oListBinding =
                    oModel.bindList("/Users");

                // FETCH DATA

                oListBinding
                    .requestContexts(0, 1)

                    .then(function (aContexts) {

                        if (
                            aContexts.length > 0
                        ) {

                            this.getView()
                                .setBindingContext(
                                    aContexts[0]
                                );

                        }

                    }.bind(this));

            }

        }
    );

});