sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/VBox",
    "sap/m/Input",
    "sap/m/Label"
], function (
    Controller,
    MessageToast,
    MessageBox,
    Dialog,
    Button,
    VBox,
    Input,
    Label
) {
    "use strict";

    return Controller.extend("schoolui.controller.MyProfile", {

        onInit: function () {

    var oStudentModel =
        this.getOwnerComponent().getModel("student");

    this.getView().setModel(oStudentModel, "student");
},

        
        onLogout: function () {
            MessageBox.confirm(
                "Are you sure you want to log out?", {
                    title: "Logout",
                    actions: [
                        MessageBox.Action.OK,
                        MessageBox.Action.CANCEL
                    ],

                    onClose: function (sAction) {
                        if (sAction === "OK") {

                            MessageToast.show("Logged out successfully");

                            // Redirect to login page
                            sap.ui.core.UIComponent
                                .getRouterFor(this)
                                .navTo("login");
                        }
                    }.bind(this)
                }
            );
        }

    });
});