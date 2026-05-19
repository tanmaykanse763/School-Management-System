sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/ui/model/odata/v4/ODataModel",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (
    Controller,
    MessageToast,
    Fragment,
    ODataModel,
    JSONModel,
    Filter,
    FilterOperator
) {

    "use strict";

    return Controller.extend(
        "schoolui.controller.BonafideCert",
        {

            // INIT

            onInit: function () {

                

                var oModel = new ODataModel({

                    serviceUrl:
                        "/odata/v4/school/",

                    synchronizationMode:
                        "None",

                    operationMode:
                        "Server"

                });

                // SET MAIN MODEL

                this.getView().setModel(oModel);

                // FILTER BUTTON MODEL

                var oFilterModel =
                    new JSONModel({

                        selectedButton:
                            "All"

                    });

                // SET FILTER MODEL

                this.getView().setModel(
                    oFilterModel,
                    "filterModel"
                );

            },

            // OPEN DIALOG

            onRequestCertificate: function () {

                var oView =
                    this.getView();

                // LOAD FRAGMENT ONLY ONCE

                if (!this._pDialog) {

                    this._pDialog =
                        Fragment.load({

                            id:
                                oView.getId(),

                            name:
                                "schoolui.view.fragments.RequestDialog",

                            controller:
                                this

                        }).then(function (oDialog) {

                            oView.addDependent(oDialog);

                            return oDialog;

                        });

                }

                // OPEN DIALOG

                this._pDialog.then(function (oDialog) {

                    oDialog.open();

                });

            },

            // ROW SELECTION

onSelectionChange: function (oEvent) {

    var oSelectedItem =
        oEvent.getParameter("listItem");

    if (!oSelectedItem) {

        return;

    }

    var oContext =
        oSelectedItem.getBindingContext();

    if (!oContext) {

        return;

    }

    var oData =
        oContext.getObject();

    // SHOW STUDENT NAME

    this.byId("selectedStudentName")
        .setText(oData.studentName);

    // SHOW STUDENT EMAIL

    this.byId("selectedStudentEmail")
        .setText(oData.studentEmail);

    this.byId("selectedDepartment")
        .setText(oData.department);

},

// SEARCH FUNCTION

onSearchBonafide: function (oEvent) {

    var sValue =
        oEvent.getParameter("newValue");

    var aFilters = [];

    // CREATE FILTERS

    if (sValue) {

        aFilters.push(

            new sap.ui.model.Filter({

                filters: [

                    new sap.ui.model.Filter(
                        "studentName",
                        sap.ui.model.FilterOperator.Contains,
                        sValue
                    ),

                    new sap.ui.model.Filter(
                        "studentEmail",
                        sap.ui.model.FilterOperator.Contains,
                        sValue
                    ),

                    new sap.ui.model.Filter(
                        "department",
                        sap.ui.model.FilterOperator.Contains,
                        sValue
                    ),

                    new sap.ui.model.Filter(
                        "purpose",
                        sap.ui.model.FilterOperator.Contains,
                        sValue
                    )

                ],

                and: false

            })

        );

    }

    // ALL TABLE

    var oAllTable =
        this.byId("bonafideTable");

    if (oAllTable) {

        oAllTable
            .getBinding("items")
            .filter(aFilters);

    }

    // PENDING TABLE

    var oPendingTable =
        this.byId("pendingBonafideTable");

    if (oPendingTable) {

        oPendingTable
            .getBinding("items")
            .filter(aFilters);

    }

    // APPROVED TABLE

    var oApprovedTable =
        this.byId("approvedBonafideTable");

    if (oApprovedTable) {

        oApprovedTable
            .getBinding("items")
            .filter(aFilters);

    }

    // REJECTED TABLE

    var oRejectedTable =
        this.byId("rejectedBonafideTable");

    if (oRejectedTable) {

        oRejectedTable
            .getBinding("items")
            .filter(aFilters);

    }

},

            // SUBMIT REQUEST

            onSubmitRequest: function () {

                // CONTROLS

                var oPurpose =
                    sap.ui.core.Fragment.byId(
                        this.getView().getId(),
                        "dialogPurposeSelect"
                    );

                var oIssuedTo =
                    sap.ui.core.Fragment.byId(
                        this.getView().getId(),
                        "dialogIssuedTo"
                    );

                var oStudentEmail =
                    sap.ui.core.Fragment.byId(
                        this.getView().getId(),
                        "dialogStudentEmail"
                    );

                var oDepartment =
                    sap.ui.core.Fragment.byId(
                        this.getView().getId(),
                        "dialogDepartment"
                    );

                var oRemarks =
                    sap.ui.core.Fragment.byId(
                        this.getView().getId(),
                        "dialogRemarks"
                    );

                var oCopies =
                    sap.ui.core.Fragment.byId(
                        this.getView().getId(),
                        "dialogCopiesSelect"
                    );

                // SAFETY CHECK

                if (
                    !oPurpose ||
                    !oIssuedTo ||
                    !oStudentEmail ||
                    !oDepartment ||
                    !oRemarks ||
                    !oCopies
                ) {

                    MessageToast.show(
                        "Fragment Controls Not Found"
                    );

                    return;

                }

                // VALUES

                var sPurpose =
                    oPurpose.getSelectedKey();

                var sIssuedTo =
                    oIssuedTo.getValue();

                var sStudentEmail =
                    oStudentEmail.getValue();

                var sDepartment =
                    oDepartment.getSelectedKey();

                var sRemarks =
                    oRemarks.getValue();

                var iCopies =
                    parseInt(
                        oCopies.getSelectedKey()
                    );

                // REQUIRED VALIDATION

                if (
                    !sPurpose ||
                    sPurpose === "--Select--" ||
                    !sIssuedTo ||
                    !sStudentEmail ||
                    !sDepartment ||
                    sDepartment === "--Select--"
                ) {

                    MessageToast.show(
                        "Please fill all required fields"
                    );

                    return;

                }

                // PURPOSE VALIDATION

                if (
                    sPurpose.trim().length < 5
                ) {

                    MessageToast.show(
                        "Purpose minimum 5 characters required"
                    );

                    return;

                }

                // EMAIL VALIDATION

                if (
                    !sStudentEmail.includes("@")
                ) {

                    MessageToast.show(
                        "Enter valid email"
                    );

                    return;

                }

                // ODATA MODEL

                var oModel =
                    this.getView().getModel();

                // PAYLOAD

                var oPayload = {

                    studentName:
                        sIssuedTo,

                    studentEmail:
                        sStudentEmail,

                    department:
                        sDepartment,

                    purpose:
                        sPurpose,

                    noOfCopies:
                        iCopies,



                };

                // CREATE POST CALL

                var oBinding =
                    oModel.bindList("/Bonafide");

                oBinding.create(oPayload);

                // SUCCESS MESSAGE

                MessageToast.show(
                    "Bonafide Request Submitted Successfully"
                );

                // REFRESH TABLE

                this.byId("bonafideTable")
                    .getBinding("items")
                    .refresh();

                // RESET FIELDS

                oPurpose.setSelectedKey("--Select--");

                oIssuedTo.setValue("");

                oStudentEmail.setValue("");

                oDepartment.setSelectedKey("--Select--");

                oRemarks.setValue("");

                oCopies.setSelectedKey("1");

                // CLOSE DIALOG

                sap.ui.core.Fragment.byId(
                    this.getView().getId(),
                    "requestDialog"
                ).close();

            },

            // CANCEL DIALOG

            onCancelDialog: function () {

                var oDialog =
                    sap.ui.core.Fragment.byId(
                        this.getView().getId(),
                        "requestDialog"
                    );

                if (oDialog) {

                    oDialog.close();

                }

            },


            // ONLY LETTERS ALLOWED

            onNameLiveChange: function (oEvent) {

                var sValue =
                    oEvent.getParameter("value");

                // REMOVE DIGITS & SPECIAL CHARACTERS

                sValue =
                    sValue.replace(/[^a-zA-Z ]/g, "");

                oEvent.getSource().setValue(
                    sValue
                );

            },

            // ONLY GMAIL VALIDATION

            onEmailLiveChange: function (oEvent) {

                var oInput =
                    oEvent.getSource();

                var sValue =
                    oInput.getValue();

                // CHECK GMAIL FORMAT

                var gmailPattern =
                    /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

                if (
                    sValue === "" ||
                    gmailPattern.test(sValue)
                ) {

                    oInput.setValueState("None");

                } else {

                    oInput.setValueState("Error");

                    oInput.setValueStateText(
                        "Enter valid Email address"
                    );

                }

            },

            onSearchBonafide: function (oEvent) {

                // SEARCH VALUE

                var sValue =
                    oEvent.getParameter("newValue");

                // TABLE

                var oTable =
                    this.byId("bonafideTable");

                var oBinding =
                    oTable.getBinding("items");

                // FILTERS

                var aFilters = [];

                // SEARCH IN MULTIPLE COLUMNS

                if (sValue) {

                    aFilters.push(

                        new sap.ui.model.Filter({

                            filters: [

                                // STUDENT NAME

                                new sap.ui.model.Filter(
                                    "studentName",
                                    sap.ui.model.FilterOperator.Contains,
                                    sValue
                                ),

                                // EMAIL

                                new sap.ui.model.Filter(
                                    "studentEmail",
                                    sap.ui.model.FilterOperator.Contains,
                                    sValue
                                ),

                                // DEPARTMENT

                                new sap.ui.model.Filter(
                                    "department",
                                    sap.ui.model.FilterOperator.Contains,
                                    sValue
                                ),

                                // PURPOSE

                                new sap.ui.model.Filter(
                                    "purpose",
                                    sap.ui.model.FilterOperator.Contains,
                                    sValue
                                ),

                                // STATUS

                                new sap.ui.model.Filter(
                                    "status",
                                    sap.ui.model.FilterOperator.Contains,
                                    sValue
                                )

                            ],

                            and: false

                        })

                    );

                }

                // APPLY FILTER

                oBinding.filter(aFilters);

            },

            // FILTER ALL

            onFilterAll: function () {

                var oTable =
                    this.byId("bonafideTable");

                var oBinding =
                    oTable.getBinding("items");

                // CLEAR FILTER

                oBinding.filter([]);

                // ACTIVE BUTTON

                this.getView()
                    .getModel("filterModel")
                    .setProperty(
                        "/selectedButton",
                        "All"
                    );

            },

            // FILTER PENDING

            onFilterPending: function () {

                var oTable =
                    this.byId("bonafideTable");

                var oBinding =
                    oTable.getBinding("items");

                var oFilter =
                    new Filter(
                        "status",
                        FilterOperator.EQ,
                        "Pending"
                    );

                // APPLY FILTER

                oBinding.filter([oFilter]);

                // ACTIVE BUTTON

                this.getView()
                    .getModel("filterModel")
                    .setProperty(
                        "/selectedButton",
                        "Pending"
                    );

            },

            // FILTER APPROVED

            onFilterApproved: function () {

                var oTable =
                    this.byId("bonafideTable");

                var oBinding =
                    oTable.getBinding("items");

                var oFilter =
                    new Filter(
                        "status",
                        FilterOperator.EQ,
                        "Approved"
                    );

                // APPLY FILTER

                oBinding.filter([oFilter]);

                // ACTIVE BUTTON

                this.getView()
                    .getModel("filterModel")
                    .setProperty(
                        "/selectedButton",
                        "Approved"
                    );

            },

            // FILTER REJECTED

            onFilterRejected: function () {

                var oTable =
                    this.byId("bonafideTable");

                var oBinding =
                    oTable.getBinding("items");

                var oFilter =
                    new Filter(
                        "status",
                        FilterOperator.EQ,
                        "Rejected"
                    );

                // APPLY FILTER

                oBinding.filter([oFilter]);

                // ACTIVE BUTTON

                this.getView()
                    .getModel("filterModel")
                    .setProperty(
                        "/selectedButton",
                        "Rejected"
                    );

            }

        }
    );

});