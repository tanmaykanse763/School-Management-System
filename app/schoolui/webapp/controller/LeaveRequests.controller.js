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

                var oModel = this.getOwnerComponent().getModel();
                this.getView().setModel(oModel);

                this.getView().setModel(
                    new sap.ui.model.json.JSONModel({
                        selectedButton: "All"
                    }),
                    "filterModel"
                );

                this.getOwnerComponent()
                    .getRouter()
                    .getRoute("LeaveRequests")
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

                // Leave Table Filter
                var oTable = this.byId("leaveTable");

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
                var oBinding = this.byId("leaveTable").getBinding("items");

                if (sKey === "All") {
                    oBinding.filter([]);
                } else {
                    oBinding.filter([
                        new Filter("status", FilterOperator.EQ, sKey)
                    ]);
                }

                this.getView().getModel("filterModel")
                    .setProperty("/selectedButton", sKey);
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

                console.log("JWT Logged In Email :", this.getOwnerComponent().loggedInUser);
                console.log("Student Name       :", sStudentName);
                console.log("Student Email      :", sStudentEmail);
                console.log("Department         :", sDepartment);


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


                console.table(oPayload);
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

                var sEmail = this.getOwnerComponent().loggedInUser;

                console.log("==================================");
                console.log("Logged In User Email :", sEmail);
                console.log("==================================");

                var oTable = this.byId("leaveTable");
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

                console.log("Filter Applied Successfully");

            },

            //filter pending

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

                var oTable = this.byId("leaveTable");

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


            //filter approved
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

                var oTable = this.byId("leaveTable");

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

            //filter rejected
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

                var oTable = this.byId("leaveTable");

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

            },

            // search 

            onSearchLeave: function (oEvent) {

                var sValue = oEvent.getParameter("newValue");

                var sEmail = this.getOwnerComponent().loggedInUser;

                var aFilters = [];

                aFilters.push(
                    new Filter(
                        "studentEmail",
                        FilterOperator.EQ,
                        sEmail
                    )
                );

                if (sValue) {

                    aFilters.push(

                        new Filter({

                            filters: [

                                new Filter(
                                    "leaveType",
                                    FilterOperator.Contains,
                                    sValue
                                ),

                                new Filter(
                                    "reason",
                                    FilterOperator.Contains,
                                    sValue
                                ),

                                new Filter(
                                    "status",
                                    FilterOperator.Contains,
                                    sValue
                                )

                            ],

                            and: false

                        })

                    );

                }

                this.byId("leaveTable")
                    .getBinding("items")
                    .filter(aFilters);

            },

            onViewRequest: function () {

                MessageBox.information(
                    "Leave Request Details"
                );

            }

        }

    );

});




// sap.ui.define([
//     "sap/ui/core/mvc/Controller",
//     "sap/ui/core/Fragment",
//     "sap/m/MessageToast",
//     "sap/m/MessageBox",
//     "sap/ui/model/odata/v4/ODataModel",
//     "sap/ui/model/json/JSONModel",
//     "sap/ui/model/Filter",
//     "sap/ui/model/FilterOperator"
// ], function (
//     Controller,
//     Fragment,
//     MessageToast,
//     MessageBox,
//     ODataModel,
//     JSONModel,
//     Filter,
//     FilterOperator
// ) {
//     "use strict";

//     return Controller.extend("schoolui.controller.LeaveRequests", {

//         onInit: function () {

//             var oModel = this.getOwnerComponent().getModel();
//             this.getView().setModel(oModel);

//             var oFilterModel = new JSONModel({ selectedButton: "All" });
//             this.getView().setModel(oFilterModel, "filterModel");

//             // ✅ Router use karo - async onInit nahi
//             var oRouter = this.getOwnerComponent().getRouter();
//             oRouter.getRoute("LeaveRequests").attachMatched(this._onRouteMatched, this);
//         },

//         _onRouteMatched: async function () {

//             var oModel = this.getOwnerComponent().getModel();
//             var sEmail = this.getOwnerComponent().loggedInUser;

//             if (!sEmail) {
//                 console.error("❌ No email found");
//                 return;
//             }

//             try {
//                 await oModel.getMetaModel().requestObject("/");

//                 // HEADER DATA - User info
//                 var oUserBinding = oModel.bindList(
//                     "/Users",
//                     null,
//                     null,
//                     [new Filter("email", FilterOperator.EQ, sEmail)]
//                 );

//                 var aUserContexts = await oUserBinding.requestContexts(0, 10);

