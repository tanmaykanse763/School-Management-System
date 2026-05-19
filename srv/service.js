const cds = require('@sap/cds');

module.exports = cds.service.impl(async function () {

    const { Bonafide } = this.entities;

    // BEFORE CREATE EVENT

    this.before("CREATE", Bonafide, async (req) => {

       

        req.data.status = "Pending";


        req.data.comment = "";


        if (!req.data.studentName) {

            req.error(
                400,
                "Student Name is Required"
            );

        }

        if (!req.data.studentEmail) {

            req.error(
                400,
                "Student Email is Required"
            );

        }

        if (
            !req.data.studentEmail.includes("@")
        ) {

            req.error(
                400,
                "Enter Valid Email"
            );

        }

        if (
            !req.data.purpose ||
            req.data.purpose.length < 5
        ) {

            req.error(
                400,
                "Purpose Minimum 5 Characters Required"
            );

        }

        if (!req.data.noOfCopies) {

            req.data.noOfCopies = 1;

        }

    });

});