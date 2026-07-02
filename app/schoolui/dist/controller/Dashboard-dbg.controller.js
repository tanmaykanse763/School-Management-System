sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "sap/ui/model/odata/v4/ODataModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (
    Controller,
    JSONModel,
    Fragment,
    MessageToast,
    ODataModel,
    Filter,
    FilterOperator
) {
    "use strict";

    return Controller.extend(
        "schoolui.controller.Dashboard",
        {


            onInit: async function () {

                // Wait until Component.js finishes loading JWT data
                while (!this.getOwnerComponent().loggedInUser) {
                    await new Promise(function (resolve) {
                        setTimeout(resolve, 200);
                    });
                }

                console.log(
                    "Dashboard Started For :",
                    this.getOwnerComponent().loggedInUser
                );

                await this._loadDashboardData();

                this._refreshGreeting();

                setInterval(function () {

                    this._refreshGreeting();

                }.bind(this), 60000);

            },


            // LOAD DASHBOARD DATA


            _loadDashboardData: async function () {


                // ODATA MODEL
                var oModel =
                    this.getOwnerComponent()
                        .getModel();



                // FOR FLP LOGIN
                // var oUser =
                //     sap.ushell.Container
                //         .getService("UserInfo")
                //         .getUser();

                // var sEmail =
                //     oUser.getEmail();


                var sEmail = this.getOwnerComponent().loggedInUser;

                if (!sEmail) {
                    console.error("Logged user email not available.");
                    return;
                }
                await oModel.getMetaModel().requestObject("/");

                console.log(
                    "Login Email:",
                    sEmail
                );


                // User entity binding

                var oUserFilter =
                    new Filter(
                        "email",
                        FilterOperator.EQ,
                        sEmail
                    );

                var oUserBinding =
                    oModel.bindList(
                        "/Users",
                        null,
                        null,
                        [oUserFilter]
                    );

                var aUserContexts =
                    await oUserBinding
                        .requestContexts();

                if (aUserContexts.length > 0) {

                    var oUserData =
                        aUserContexts[0].getObject();


                    console.log("User Found In Database");
                    console.log(oUserData);

                    this._loggedInUserName =
                        oUserData.name;

                    this._refreshGreeting();

                } else {

                    console.error("User not found in Users table");
                    console.error("Login Email :", sEmail);

                }


                // APPROVED LEAVES COUNT

                var oApprovedLeaveBinding =
                    oModel.bindList(
                        "/Leaves",
                        null,
                        null,
                        new Filter({
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
                        })
                    );

                var iTotalLeaves =
                    (
                        await oApprovedLeaveBinding
                            .requestContexts()
                    ).length;

                console.log(
                    "Approved Leaves:",
                    iTotalLeaves
                );



                // APPROVED BONAFIDE COUNT


                var oApprovedBonafideBinding =
                    oModel.bindList(
                        "/Bonafide",
                        null,
                        null,
                        new Filter({
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
                        })
                    );

                var iBonafideIssued =
                    (
                        await oApprovedBonafideBinding
                            .requestContexts()
                    ).length;

                console.log(
                    "Approved Bonafide:",
                    iBonafideIssued
                );



                // PENDING LEAVES COUNT


                var oPendingLeaveBinding =
                    oModel.bindList(
                        "/Leaves",
                        null,
                        null,
                        new Filter({
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
                        })
                    );

                var iPendingLeaves =
                    (
                        await oPendingLeaveBinding
                            .requestContexts()
                    ).length;

                console.log(
                    "Pending Leaves:",
                    iPendingLeaves
                );



                // PENDING BONAFIDE COUNT


                var oPendingBonafideBinding =
                    oModel.bindList(
                        "/Bonafide",
                        null,
                        null,
                        new Filter({
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
                        })
                    );

                var iPendingBonafide =
                    (
                        await oPendingBonafideBinding
                            .requestContexts()
                    ).length;

                console.log(
                    "Pending Bonafide:",
                    iPendingBonafide
                );



                // FINAL PENDING COUNT


                var iPending =
                    iPendingLeaves +
                    iPendingBonafide;

                console.log(
                    "Final Pending:",
                    iPending
                );



                // REJECTED LEAVES COUNT


                var oRejectedLeaveBinding =
                    oModel.bindList(
                        "/Leaves",
                        null,
                        null,
                        new Filter({
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
                        })
                    );

                var iRejectedLeaves =
                    (
                        await oRejectedLeaveBinding
                            .requestContexts()
                    ).length;

                console.log(
                    "Rejected Leaves:",
                    iRejectedLeaves
                );



                // REJECTED BONAFIDE COUNT


                var oRejectedBonafideBinding =
                    oModel.bindList(
                        "/Bonafide",
                        null,
                        null,
                        new Filter({
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
                        })
                    );

                var iRejectedBonafide =
                    (
                        await oRejectedBonafideBinding
                            .requestContexts()
                    ).length;

                console.log(
                    "Rejected Bonafide:",
                    iRejectedBonafide
                );



                // FINAL REJECTED COUNT


                var iRejected =
                    iRejectedLeaves +
                    iRejectedBonafide;

                console.log(
                    "Final Rejected:",
                    iRejected
                );



                // UPDATE UI


                this.byId(
                    "txtTotalLeaves"
                ).setText(
                    iTotalLeaves.toString()
                );

                this.byId(
                    "txtBonafideIssued"
                ).setText(
                    iBonafideIssued.toString()
                );

                this.byId(
                    "txtPending"
                ).setText(
                    iPending.toString()
                );

                this.byId(
                    "txtRejected"
                ).setText(
                    iRejected.toString()
                );

                // RECENT ACTIVITY


                var aActivities = [];

                var oToday = new Date();
                var oSevenDaysAgo = new Date();

                oSevenDaysAgo.setDate(oToday.getDate() - 7);

                // LEAVE ACTIVITIES
                var oLeaveBinding = oModel.bindList("/Leaves");
                var aLeaveContexts = await oLeaveBinding.requestContexts();
                aLeaveContexts.forEach(function (oContext) {
                    var oData = oContext.getObject();
                    if (oData.studentEmail && oData.studentEmail.toLowerCase() === sEmail.toLowerCase()) {
                        var sAppliedOn = oData.appliedOn;
                        if (sAppliedOn) {
                            var oActivityDate = new Date(sAppliedOn);
                            if (oActivityDate >= oSevenDaysAgo) {
                                aActivities.push({
                                    title:
                                        oData.status === "Approved" ? "Leave Approved" : oData.status === "Rejected" ? "Leave Rejected"
                                            : "Leave Applied",
                                    email:
                                        oData.studentEmail,
                                    createdAt:
                                        sAppliedOn
                                });
                            }
                        }
                    }
                });



                // BONAFIDE ACTIVITIES


                var oBonafideBinding =
                    oModel.bindList("/Bonafide");

                var aBonafideContexts =
                    await oBonafideBinding.requestContexts();

                aBonafideContexts.forEach(function (oContext) {

                    var oData =
                        oContext.getObject();

                    var sCreatedAt =
                        oData.createdAt ||
                        oData.CreatedAt;

                    if (
                        oData.studentEmail &&
                        oData.studentEmail.toLowerCase() ===
                        sEmail.toLowerCase()
                    ) {

                        if (sCreatedAt) {

                            var oActivityDate =
                                new Date(
                                    sCreatedAt
                                );

                            if (
                                oActivityDate >=
                                oSevenDaysAgo
                            ) {

                                aActivities.push({

                                    title:
                                        oData.status === "Approved"
                                            ? "Bonafide Approved"
                                            : oData.status === "Rejected"
                                                ? "Bonafide Rejected"
                                                : "Bonafide Requested",

                                    email:
                                        oData.studentEmail,

                                    createdAt:
                                        sCreatedAt

                                });

                            }

                        }

                    }

                });



                // SORT LATEST FIRST

                aActivities.sort(function (
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

                // ACTIVITY MODEL


                var oActivityModel =
                    new JSONModel({

                        activities:
                            aActivities

                    });

                this.getView().setModel(
                    oActivityModel,
                    "activityModel"
                );

                console.log(
                    "Recent Activities:",
                    aActivities
                );

                // LEAVE BALANCE


                var iMedicalUsed = 0;
                var iSickUsed = 0;
                var iCasualUsed = 0;
                var iEmergencyUsed = 0;

                aLeaveContexts.forEach(function (oContext) {

                    var oData =
                        oContext.getObject();

                    // ONLY LOGGED USER

                    if (
                        oData.studentEmail === sEmail
                    ) {

                        switch (
                        oData.leaveType
                        ) {

                            case "Medical Leave":

                                iMedicalUsed++;

                                break;

                            case "Sick Leave":

                                iSickUsed++;

                                break;

                            case "Casual Leave":

                                iCasualUsed++;

                                break;

                            case "Emergency Leave":

                                iEmergencyUsed++;

                                break;

                        }

                    }

                });

                // BALANCE

                var iMedicalBalance =
                    15 - iMedicalUsed;

                var iSickBalance =
                    10 - iSickUsed;

                var iCasualBalance =
                    10 - iCasualUsed;

                var iEmergencyBalance =
                    5 - iEmergencyUsed;

                // TEXT UPDATE

                this.byId(
                    "txtMedicalLeave"
                ).setText(
                    iMedicalBalance +
                    " / 15 days"
                );

                this.byId(
                    "txtSickLeave"
                ).setText(
                    iSickBalance +
                    " / 10 days"
                );

                this.byId(
                    "txtCasualLeave"
                ).setText(
                    iCasualBalance +
                    " / 10 days"
                );

                this.byId(
                    "txtEmergencyLeave"
                ).setText(
                    iEmergencyBalance +
                    " / 5 days"
                );

                // PROGRESS BAR UPDATE

                this.byId(
                    "piMedicalLeave"
                ).setPercentValue(
                    (iMedicalBalance / 15) * 100
                );

                this.byId(
                    "piSickLeave"
                ).setPercentValue(
                    (iSickBalance / 10) * 100
                );

                this.byId(
                    "piCasualLeave"
                ).setPercentValue(
                    (iCasualBalance / 10) * 100
                );

                this.byId(
                    "piEmergencyLeave"
                ).setPercentValue(
                    (iEmergencyBalance / 5) * 100
                );

                // ROUTER

                var oRouter =
                    this.getOwnerComponent()
                        .getRouter();

                oRouter.getRoute("Dashboard")
                    .attachPatternMatched(
                        this._onRouteMatched,
                        this
                    );


            },
            _refreshGreeting: function () {

                var iHour = new Date().getHours();

                var sGreeting = "";

                if (iHour >= 5 && iHour < 12) {

                    sGreeting = "𝑮𝒐𝒐𝒅 𝑴𝒐𝒓𝒏𝒊𝒏𝒈 🌅";

                } else if (iHour >= 12 && iHour < 16) {

                    sGreeting = "𝑮𝒐𝒐𝒅 𝑨𝒇𝒕𝒆𝒓𝒏𝒐𝒐𝒏 ☀️";

                } else if (iHour >= 16 && iHour < 21) {

                    sGreeting = "𝑮𝒐𝒐𝒅 𝑬𝒗𝒆𝒏𝒊𝒏𝒈 🌙";

                } else {

                    sGreeting = "𝑮𝒐𝒐𝒅 𝑵𝒊𝒈𝒉𝒕 🌃";

                }

                var sName = this._loggedInUserName || "User";

                var sDate = new Date().toLocaleDateString(
                    "en-IN",
                    {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                    }
                );

                this.byId("txtGreeting").setText(
                    sGreeting + ", " + sName + " ✨"
                );

                this.byId("txtSubGreeting").setText(
                    "📅 " + sDate
                );

            },

            _onRouteMatched: function () {

                console.log("Dashboard Loaded");
                this._refreshGreeting();

            },

            formatTimeAgo: function (sDate) {

                if (!sDate) {
                    return "";
                }

                var oDate =
                    new Date(sDate);

                var iDiff =
                    Date.now() -
                    oDate.getTime();

                var iMinutes =
                    Math.floor(
                        iDiff / (1000 * 60)
                    );

                var iHours =
                    Math.floor(
                        iDiff / (1000 * 60 * 60)
                    );

                var iDays =
                    Math.floor(
                        iDiff / (1000 * 60 * 60 * 24)
                    );

                if (iMinutes < 1) {
                    return "Just now";
                }

                if (iMinutes < 60) {
                    return iMinutes + "m ago";
                }

                if (iHours < 24) {
                    return iHours + "h ago";
                }

                if (iDays < 7) {
                    return iDays + "d ago";
                }

                var iWeeks =
                    Math.floor(iDays / 7);

                if (iWeeks < 5) {
                    return iWeeks + "w ago";
                }

                var iMonths =
                    Math.floor(iDays / 30);

                return iMonths + "mo ago";

            },




            onAfterRendering: function () {

                this._refreshGreeting();

            },


            onOpenLeaveRequest: async function () {

                var oView =
                    this.getView();

                // LOAD ONLY ONCE
                if (!this._oLeaveDialog) {

                    this._oLeaveDialog =
                        await Fragment.load({

                            id:
                                oView.getId(),

                            name:
                                "schoolui.view.fragments.LeaveRequestDialog",

                            controller:
                                this

                        });

                    // ADD DEPENDENT
                    oView.addDependent(
                        this._oLeaveDialog
                    );

                }

                // OPEN DIALOG
                this._oLeaveDialog.open();

            },

            onCancelLeaveDialog: function () {

                if (this._oLeaveDialog) {

                    this._oLeaveDialog.close();

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
                    MessageToast.show(
                        "Please fill all required fields"
                    );
                    return;
                }

                // EMAIL VALIDATION
                if (!sStudentEmail.includes("@gmail.com")) {
                    MessageToast.show("Enter valid Gmail Address");
                    return;
                }

                // REASON VALIDATION
                if (sReason.length < 5) {
                    MessageToast.show(
                        "Reason minimum 5 characters required"
                    );
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
                MessageToast.show(
                    "Leave Request Submitted Successfully"
                );

                // RESET FIELDS
                oStudentName.setValue("");
                oStudentEmail.setValue("");
                oDepartment.setSelectedKey("");
                oLeaveType.setSelectedKey("");
                oFromDate.setValue("");
                oToDate.setValue("");
                oReason.setValue("");

                if (this._oLeaveDialog) {
                    this._oLeaveDialog.close();
                }

            },

            // OPEN BONAFIDE DIALOG
            onOpenBonafideDialog: function () {

                var oView = this.getView();

                // LOAD ONCE
                if (!this._pBonafideDialog) {

                    this._pBonafideDialog =
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

                // OPEN
                this._pBonafideDialog.then(function (oDialog) {
                    oDialog.open();
                });

            },

            // CANCEL BONAFIDE DIALOG
            onCancelDialog: function () {

                this._pBonafideDialog.then(function (oDialog) {
                    oDialog.close();
                });

            },

            // SUBMIT BONAFIDE REQUEST
            onSubmitRequest: function () {

                // GET CONTROLS
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

                // VALUES
                var sPurpose = oPurpose.getSelectedKey();
                var sIssuedTo = oIssuedTo.getValue();
                var sStudentEmail = oStudentEmail.getValue();
                var sDepartment = oDepartment.getSelectedKey();
                var sRemarks = oRemarks.getValue();
                var iCopies = parseInt(oCopies.getSelectedKey());

                // VALIDATION
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

                // EMAIL VALIDATION
                if (!sStudentEmail.includes("@")) {
                    MessageToast.show("Enter valid email");
                    return;
                }

                // MODEL
                var oModel = this.getView().getModel();

                // PAYLOAD
                var oPayload = {
                    studentName: sIssuedTo,
                    studentEmail: sStudentEmail,
                    department: sDepartment,
                    purpose: sPurpose,
                    noOfCopies: iCopies,
                    comment: sRemarks
                };

                // ODATA V4 CREATE
                var oBinding = oModel.bindList("/Bonafide");
                oBinding.create(oPayload);

                // SUCCESS MESSAGE
                MessageToast.show(
                    "Bonafide Request Submitted Successfully"
                );

                // RESET FIELDS
                oPurpose.setSelectedKey("--Select--");
                oIssuedTo.setValue("");
                oStudentEmail.setValue("");
                oDepartment.setSelectedKey("--Select--");
                oRemarks.setValue("");
                oCopies.setSelectedKey("1");

                // CLOSE DIALOG
                this._pBonafideDialog.then(function (oDialog) {
                    oDialog.close();
                });

            },

            // ONLY LETTERS ALLOWED
            onNameLiveChange: function (oEvent) {

                var sValue = oEvent.getParameter("value");

                // REMOVE DIGITS & SPECIAL CHARACTERS
                sValue = sValue.replace(/[^a-zA-Z ]/g, "");
                oEvent.getSource().setValue(sValue);

            },

            // ONLY GMAIL VALIDATION
            onEmailLiveChange: function (oEvent) {

                var oInput = oEvent.getSource();
                var sValue = oInput.getValue();

                // CHECK GMAIL FORMAT
                var gmailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

                if (sValue === "" || gmailPattern.test(sValue)) {
                    oInput.setValueState("None");
                } else {
                    oInput.setValueState("Error");
                    oInput.setValueStateText("Enter valid Email address");
                }

            },

            // NAVIGATE TO LEAVE HISTORY
            onViewLeaveHistory: function () {

                this.getOwnerComponent()
                    .getRouter()
                    .navTo("LeaveRequests");

            },

            // NAVIGATE TO CERTIFICATES
            onViewRequest: function () {

                this.getOwnerComponent()
                    .getRouter()
                    .navTo("BonafideCert");

            }

        }
    );

});