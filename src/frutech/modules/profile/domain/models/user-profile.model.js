
function validateUserProfile({ id, name, email, phoneNumber, identificator, password }) {
    if (typeof id !== 'number') throw new Error('ID must be a number.');
    if (typeof name !== 'string' || name.length < 3) throw new Error('Name must be at least 3 characters long.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Invalid email format.');


    if (!/^(\+\d+|\d{9})$/.test(phoneNumber)) {
        throw new Error('Phone number must start with + (international) or be 9 digits.');
    }

    if (!/^\d{8}$/.test(identificator)) throw new Error('Document must have 8 digits.');
    if (typeof password !== 'string' || password.length === 0) throw new Error('Password is required.');
}


export class UserProfile {

    constructor({ id, name, email, phoneNumber, identificator, password }) {
        validateUserProfile({ id, name, email, phoneNumber, identificator, password });
        this.id = id;
        this.name = name;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.identificator = identificator;
        this.password = password;
    }


    updateInformation(newName, newPhoneNumber, newIdentificator) {
        validateUserProfile({
            id: this.id,
            email: this.email,
            password: this.password,
            name: newName,
            phoneNumber: newPhoneNumber,
            identificator: newIdentificator
        });
        this.name = newName;
        this.phoneNumber = newPhoneNumber;
        this.identificator = newIdentificator;
    }
}