using { school as db } from '../db/schema';

@path:'/school'
service SchoolService {

    entity Leaves   as projection on db.Leaves;
    entity Bonafide as projection on db.Bonafide;
    entity Users    as projection on db.Users;

entity UserInfo {
    key id         : String;
    name           : String;
    email          : String;
    role           : String;
    token          : String;
};

function getUserInfo() returns UserInfo;


action approveLeave(ID : UUID);

    action rejectLeave(
        ID      : UUID,
        comment : String
    );

    action approveBonafide(ID : UUID);

    action rejectBonafide(
        ID      : UUID,
        comment : String
    );


}