import http from '@/services/http-common'; // Asumiendo que tienes configurado axios aquí
import { User } from '../domain/models/user.model';

export class AuthApiRepository {

    /**
     * Busca un usuario por email y contraseña.
     */
    async login(email, password) {
        // json-server permite filtrar por query params
        const response = await http.get(`/user?email=${email}&password=${password}`);

        if (response.data.length === 0) {
            throw new Error('Credenciales inválidas o usuario no encontrado.');
        }

        const userData = response.data[0];
        return new User({
            id: userData.id,
            username: userData.user_name,
            email: userData.email,
            password: userData.password,
            phoneNumber: userData.phone_number,
            identificator: userData.identificator
        });
    }

    /**
     * Registra un nuevo usuario.
     */
    async register(user) {
        // Verificamos si el email ya existe
        const check = await http.get(`/user?email=${user.email}`);
        if (check.data.length > 0) {
            throw new Error('El correo electrónico ya está registrado.');
        }

        // Mapeo al formato del db.json
        const payload = {
            user_name: user.username,
            email: user.email,
            password: user.password,
            phone_number: user.phoneNumber,
            identificator: user.identificator
        };

        const response = await http.post('/user', payload);
        return response.data;
    }
}