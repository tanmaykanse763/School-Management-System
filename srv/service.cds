using school from '../db/schema';


@requires: 'authenticated-user'
service SchoolService {

    entity Leaves  as projection on school.Leaves;
    entity Bonafide as projection on school.Bonafide;
    entity Users as projection on school.Users;

}
