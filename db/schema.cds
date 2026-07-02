using { managed } from '@sap/cds/common';

namespace school;

entity Leaves {

    key ID : UUID;
    studentName   : String(100);
    studentEmail  : String(100);
    department    : String(100);
    leaveType     : String(100);
    fromDate      : Date;
    toDate        : Date;
    reason        : String(255);
    status        : String(20) default 'Pending';
    appliedOn     : DateTime;
    comment       : String(500);

}

entity Bonafide : managed {

    key ID            : UUID;
    studentName       : String(100);
    studentEmail      : String(100);
    department        : String(100);
    purpose           : String(255);
    noOfCopies        : Integer default 1;
    remark            : String(500);
    status            : String(20) default 'Pending';
    comment           : String(500);

}
entity Users {

    key email         : String(100);
    name              : String(100);
    firstName         : String(100);
    lastName          : String(100);
    mobileNumber      : String(20);
    dateOfBirth       : Date;
    address           : String(100);
    department        : String(100);
    guardianName      : String(100);
    guardianNumber    : String(20);
    role              : String(100);

}