//                 if (aUserContexts.length > 0) {
//                     var oUserData = aUserContexts[0].getObject();
//                     console.log("✅ User found:", oUserData);

//                     this.byId("selectedStudentName").setText(oUserData.name);
//                     this.byId("selectedStudentEmail").setText(oUserData.email);
//                     this.byId("selectedDepartment").setText(oUserData.department);
//                 } else {
//                     console.error("❌ No user found for:", sEmail);
//                 }

//                 // FILTER TABLE FOR LOGIN USER
//                 var oTable = this.byId("leaveTable");
//                 var oTableBinding = oTable.getBinding("items");

//                 if (oTableBinding) {
//                     oTableBinding.filter([
//                         new Filter("studentEmail", FilterOperator.EQ, sEmail)
//                     ]);
//                 } else {
//                     oTable.attachEventOnce("updateFinished", function () {
//                         oTable.getBinding("items").filter([
//                             new Filter("studentEmail", FilterOperator.EQ, sEmail)
//                         ]);
//                     });
//                 }

//             } catch (oError) {
//                 console.error("❌ Error in LeaveRequests:", oError);
//             }
//         },

//         onCreateLeave: async function () {
//             if (!this.oLeaveDialog) {
//                 this.oLeaveDialog = await Fragment.load({
//                     id: this.getView().getId(),
//                     name: "schoolui.view.fragments.LeaveRequestDialog",
//                     controller: this
//                 });
//                 this.getView().addDependent(this.oLeaveDialog);
//             }
//             this.oLeaveDialog.open();
//         },

//         onCancelLeaveDialog: function () {
//             if (this.oLeaveDialog) {
//                 this.oLeaveDialog.close();
//             }
//         },

//         onNameLiveChange: function (oEvent) {
//             var sValue = oEvent.getParameter("value");
//             sValue = sValue.replace(/[^a-zA-Z ]/g, "");
//             oEvent.getSource().setValue(sValue);
//         },

//         onEmailLiveChange: function (oEvent) {
//             var oInput = oEvent.getSource();
//             var sValue = oInput.getValue();
//             var gmailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
//             if (sValue === "" || gmailPattern.test(sValue)) {
//                 oInput.setValueState("None");
//             } else {
//                 oInput.setValueState("Error");
//                 oInput.setValueStateText("Enter valid Gmail address");
//             }
//         },

//         onSubmitLeaveRequest: function () {

//             var oStudentName = sap.ui.core.Fragment.byId(this.getView().getId(), "leaveStudentName");
//             var oStudentEmail = sap.ui.core.Fragment.byId(this.getView().getId(), "leaveStudentEmail");
//             var oDepartment = sap.ui.core.Fragment.byId(this.getView().getId(), "leaveDepartment");
//             var oLeaveType = sap.ui.core.Fragment.byId(this.getView().getId(), "leaveType");
//             var oFromDate = sap.ui.core.Fragment.byId(this.getView().getId(), "leaveFromDate");
//             var oToDate = sap.ui.core.Fragment.byId(this.getView().getId(), "leaveToDate");
//             var oReason = sap.ui.core.Fragment.byId(this.getView().getId(), "leaveReason");

//             var sStudentName = oStudentName.getValue();
//             var sStudentEmail = oStudentEmail.getValue();
//             var sDepartment = oDepartment.getSelectedKey();
//             var sLeaveType = oLeaveType.getSelectedKey();
//             var dFromDate = oFromDate.getDateValue();
//             var dToDate = oToDate.getDateValue();
//             var sReason = oReason.getValue();

//             if (!sStudentName || !sStudentEmail || !sDepartment || !sLeaveType || !dFromDate || !dToDate || !sReason) {
//                 MessageToast.show("Please fill all required fields");
//                 return;
//             }

//             var gmailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
//             if (!gmailPattern.test(sStudentEmail)) {
//                 MessageToast.show("Enter valid Gmail Address");
//                 return;
//             }

//             if (sReason.length < 5) {
//                 MessageToast.show("Reason minimum 5 characters required");
//                 return;
//             }

//             var sFormattedFromDate =
//                 dFromDate.getFullYear() + "-" +
//                 String(dFromDate.getMonth() + 1).padStart(2, "0") + "-" +
//                 String(dFromDate.getDate()).padStart(2, "0");

//             var sFormattedToDate =
//                 dToDate.getFullYear() + "-" +
//                 String(dToDate.getMonth() + 1).padStart(2, "0") + "-" +
//                 String(dToDate.getDate()).padStart(2, "0");

