module.exports.employee = function(fname, lname, dob, email, password){
    this.fname = fname;
    this.lname = lname;
    this.dob = dob;
    this.email = email;
    this.password = password;

    this.fullname = function(){
        return this.fname + " " + lname;
    }

    this.birthDate = function (){ return this.dob}
}