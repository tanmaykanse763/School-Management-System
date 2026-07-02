sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (
    Controller,
    JSONModel,
    MessageToast,
    Filter,
    FilterOperator
) {

    "use strict";

    return Controller.extend(
        "schoolui.controller.Approval",
        {

            onInit: function () {

                var oApprovalModel =
                    new JSONModel({
                        tasks: [],
                        pendingCount: 0,
                        approvedCount: 0,
                        rejectedCount: 0
                    });

                this.getView().setModel(oApprovalModel, "approval");

                this._loadTasks();

                this.getView().addEventDelegate({
                    onAfterRendering: function () {

                        var oList = this.byId("taskList");

                        if (oList) {
                            var oBinding = oList.getBinding("items");

                            if (oBinding) {
                                oBinding.filter([
                                    new Filter(
                                        "status",
                                        FilterOperator.EQ,
                                        "Pending"
                                    )
                                ]);
                            }
                        }

                    }.bind(this)
                });

            },

            _loadTasks: async function () {

                try {

                    var oModel = this.getOwnerComponent().getModel();

                    var aTasks = [];

                    // LEAVES

                    var oLeaveBinding = oModel.bindList("/Leaves");

                    var aLeaveContexts = await oLeaveBinding.requestContexts();

                    aLeaveContexts.forEach(function (oContext) {

                        var oData = oContext.getObject();

                        console.log("Leave Status:", oData.status);

                        aTasks.push({

                            ID: oData.ID,

                            title:
                                oData.studentName +
                                " - Leave Request",

                            type: "Leave",

                            status:
                                oData.status
                                    ? oData.status.trim()
                                    : "Pending",

                            studentName: oData.studentName,

                            studentEmail: oData.studentEmail,

                            department: oData.department,

                            description: oData.reason,

                            createdAt: oData.appliedOn,

                            fromDate: oData.fromDate,

                            toDate: oData.toDate

                        });

                    });

                    // BONAFIDE

                    var oBonafideBinding = oModel.bindList("/Bonafide");

                    var aBonafideContexts = await oBonafideBinding.requestContexts();

                    aBonafideContexts.forEach(function (oContext) {

                        var oData = oContext.getObject();

                        console.log("Bonafide Status:", oData.status);

                        aTasks.push({

                            ID: oData.ID,

                            title:
                                oData.studentName +
                                " - Bonafide Request",

                            type: "Bonafide",

                            status:
                                oData.status
                                    ? oData.status.trim()
                                    : "Pending",

                            studentName: oData.studentName,

                            studentEmail: oData.studentEmail,

                            department: oData.department,

                            description: oData.purpose,

                            createdAt: oData.createdAt,

                            mobileNumber: oData.mobileNumber,

                            dateOfBirth: oData.dateOfBirth,

                            address: oData.address,

                            guardianName: oData.guardianName,

                            guardianNumber: oData.guardianNumber

                        });

                    });

                    // SORT LATEST FIRST

                    aTasks.sort(function (
                        a,
                        b
                    ) {

                        return (
                            new Date(
                                b.createdAt
                            ) -
                            new Date(
                                a.createdAt
                            )
                        );

                    });

                    console.log("Final Tasks:",aTasks);

                    var iPending = aTasks.filter(function (oItem) {
                        return oItem.status === "Pending";
                    }).length;

                    var iApproved = aTasks.filter(function (oItem) {
                        return oItem.status === "Approved";
                    }).length;

                    var iRejected = aTasks.filter(function (oItem) {
                        return oItem.status === "Rejected";
                    }).length;

                    var oApprovalModel = this.getView().getModel("approval");

                    oApprovalModel.setProperty("/tasks", aTasks);

                    oApprovalModel.setProperty("/pendingCount", iPending);

                    oApprovalModel.setProperty("/approvedCount", iApproved);

                    oApprovalModel.setProperty("/rejectedCount", iRejected);

                    console.log("Pending Count:", iPending);
                    console.log("Approved Count:", iApproved);
                    console.log("Rejected Count:", iRejected);

                } catch (oError) {

                    console.error(
                        oError
                    );

                }

            },

            formatDate: function (sDate) {

                if (!sDate) {
                    return "";
                }

                var oDate = new Date(sDate);

                var sYear = oDate.getFullYear();
                var sMonth = String(oDate.getMonth() + 1).padStart(2, "0");
                var sDay = String(oDate.getDate()).padStart(2, "0");

                return sYear + "/" + sMonth + "/" + sDay;
            },

            onFilter: function (oEvent) {

                var sKey = oEvent.getParameter("item").getKey();

                var oList = this.byId("taskList");
                var oBinding = oList.getBinding("items");

                if (!oBinding) {
                    return;
                }

                var oFilter = new Filter("status", FilterOperator.EQ, sKey);

                oBinding.filter([oFilter]);

            },

            onTaskSelect: function (oEvent) {

                var oData = oEvent.getParameter("listItem").getBindingContext("approval").getObject();

                // TITLE

                var oTitle = this.byId("txtTitle");

                if (oTitle) {

                    oTitle.setText(oData.title || "");

                }

                // DESCRIPTION

                var oDescription = this.byId("txtDescription");

                if (oDescription) {

                    oDescription.setText(oData.description || "");

                }

                // STUDENT NAME

                var oStudentName = this.byId("selectedStudentName");

                if (oStudentName) {

                    oStudentName.setText(oData.studentName || "");

                }

                // REQUEST TYPE

                var oRequestType = this.byId("selectedRequestType");

                if (oRequestType) {

                    oRequestType.setText(oData.type || "");

                }

                // CREATED ON

                var oCreatedOn = this.byId("selectedCreatedOn");

                if (
                    oCreatedOn && oData.createdAt
                ) {

                    oCreatedOn.setText(

                        new Date(oData.createdAt
                        ).toLocaleDateString(
                            "en-IN"
                        )

                    );

                }

                // STATUS

                var oStatus = this.byId("selectedStatus");

                if (oStatus) {

                    var sStatus = (oData.status || "").trim().toLowerCase(); oStatus.setText(oData.status || "");

                    if (sStatus === "approved"
                    ) {
                        oStatus.setState(
                            "Success"
                        );

                    } else if (
                        sStatus ===
                        "rejected"
                    ) {

                        oStatus.setState(
                            "Error"
                        );

                    } else {

                        oStatus.setState(
                            "Warning"
                        );

                    }

                }

                // LEAVE DATES

                var oLeaveDateSection = this.byId("leaveDateSection");

                if (oData.type === "Leave") {

                    oLeaveDateSection.setVisible(true);

                    this.byId("txtfromDate").setText(oData.fromDate
                        ? new Date(
                            oData.fromDate
                        ).toLocaleDateString("en-IN")
                        : ""
                    );

                    this.byId("txttoDate").setText(
                        oData.toDate
                            ? new Date(
                                oData.toDate
                            ).toLocaleDateString("en-IN")
                            : ""
                    );

                } else {

                    oLeaveDateSection.setVisible(false);

                    this.byId("txtfromDate").setText("");
                    this.byId("txttoDate").setText("");

                }
                // BONAFIDE DETAILS

                var oBonafideSection = this.byId("bonafideSection");

                if ((oData.type || "").toLowerCase().includes("bonafide")) {

                    oBonafideSection.setVisible(true);

                    var oModel = this.getOwnerComponent().getModel();

                    var oUserBinding = oModel.bindList("/Users",
                        undefined,
                        undefined,
                        [
                            new Filter(
                                "email",
                                FilterOperator.EQ,
                                oData.studentEmail
                            )
                        ]
                    );


                    oUserBinding.requestContexts().then(function (aUserContexts) {

                        if (aUserContexts.length > 0) {

                            var oUser = aUserContexts[0].getObject();

                            this.byId("txtEmail").setText(oUser.email || "");
                            this.byId("txtName").setText(oUser.name || "");
                            this.byId("txtMobileNumber").setText(oUser.mobileNumber || "");
                            this.byId("txtDateOfBirth").setText(oUser.dateOfBirth || "");
                            this.byId("txtAddress").setText(oUser.address || "");
                            this.byId("txtDepartment").setText(oUser.department || "");
                            this.byId("txtGuardianName").setText(oUser.guardianName || "");
                            this.byId("txtGuardianNumber").setText(oUser.guardianNumber || "");

                        }

                    }.bind(this));

                } else {

                    oBonafideSection.setVisible(false);

                    this.byId("txtEmail").setText("");
                    this.byId("txtName").setText("");
                    this.byId("txtMobileNumber").setText("");
                    this.byId("txtDateOfBirth").setText("");
                    this.byId("txtAddress").setText("");
                    this.byId("txtDepartment").setText("");
                    this.byId("txtGuardianName").setText("");
                    this.byId("txtGuardianNumber").setText("");

                }

                this._selectedTask = oData;

            },

            onSearch: function (oEvent) {

                var sValue = oEvent.getParameter("newValue");

                var oBinding = this.byId("taskList").getBinding("items");

                if (!sValue) {

                    oBinding.filter([]);

                    return;

                }

                oBinding.filter([

                    new Filter(
                        "title",
                        FilterOperator.Contains,
                        sValue
                    )

                ]);

            },

            onApprove: async function () {

                if (!this._selectedTask) {
                    MessageToast.show("Please select a request");
                    return;
                }

                try {

                    const oModel = this.getOwnerComponent().getModel();

                    const sAction = this._selectedTask.type === "Leave"
                        ? "/approveLeave(...)"
                        : "/approveBonafide(...)";

                    const oAction = oModel.bindContext(sAction);

                    oAction.setParameter("ID", this._selectedTask.ID);

                    await oAction.execute();

                    MessageToast.show("Approved Successfully");

                    await this._loadTasks();

                    this.byId("txtRemarks").setValue("");
                    this.byId("taskList").removeSelections(true);

                    this._selectedTask = null;

                } catch (oError) {

                    console.error("Approve Error :", oError);

                    MessageToast.show("Approval Failed");

                }

            },

            onReject: async function () {

                if (!this._selectedTask) {
                    MessageToast.show("Please select a request");
                    return;
                }

                const sRemarks = this.byId("txtRemarks").getValue().trim();

                if (!sRemarks) {
                    MessageToast.show("Please enter remarks before rejecting");
                    return;
                }

                try {

                    const oModel = this.getOwnerComponent().getModel();

                    const sAction = this._selectedTask.type === "Leave"
                        ? "/rejectLeave(...)"
                        : "/rejectBonafide(...)";

                    const oAction = oModel.bindContext(sAction);

                    oAction.setParameter("ID", this._selectedTask.ID);
                    oAction.setParameter("comment", sRemarks);

                    await oAction.execute();

                    MessageToast.show("Rejected Successfully");

                    this.byId("txtRemarks").setValue("");

                    await this._loadTasks();

                    this.byId("taskList").removeSelections(true);

                    this._selectedTask = null;

                } catch (oError) {

                    console.error("Reject Error :", oError);

                    MessageToast.show("Reject Failed");

                }

            },

        }

    );

});