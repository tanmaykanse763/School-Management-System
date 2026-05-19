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

    key ID : UUID;
    
    name : String(100);
    email : String(100);
    phone : String(20);

    department : String(100);
    class : String(20);
    rollNo : Integer;
    role  : String(20);
    createdAt : DateTime;

}

