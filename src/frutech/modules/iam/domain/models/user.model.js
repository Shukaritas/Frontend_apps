/**
 * @class User
 * @description Entidad que representa al usuario en el contexto de autenticación.
 */
export class User {
    constructor({ id, username, email, password, phoneNumber, identificator, roleId }) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.phoneNumber = phoneNumber;
        this.identificator = identificator;
        this.roleId = roleId;
        this.validate();
    }

    validate() {
        if (!this.email || !this.email.includes('@')) {
            throw new Error('El email no es válido.');
        }
        if (!this.password || this.password.length < 6) {
            throw new Error('La contraseña debe tener al menos 6 caracteres.');
        }

        if (!/^\d{8}$/.test(this.identificator)) {
            throw new Error('El DNI debe tener exactamente 8 números.');
        }

        if (!/^\+\d+/.test(this.phoneNumber)) {
            throw new Error('El teléfono debe incluir el código de país con "+" (ej. +51999999999).');
        }
    }
}