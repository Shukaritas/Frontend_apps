/**
 * Validates the fields of a user profile object.
 * @author Estefano Solis
 * @param {object} profileData - The profile data to validate.
 * @param {number} profileData.id - The user's ID.
 * @param {string} profileData.name - The user's name.
 * @param {string} profileData.email - The user's email.
 * @param {string} profileData.phoneNumber - The user's phone number.
 * @param {string} profileData.identificator - The user's identity document.
 * @param {string} profileData.password - The user's password.
 * @param {number} [profileData.roleId] - The user's role ID (optional).
 * @throws {Error} If any validation fails.
 */
function validateUserProfile({ id, name, email, phoneNumber, identificator, password, roleId }) {
    if (typeof id !== 'number') throw new Error('ID must be a number.');
    if (typeof name !== 'string' || name.length < 3) throw new Error('Name must be at least 3 characters long.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Invalid email format.');

    if (!/^(\+\d+|\d{9})$/.test(phoneNumber)) {
        throw new Error('Phone number must start with + (international) or be 9 digits.');
    }

    if (!/^\d{8}$/.test(identificator)) throw new Error('Document must have 8 digits.');
    if (typeof password !== 'string' || password.length === 0) throw new Error('Password is required.');
    if (roleId !== undefined && typeof roleId !== 'number') throw new Error('Role ID must be a number.');
}

/**
 * @class UserProfile
 * @classdesc Entity representing a user profile in the domain.
 * @author Estefano Solis
 */
export class UserProfile {
    /**
     * Creates an instance of UserProfile.
     * @param {object} profileData - The data to create the profile.
     * @param {number} profileData.id - The user's ID.
     * @param {string} profileData.name - The user's name.
     * @param {string} profileData.email - The user's email.
     * @param {string} profileData.phoneNumber - The user's phone number.
     * @param {string} profileData.identificator - The user's identity document.
     * @param {string} profileData.password - The user's password.
     * @param {number} [profileData.roleId] - The user's role ID (optional).
     */
    constructor({ id, name, email, phoneNumber, identificator, password, roleId }) {
        validateUserProfile({ id, name, email, phoneNumber, identificator, password, roleId });
        this.id = id;
        this.name = name;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.identificator = identificator;
        this.password = password;
        this.roleId = roleId || 0;
    }

    /**
     * Updates the personal information of the entity.
     * @param {string} newName - The new name.
     * @param {string} newPhoneNumber - The new phone number.
     * @param {string} newIdentificator - The new identity document.
     */
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