
export class UserProfileAssembler {

    toDTO(userProfileEntity) {
        return {
            id: userProfileEntity.id,
            name: userProfileEntity.name,
            email: userProfileEntity.email,
            phoneNumber: userProfileEntity.phoneNumber,
            identificator: userProfileEntity.identificator,
        };
    }
}