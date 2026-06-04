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


            onInit: async function () {

                var oModel = new ODataModel({

                    serviceUrl: "/odata/v4/school/",
                    synchronizationMode: "None",
                    operationMode: "Server"

                });

                this.getView().setModel(oModel);

                var oFilterModel = new JSONModel({

                    selectedButton: "All"

                });

                this.getView().setModel(
                    oFilterModel,
                    "filterModel"
                );

                // LOGIN USER EMAIL

                var sEmail = "samruddhi.chaure@cloudstine.com";
                // pass this email id to User entity set and fetch User details like name, department etc and bind to header

                // HEADER DATA
                var oUserBinding = oModel.bindList(
                    "/Users",
                    undefined,
                    undefined,
                    undefined,
                    {
                        $filter: "email eq '" + sEmail + "'"
                    }
                );

                var aUserContexts = await oUserBinding.requestContexts();

                if (aUserContexts.length > 0) {

                    var oUserData = aUserContexts[0].getObject();

                    console.log(oUserData);

                    this.byId("selectedStudentName")
                        .setText(oUserData.name);

                    this.byId("selectedStudentEmail")
                        .setText(oUserData.email);

                    this.byId("selectedDepartment")
                        .setText(oUserData.department);
                }

                // FILTER ALL TABLE FOR LOGIN USER

                var oTable =
                    this.byId("leaveTable");

                oTable.attachEventOnce(
                    "updateFinished",
                    function () {

                        var oTableBinding =
                            oTable.getBinding("items");

                        oTableBinding.filter([

                            new Filter(
                                "studentEmail",
                                FilterOperator.EQ,
                                sEmail
                            )

                        ]);

                    }
                );

            },
            //onAfterRendering: function () {

            //   var oTable =
            //      this.byId("leaveTable");

            //    var oBinding =
            //      oTable.getBinding("items");

            //  if (oBinding) {

            //        var oFilter =
            //            new Filter(
            //                "studentEmail",
            //                FilterOperator.EQ,
            //                "pratihastrajneesh0@gmail.com"
            //            );

            //        oBinding.filter([oFilter]);
            //    }

            //},


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
                var oStudentName = sap.ui.core.Fragment.byId(
                    this.getView().getId(),
                    "leaveStudentName"
                );

                var oStudentEmail = sap.ui.core.Fragment.byId(
                    this.getView().getId(),
                    "leaveStudentEmail"
                );

                var oDepartment = sap.ui.core.Fragment.byId(
                    this.getView().getId(),
                    "leaveDepartment"
                );

                var oLeaveType = sap.ui.core.Fragment.byId(
                    this.getView().getId(),
                    "leaveType"
                );

                var oFromDate = sap.ui.core.Fragment.byId(
                    this.getView().getId(),
                    "leaveFromDate"
                );

                var oToDate = sap.ui.core.Fragment.byId(
                    this.getView().getId(),
                    "leaveToDate"
                );

                var oReason = sap.ui.core.Fragment.byId(
                    this.getView().getId(),
                    "leaveReason"
                );

                // VALUES
                var sStudentName = oStudentName.getValue();
                var sStudentEmail = oStudentEmail.getValue();
                var sDepartment = oDepartment.getSelectedKey();
                var sLeaveType = oLeaveType.getSelectedKey();

                var dFromDate = oFromDate.getDateValue();
                var dToDate = oToDate.getDateValue();

                var sReason = oReason.getValue();

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
                    MessageToast.show("Please fill all required fields");
                    return;
                }

                // EMAIL VALIDATION
                var gmailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

                if (!gmailPattern.test(sStudentEmail)) {
                    MessageToast.show("Enter valid Gmail Address");
                    return;
                }

                // REASON VALIDATION
                if (sReason.length < 5) {
                    MessageToast.show("Reason minimum 5 characters required");
                    return;
                }

                // FORMAT FROM DATE
                var sFormattedFromDate =
                    dFromDate.getFullYear() + "-" +
                    String(dFromDate.getMonth() + 1).padStart(2, "0") + "-" +
                    String(dFromDate.getDate()).padStart(2, "0");

                // FORMAT TO DATE
                var sFormattedToDate =
                    dToDate.getFullYear() + "-" +
                    String(dToDate.getMonth() + 1).padStart(2, "0") + "-" +
                    String(dToDate.getDate()).padStart(2, "0");

                // ODATA MODEL
                var oModel = this.getView().getModel();

                // PAYLOAD
                var oPayload = {
                    studentName: String(sStudentName),
                    studentEmail: String(sStudentEmail),
                    department: String(sDepartment),
                    leaveType: String(sLeaveType),
                    fromDate: sFormattedFromDate,
                    toDate: sFormattedToDate,
                    reason: String(sReason),
                    status: "Pending",
                    appliedOn: new Date().toISOString()
                };

                console.log(oPayload);

                // CREATE POST CALL
                var oBinding = oModel.bindList("/Leaves");
                oBinding.create(oPayload);

                // SUCCESS MESSAGE
                MessageToast.show("Leave Request Submitted Successfully");

                // ADD DYNAMIC NOTIFICATION
                // GET APP CONTROLLER SAFELY
                var oAppView = sap.ui.getCore().byId("container-schoolui---app");

                if (oAppView) {

                    var oAppCtrl = oAppView.getController();

                    if (oAppCtrl && oAppCtrl.addNotification) {

                        oAppCtrl.addNotification({
                            type: "leave",
                            icon: "sap-icon://document-text",
                            iconColor: "#185FA5",
                            title: "Leave Request Submitted",
                            description: "Leave request submitted successfully",
                            statusText: "Pending",
                            statusState: "Warning",
                            time: new Date().toLocaleString()
                        });

                    }
                }

                // REFRESH TABLE
                var oTable = this.byId("leaveTable");

                if (oTable && oTable.getBinding("items")) {
                    oTable.getBinding("items").refresh();
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

            //filter all
            onFilterAll: function () {

                var sEmail =
                    "samruddhi.chaure@cloudstine.com";

                var oTable =
                    this.byId("leaveTable");

                var oBinding =
                    oTable.getBinding("items");

                var oEmailFilter =
                    new Filter(
                        "studentEmail",
                        FilterOperator.EQ,
                        sEmail
                    );

                oBinding.filter([
                    oEmailFilter
                ]);

                this.getView()
                    .getModel("filterModel")
                    .setProperty(
                        "/selectedButton",
                        "All"
                    );

            },

            //filter pending

            onFilterPending: function () {

                var oTable =
                    this.byId("leaveTable");

                var oBinding =
                    oTable.getBinding("items");

                var oCombinedFilter =
                    new Filter({

                        filters: [

                            new Filter(
                                "studentEmail",
                                FilterOperator.EQ,
                                "samruddhi.chaure@cloudstine.com"
                            ),

                            new Filter(
                                "status",
                                FilterOperator.EQ,
                                "Pending"
                            )

                        ],

                        and: true

                    });

                oBinding.filter([
                    oCombinedFilter
                ]);

                this.getView()
                    .getModel("filterModel")
                    .setProperty(
                        "/selectedButton",
                        "Pending"
                    );

            },



            //filter approved
            onFilterApproved: function () {

                var oTable =
                    this.byId("leaveTable");

                var oBinding =
                    oTable.getBinding("items");

                var oCombinedFilter =
                    new Filter({

                        filters: [

                            new Filter(
                                "studentEmail",
                                FilterOperator.EQ,
                                "samruddhi.chaure@cloudstine.com"
                            ),

                            new Filter(
                                "status",
                                FilterOperator.EQ,
                                "Approved"
                            )

                        ],

                        and: true

                    });

                oBinding.filter([
                    oCombinedFilter
                ]);

            },

            //filter rejected
            onFilterRejected: function () {

                var oTable = this.byId("leaveTable");

                var oBinding = oTable.getBinding("items");

                var oCombinedFilter = new Filter({

                    filters: [

                        new Filter(
                            "studentEmail",
                            FilterOperator.EQ,
                            "samruddhi.chaure@cloudstine.com"
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

            },


            // search 

            onSearchLeave: function (oEvent) {

                var sValue = oEvent.getParameter("newValue");

                var sEmail = "samruddhi.chaure@cloudstine.com";

                var oTable = this.byId("leaveTable");

                var oBinding = oTable.getBinding("items");

                var aFilters = [];

                // Email filter
                aFilters.push(
                    new Filter(
                        "studentEmail",
                        FilterOperator.EQ,
                        sEmail
                    )
                );

                // Search filter
                if (sValue && sValue.trim() !== "") {

                    var oSearchFilter = new Filter({

                        filters: [

                            new Filter(
                                "leaveType",
                                FilterOperator.Contains,
                                sValue
                            ),

                            new Filter(
                                "status",
                                FilterOperator.Contains,
                                sValue
                            ),

                            new Filter(
                                "reason",
                                FilterOperator.Contains,
                                sValue
                            )

                        ],

                        and: false

                    });

                    aFilters.push(oSearchFilter);
                }

                oBinding.filter(
                    aFilters,
                    "Application"
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