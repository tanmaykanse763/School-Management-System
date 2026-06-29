const cds = require("@sap/cds");

module.exports = cds.service.impl(async function () {

    const { Bonafide, Users, Leaves } = this.entities;

    // ==========================
    // RESTRICT LEAVES TO LOGGED-IN USER ONLY
    // ==========================

    this.before("READ", Leaves, (req) => {

        console.log("================================");
        console.log("REQ USER :", req.user);
        console.log("================================");

        const sEmail =
            req.user?.attr?.email ||
            req.user?.id ||
            "";

        console.log("JWT Email :", sEmail);

        // Admin can see all
        if (req.user?.is("Admin")) {
            console.log("Admin Login - No Filter");
            return;
        }

        if (!sEmail) {
            console.log("Email not found");
            return;
        }

        req.query.where([
            { ref: ["studentEmail"] },
            "=",
            { val: sEmail }
        ]);

    });

    this.before("READ", Bonafide, (req) => {

        console.log("================================");
        console.log("READ Bonafide");
        console.log("REQ USER :", req.user);
        console.log("================================");

        const sEmail =
            req.user?.attr?.email ||
            req.user?.id ||
            "";

        console.log("JWT Email :", sEmail);

        if (req.user?.is("Admin")) {
            return;
        }

        if (!sEmail) {
            return;
        }

        req.query.where([
            { ref: ["studentEmail"] },
            "=",
            { val: sEmail }
        ]);

    });


    // Leave and bonafide in approval and rejected 

    this.on("approveLeave", async (req) => {

        await UPDATE(Leaves)
            .set({
                status: "Approved"
            })
            .where({
                ID: req.data.ID
            });

        return true;

    });

    this.on("rejectLeave", async (req) => {

        await UPDATE(Leaves)
            .set({
                status: "Rejected",
                comment: req.data.comment
            })
            .where({
                ID: req.data.ID
            });

        return true;

    });

    this.on("approveBonafide", async (req) => {

        await UPDATE(Bonafide)
            .set({
                status: "Approved"
            })
            .where({
                ID: req.data.ID
            });

        return true;

    });

    this.on("rejectBonafide", async (req) => {

        await UPDATE(Bonafide)
            .set({
                status: "Rejected",
                comment: req.data.comment
            })
            .where({
                ID: req.data.ID
            });

        return true;

    });

    // ==========================
    // GET LOGGED-IN USER INFO
    // ==========================

    this.on("getUserInfo", async (req) => {

        const sToken = req.headers.authorization || "";

        const sEmail =
            req.user?.attr?.email ||
            req.user?.id ||
            "";

        console.log("================================");
        console.log("Logged In Email :", sEmail);

        const oUser = await SELECT.one
            .from(Users)
            .where({ email: sEmail });

        console.log("DB User :", oUser);
        console.log("================================");

        return {
            id: req.user?.id || "",
            name: oUser?.name || "",
            email: sEmail,
            mobileNumber: oUser?.mobileNumber || "",
            role:
                req.user?.is("Admin")
                    ? "Admin"
                    : req.user?.is("Student")
                        ? "Student"
                        : "",
            token: sToken
        };

    });

    // ==========================
    // BONAFIDE VALIDATIONS
    // ==========================

    this.before("CREATE", Bonafide, async (req) => {

        req.data.status = "Pending";
        req.data.comment = "";

        if (!req.data.studentName) {
            req.error(400, "Student Name is Required");
        }
        if (!req.data.studentEmail) {
            req.error(400, "Student Email is Required");
        }
        if (!req.data.studentEmail.includes("@")) {
            req.error(400, "Enter Valid Email");
        }
        if (!req.data.purpose || req.data.purpose.length < 5) {
            req.error(400, "Purpose Minimum 5 Characters Required");
        }
        if (!req.data.noOfCopies) {
            req.data.noOfCopies = 1;
        }

    });

});