sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/odata/v4/ODataModel",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (
    Controller,
    Fragment,
    MessageToast,
    MessageBox,
    ODataModel,
    JSONModel,
    Filter,
    FilterOperator
) {

    "use strict";

    return Controller.extend(
        "schoolui.controller.LeaveRequests",
        {


            onInit: function () {

                // ODATA MODEL

                var oModel =
                    new ODataModel({

                        serviceUrl:
                            "/odata/v4/school/",

                        synchronizationMode:
                            "None",

                        operationMode:
                            "Server"

                    });

                // SET MODEL

                this.getView().setModel(
                    oModel
                );

                // FILTER MODEL

                var oFilterModel =
                    new JSONModel({

                        selectedButton:
                            "All"

                    });

                this.getView().setModel(
                    oFilterModel,
                    "filterModel"
                );

            },



            onCreateLeave: async function () {

                // LOAD FRAGMENT ONLY ONCE

                if (!this.oLeaveDialog) {

                    this.oLeaveDialog =
                        await Fragment.load({

                            id:
                                this.getView().getId(),

                            name:
                                "schoolui.view.fragments.LeaveRequestDialog",

                            controller:
                                this

                        });

                    // ADD DEPENDENT

                    this.getView().addDependent(
                        this.oLeaveDialog
                    );

                }

                // OPEN DIALOG

                this.oLeaveDialog.open();

            },

            onCancelLeaveDialog: function () {

                if (this.oLeaveDialog) {

                    this.oLeaveDialog.close();

                }

            },


            onNameLiveChange: function (oEvent) {

                var sValue =
                    oEvent.getParameter("value");

                // REMOVE DIGITS

                sValue =
                    sValue.replace(
                        /[^a-zA-Z ]/g,
                        ""
                    );

                oEvent.getSource()
                    .setValue(sValue);

            },

            onEmailLiveChange: function (oEvent) {

                var oInput =
                    oEvent.getSource();

                var sValue =
                    oInput.getValue();

                // GMAIL VALIDATION

                var gmailPattern =
                    /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

                if (
                    sValue === "" ||
                    gmailPattern.test(sValue)
                ) {

                    oInput.setValueState(
                        "None"
                    );

                } else {

                    oInput.setValueState(
                        "Error"
                    );

                    oInput.setValueStateText(
                        "Enter valid Gmail address"
                    );

                }

            },


            onSubmitLeaveRequest: function () {

                // CONTROLS

                var oStudentName =
                    sap.ui.core.Fragment.byId(
                        this.getView().getId(),
                        "leaveStudentName"
                    );

                var oStudentEmail =
                    sap.ui.core.Fragment.byId(
                        this.getView().getId(),
                        "leaveStudentEmail"
                    );

                var oDepartment =
                    sap.ui.core.Fragment.byId(
                        this.getView().getId(),
                        "leaveDepartment"
                    );

                var oLeaveType =
                    sap.ui.core.Fragment.byId(
                        this.getView().getId(),
                        "leaveType"
                    );

                var oFromDate =
                    sap.ui.core.Fragment.byId(
                        this.getView().getId(),
                        "leaveFromDate"
                    );

                var oToDate =
                    sap.ui.core.Fragment.byId(
                        this.getView().getId(),
                        "leaveToDate"
                    );

                var oReason =
                    sap.ui.core.Fragment.byId(
                        this.getView().getId(),
                        "leaveReason"
                    );

                // VALUES

                var sStudentName =
                    oStudentName.getValue();

                var sStudentEmail =
                    oStudentEmail.getValue();

                var sDepartment =
                    oDepartment.getSelectedKey();

                var sLeaveType =
                    oLeaveType.getSelectedKey();

                // DATE VALUES

                var dFromDate =
                    oFromDate.getDateValue();

                var dToDate =
                    oToDate.getDateValue();

                var sReason =
                    oReason.getValue();

                // VALIDATION

                if (
                    !sStudentName ||
                    !sStudentEmail ||
                    !sDepartment ||
                    !sLeaveType ||
                    !dFromDate ||
                    !dToDate ||
                    !sReason
                ) {

                    MessageToast.show(
                        "Please fill all required fields"
                    );

                    return;

                }

                // EMAIL VALIDATION

                if (
                    !sStudentEmail.includes("@gmail.com")
                ) {

                    MessageToast.show(
                        "Enter valid Gmail Address"
                    );

                    return;

                }

                // REASON VALIDATION

                if (
                    sReason.length < 5
                ) {

                    MessageToast.show(
                        "Reason minimum 5 characters required"
                    );

                    return;

                }

                // FORMAT FROM DATE

                var sFormattedFromDate =

                    dFromDate.getFullYear() + "-" +

                    String(
                        dFromDate.getMonth() + 1
                    ).padStart(2, "0") + "-" +

                    String(
                        dFromDate.getDate()
                    ).padStart(2, "0");

                // FORMAT TO DATE

                var sFormattedToDate =

                    dToDate.getFullYear() + "-" +

                    String(
                        dToDate.getMonth() + 1
                    ).padStart(2, "0") + "-" +

                    String(
                        dToDate.getDate()
                    ).padStart(2, "0");

                // ODATA MODEL

                var oModel =
                    this.getView().getModel();

                // PAYLOAD

                var oPayload = {

                    studentName:
                        String(sStudentName),

                    studentEmail:
                        String(sStudentEmail),

                    department:
                        String(sDepartment),

                    leaveType:
                        String(sLeaveType),

                    fromDate:
                        sFormattedFromDate,

                    toDate:
                        sFormattedToDate,

                    reason:
                        String(sReason),

                    status:
                        "Pending",

                    appliedOn:
                        new Date().toISOString()

                };

                // DEBUG PAYLOAD

                console.log(oPayload);

                // CREATE POST CALL

                var oBinding =
                    oModel.bindList("/Leaves");

                oBinding.create(oPayload);

                // SUCCESS MESSAGE

                MessageToast.show(
                    "Leave Request Submitted Successfully"
                );

                // REFRESH TABLE SAFELY

                var oTable =
                    this.byId("leaveTable");

                if (
                    oTable &&
                    oTable.getBinding("items")
                ) {

                    oTable
                        .getBinding("items")
                        .refresh();

                }

                // RESET FIELDS

                oStudentName.setValue("");

                oStudentEmail.setValue("");

                oDepartment.setSelectedKey("");

                oLeaveType.setSelectedKey("");

                oFromDate.setValue("");

                oToDate.setValue("");

                oReason.setValue("");

                // CLOSE DIALOG

                if (this.oLeaveDialog) {

                    this.oLeaveDialog.close();

                }

            },

            onSelectionChange: function (oEvent) {

                var oItem =
                    oEvent.getParameter("listItem");

                var oContext =
                    oItem.getBindingContext();

                var oData =
                    oContext.getObject();

                this.byId("selectedStudentName")
                    .setText(oData.studentName);

                this.byId("selectedStudentEmail")
                    .setText(oData.studentEmail);

                this.byId("selectedDepartment")
                    .setText(oData.department);

            },

            onSearchLeave: function (oEvent) {

                var sValue =
                    oEvent.getParameter("newValue");

                var oTable =
                    this.byId("leaveTable");

                var oBinding =
                    oTable.getBinding("items");

                var aFilters = [];

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
                                )

                            ],

                            and: false

                        })
                    );

                }

                oBinding.filter(aFilters);

            },


            onFilterAll: function () {

                var oTable =
                    this.byId("leaveTable");

                var oBinding =
                    oTable.getBinding("items");

                oBinding.filter([]);

                this.getView()
                    .getModel("filterModel")
                    .setProperty(
                        "/selectedButton",
                        "All"
                    );

            },

            onFilterPending: function () {

                var oTable =
                    this.byId("leaveTable");

                var oBinding =
                    oTable.getBinding("items");

                var oFilter =
                    new Filter(

                        "status",

                        FilterOperator.EQ,

                        "Pending"

                    );

                oBinding.filter([oFilter]);

                this.getView()
                    .getModel("filterModel")
                    .setProperty(
                        "/selectedButton",
                        "Pending"
                    );

            },


            onFilterApproved: function () {

                var oTable =
                    this.byId("leaveTable");

                var oBinding =
                    oTable.getBinding("items");

                var oFilter =
                    new Filter(

                        "status",

                        FilterOperator.EQ,

                        "Approved"

                    );

                oBinding.filter([oFilter]);

                this.getView()
                    .getModel("filterModel")
                    .setProperty(
                        "/selectedButton",
                        "Approved"
                    );

            },


            onFilterRejected: function () {

                var oTable =
                    this.byId("leaveTable");

                var oBinding =
                    oTable.getBinding("items");

                var oFilter =
                    new Filter(

                        "status",

                        FilterOperator.EQ,

                        "Rejected"

                    );

                oBinding.filter([oFilter]);

                this.getView()
                    .getModel("filterModel")
                    .setProperty(
                        "/selectedButton",
                        "Rejected"
                    );

            },

            onViewRequest: function () {

                MessageBox.information(
                    "Leave Request Details"
                );

            }

        }

    );

});