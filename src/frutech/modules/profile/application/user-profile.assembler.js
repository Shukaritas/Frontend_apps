/**
 * @class UserProfileAssembler
 * @classdesc Handles the conversion (assembly) between the UserProfile domain entity and its DTO.
 * @author Estefano Solis
 */
export class UserProfileAssembler {
    /**
     * Converts a UserProfile entity to a plain DTO.
     * @param {import('../domain/models/user-profile.model').UserProfile} userProfileEntity - The domain entity.
     * @returns {import('./user-profile.dto').UserProfileDTO} The resulting DTO.
     */
    toDTO(userProfileEntity) {
        return {
            id: userProfileEntity.id,
            name: userProfileEntity.name,
            email: userProfileEntity.email,
            phoneNumber: userProfileEntity.phoneNumber,
            identificator: userProfileEntity.identificator,
            roleId: userProfileEntity.roleId || 0,
        };
    }
}