//             var oModel = this.getView().getModel();

//             var oPayload = {
//                 studentName: String(sStudentName),
//                 studentEmail: String(sStudentEmail),
//                 department: String(sDepartment),
//                 leaveType: String(sLeaveType),
//                 fromDate: sFormattedFromDate,
//                 toDate: sFormattedToDate,
//                 reason: String(sReason),
//                 status: "Pending",
//                 appliedOn: new Date().toISOString()
//             };

//             console.log(oPayload);

//             var oBinding = oModel.bindList("/Leaves");
//             oBinding.create(oPayload);

//             MessageToast.show("Leave Request Submitted Successfully");

//             var oAppView = sap.ui.getCore().byId("container-schoolui---app");
//             if (oAppView) {
//                 var oAppCtrl = oAppView.getController();
//                 if (oAppCtrl && oAppCtrl.addNotification) {
//                     oAppCtrl.addNotification({
//                         type: "leave",
//                         icon: "sap-icon://document-text",
//                         iconColor: "#185FA5",
//                         title: "Leave Request Submitted",
//                         description: "Leave request submitted successfully",
//                         statusText: "Pending",
//                         statusState: "Warning",
//                         time: new Date().toLocaleString()
//                     });
//                 }
//             }

//             var oTable = this.byId("leaveTable");
//             if (oTable && oTable.getBinding("items")) {
//                 oTable.getBinding("items").refresh();
//             }

//             oStudentName.setValue("");
//             oStudentEmail.setValue("");
//             oDepartment.setSelectedKey("");
//             oLeaveType.setSelectedKey("");
//             oFromDate.setValue("");
//             oToDate.setValue("");
//             oReason.setValue("");

//             if (this.oLeaveDialog) {
//                 this.oLeaveDialog.close();
//             }
//         },

//         onFilterAll: function () {
//             var sEmail = this.getOwnerComponent().loggedInUser;
//             this.byId("leaveTable").getBinding("items").filter([
//                 new Filter("studentEmail", FilterOperator.EQ, sEmail)
//             ]);
//             this.getView().getModel("filterModel").setProperty("/selectedButton", "All");
//         },

//         onFilterPending: function () {
//             var sEmail = this.getOwnerComponent().loggedInUser;
//             this.byId("leaveTable").getBinding("items").filter([
//                 new Filter({ filters: [
//                     new Filter("studentEmail", FilterOperator.EQ, sEmail),
//                     new Filter("status", FilterOperator.EQ, "Pending")
//                 ], and: true })
//             ]);
//             this.getView().getModel("filterModel").setProperty("/selectedButton", "Pending");
//         },

//         onFilterApproved: function () {
//             var sEmail = this.getOwnerComponent().loggedInUser;
//             this.byId("leaveTable").getBinding("items").filter([
//                 new Filter({ filters: [
//                     new Filter("studentEmail", FilterOperator.EQ, sEmail),
//                     new Filter("status", FilterOperator.EQ, "Approved")
//                 ], and: true })
//             ]);
//             this.getView().getModel("filterModel").setProperty("/selectedButton", "Approved");
//         },

//         onFilterRejected: function () {
//             var sEmail = this.getOwnerComponent().loggedInUser;
//             this.byId("leaveTable").getBinding("items").filter([
//                 new Filter({ filters: [
//                     new Filter("studentEmail", FilterOperator.EQ, sEmail),
//                     new Filter("status", FilterOperator.EQ, "Rejected")
//                 ], and: true })
//             ]);
//             this.getView().getModel("filterModel").setProperty("/selectedButton", "Rejected");
//         },

//         onSearchLeave: function (oEvent) {
//             var sValue = oEvent.getParameter("newValue");
//             var sEmail = this.getOwnerComponent().loggedInUser;
//             var oBinding = this.byId("leaveTable").getBinding("items");
//             var aFilters = [new Filter("studentEmail", FilterOperator.EQ, sEmail)];

//             if (sValue && sValue.trim() !== "") {
//                 aFilters.push(new Filter({
//                     filters: [
//                         new Filter("leaveType", FilterOperator.Contains, sValue),
//                         new Filter("status", FilterOperator.Contains, sValue),
//                         new Filter("reason", FilterOperator.Contains, sValue)
//                     ],
//                     and: false
//                 }));
//             }

//             oBinding.filter(aFilters, "Application");
//         },

//         onViewRequest: function () {
//             MessageBox.information("Leave Request Details");
//         }

//     });
// });