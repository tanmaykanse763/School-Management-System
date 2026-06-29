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

                var oModel = this.getOwnerComponent().getModel();
                this.getView().setModel(oModel);

                this.getView().setModel(
                    new JSONModel({
                        selectedButton: "All"
                    }),
                    "filterModel"
                );

                this.getOwnerComponent()
                    .getRouter()
                    .getRoute("BonafideCert")
                    .attachMatched(this._onRouteMatched, this);

            },

            _onRouteMatched: async function () {

                var oModel = this.getOwnerComponent().getModel();

                await oModel.getMetaModel().requestObject("/");

                var sEmail = this.getOwnerComponent().loggedInUser;

                console.log("=================================");
                console.log("Logged User :", sEmail);
                console.log("=================================");

                if (!sEmail) {
                    console.error("Logged user email not found");
                    return;
                }

                // Header User Info
                var oUserBinding = oModel.bindList(
                    "/Users",
                    null,
                    null,
                    [
                        new Filter(
                            "email",
                            FilterOperator.EQ,
                            sEmail
                        )
                    ]
                );

                var aUser = await oUserBinding.requestContexts();

                if (aUser.length > 0) {

                    var oUser = aUser[0].getObject();

                    this.byId("selectedStudentName").setText(oUser.name);
                    this.byId("selectedStudentEmail").setText(oUser.email);
                    this.byId("selectedDepartment").setText(oUser.department);

                }

                // Bonafide Table Filter
                var oTable = this.byId("bonafideTable");

                var oBinding = oTable.getBinding("items");

                if (oBinding) {

                    oBinding.filter([
                        new Filter(
                            "studentEmail",
                            FilterOperator.EQ,
                            sEmail
                        )
                    ]);

                    oBinding.refresh();

                }

            },

            onTabSelect: function (oEvent) {

                var sKey = oEvent.getParameter("key");

                var oBinding = this.byId("bonafideTable").getBinding("items");

                if (sKey === "All") {

                    this.onFilterAll();

                } else if (sKey === "Pending") {

                    this.onFilterPending();

                } else if (sKey === "Approved") {

                    this.onFilterApproved();

                } else if (sKey === "Rejected") {

                    this.onFilterRejected();

                }

                this.getView()
                    .getModel("filterModel")
                    .setProperty("/selectedButton", sKey);

            },
            // onAfterRendering: function () {

            //     var oTable =
            //         this.byId("bonafideTable");

            //     var oBinding =
            //         oTable.getBinding("items");

            //     if (oBinding) {

            //         var oFilter =
            //             new Filter(
            //                 "studentEmail",
            //                 FilterOperator.EQ,
            //                 "pratihastrajneesh0@gmail.com"
            //             );

            //         oBinding.filter([oFilter]);

            //     }

            // },

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

                    status:
                        "Pending"



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

                var sEmail = this.getOwnerComponent().loggedInUser;

                console.log("==================================");
                console.log("Logged In User Email :", sEmail);
                console.log("==================================");

                var oTable = this.byId("bonafideTable");
                var oBinding = oTable.getBinding("items");

                var oFilter = new Filter(
                    "studentEmail",
                    FilterOperator.EQ,
                    sEmail
                );

                console.log("Created Filter :", oFilter);

                oBinding.filter([oFilter]);

                console.log("Binding :", oBinding);
                console.log("Current Contexts :", oBinding.getCurrentContexts());

                oBinding.refresh();

                this.getView()
                    .getModel("filterModel")
                    .setProperty("/selectedButton", "All");

            },

            // FILTER PENDING

            onFilterPending: function () {

                var sEmail = this.getOwnerComponent().loggedInUser;

                console.log("========================================");
                console.log("PENDING TAB");
                console.log("Logged User Email :", sEmail);
                console.log("========================================");

                if (!sEmail) {
                    console.error("Logged user email not available.");
                    return;
                }

                var oTable = this.byId("bonafideTable");

                var oBinding = oTable.getBinding("items");

                console.log("Table Binding :", oBinding);

                var oCombinedFilter = new Filter({

                    filters: [

                        new Filter(
                            "studentEmail",
                            FilterOperator.EQ,
                            sEmail
                        ),

                        new Filter(
                            "status",
                            FilterOperator.EQ,
                            "Pending"
                        )

                    ],

                    and: true

                });

                oBinding.filter([oCombinedFilter]);

                oBinding.refresh();

                this.getView()
                    .getModel("filterModel")
                    .setProperty("/selectedButton", "Pending");

            },

            // FILTER APPROVED

            onFilterApproved: function () {

                var sEmail = this.getOwnerComponent().loggedInUser;

                console.log("========================================");
                console.log("APPROVED TAB");
                console.log("Logged User Email :", sEmail);
                console.log("========================================");

                if (!sEmail) {
                    console.error("Logged user email not available.");
                    return;
                }

                var oTable = this.byId("bonafideTable");

                var oBinding = oTable.getBinding("items");

                console.log("Table Binding :", oBinding);

                var oCombinedFilter = new Filter({

                    filters: [

                        new Filter(
                            "studentEmail",
                            FilterOperator.EQ,
                            sEmail
                        ),

                        new Filter(
                            "status",
                            FilterOperator.EQ,
                            "Approved"
                        )

                    ],

                    and: true

                });

                oBinding.filter([oCombinedFilter]);

                oBinding.refresh();

                this.getView()
                    .getModel("filterModel")
                    .setProperty("/selectedButton", "Approved");

            },
            // FILTER REJECTED

            onFilterRejected: function () {

                var sEmail = this.getOwnerComponent().loggedInUser;

                console.log("========================================");
                console.log("REJECTED TAB");
                console.log("Logged User Email :", sEmail);
                console.log("========================================");

                if (!sEmail) {
                    console.error("Logged user email not available.");
                    return;
                }

                var oTable = this.byId("bonafideTable");

                var oBinding = oTable.getBinding("items");

                console.log("Table Binding :", oBinding);

                var oCombinedFilter = new Filter({

                    filters: [

                        new Filter(
                            "studentEmail",
                            FilterOperator.EQ,
                            sEmail
                        ),

                        new Filter(
                            "status",
                            FilterOperator.EQ,
                            "Rejected"
                        )

                    ],

                    and: true

                });

                oBinding.filter([oCombinedFilter]);

                oBinding.refresh();

                this.getView()
                    .getModel("filterModel")
                    .setProperty("/selectedButton", "Rejected");

            }
        }
    );

});