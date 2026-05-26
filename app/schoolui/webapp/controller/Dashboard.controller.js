sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "sap/ui/model/odata/v4/ODataModel"
], function (
    Controller,
    Fragment,
    MessageToast,
    ODataModel
) {
    "use strict";

    return Controller.extend(
        "schoolui.controller.Dashboard",
        {


            onInit: function () {

                // ODATA MODEL
                var oModel = new ODataModel({
                    serviceUrl: "/odata/v4/school/",
                    synchronizationMode: "None"
                });

                this.getView().setModel(oModel);

                // STUDENT MODEL
                var oStudentModel = new sap.ui.model.json.JSONModel({

                    greetingText: "",
                    greetingSub: "",
                    greetingBadge: "",

                    studentName: "",
                    studentEmail: "",
                    totalLeaves: 0,
                    bonafideIssued: 0,
                    pending: 0,
                    Rejected: 0
                });
                this.getView().setModel(oStudentModel, "student");

                // DEFAULT EMAIL
                var sEmail = "pratihastrajneesh0@gmail.com";

                // GET USER EMAIL FROM FLP
                if (
                    sap.ushell &&
                    sap.ushell.Container &&
                    sap.ushell.Container.getService
                ) {
                    try {
                        var oUser = sap.ushell.Container
                            .getService("UserInfo")
                            .getUser();

                        sEmail = oUser.getEmail();
                    } catch (e) {
                        console.log("UserInfo not available");
                    }
                }


                oStudentModel.setProperty("/studentEmail", sEmail);

                // USER DETAILS
                if (sEmail === "pratihastrajneesh0@gmail.com") {

                    oStudentModel.setProperty("/studentName", "Pratik Rajneesh");
                    oStudentModel.setProperty("/studentEmail", "pratihastrajneesh0@gmail.com");
                    oStudentModel.setProperty("/totalLeaves", 5);
                    oStudentModel.setProperty("/bonafideIssued", 2);
                    oStudentModel.setProperty("/pending", 1);
                    oStudentModel.setProperty("/Rejected", 0);
                }


                setTimeout(function () {
                    this._refreshGreeting();
                }.bind(this), 200);


                this.getOwnerComponent().setModel(oStudentModel, "student");


                var oRouter = this.getOwnerComponent().getRouter();

                oRouter.getRoute("Dashboard")
                    .attachPatternMatched(
                        this._onRouteMatched,
                        this
                    );
            },

            _onRouteMatched: function () {

                console.log("Dashboard Loaded");
                this._refreshGreeting();

            },


            onAfterRendering: function () {

                this._refreshGreeting();

            },


            _refreshGreeting: function () {

    var h = new Date().getHours();

    var greetWord = "";
    var sub = "";
    var badge = "";

    if (h >= 5 && h < 12) {
        greetWord = "Good Morning";
        sub = "Have a productive day ahead.";
        badge = "Morning";
    }
    else if (h >= 12 && h < 17) {
        greetWord = "Good Afternoon";
        sub = "Keep up the great work!";
        badge = "Afternoon";
    }
    else {
        greetWord = "Good Evening";
        sub = "Hope you had a wonderful day.";
        badge = "Evening";
    }

    var oStudentModel = this.getView().getModel("student");

    var sStudentName =
        oStudentModel.getProperty("/studentName") || "Student";

    var sGreeting =
        greetWord + ", " + sStudentName + "!";

    oStudentModel.setProperty("/greetingText", sGreeting);
    oStudentModel.setProperty("/greetingSub", sub);
    oStudentModel.setProperty("/greetingBadge", badge);
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

            // SUBMIT LEAVE REQUEST
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