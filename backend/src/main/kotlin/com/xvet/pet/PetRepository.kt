package com.xvet.pet

import com.xvet.jooq.tables.references.PETS
import org.jooq.DSLContext
import org.springframework.stereotype.Repository
import com.xvet.jooq.enums.PetSpecies as JooqPetSpecies

@Repository
class PetRepository(
    private val dsl: DSLContext,
) {
    fun save(pet: PetEntity): PetEntity {
        val record =
            dsl
                .insertInto(PETS)
                .set(PETS.OWNER_ID, pet.ownerId)
                .set(PETS.NAME, pet.name)
                .set(PETS.SPECIES, JooqPetSpecies.valueOf(pet.species.name))
                .set(PETS.BREED, pet.breed)
                .set(PETS.BIRTH_DATE, pet.birthDate)
                .set(PETS.WEIGHT, pet.weight)
                .returning()
                .fetchOne()!!

        return record.toEntity()
    }

    fun findByOwnerId(ownerId: Long): List<PetEntity> =
        dsl
            .selectFrom(PETS)
            .where(PETS.OWNER_ID.eq(ownerId))
            .orderBy(PETS.CREATED_AT.desc())
            .fetch()
            .map { it.toEntity() }

    fun findById(id: Long): PetEntity? =
        dsl
            .selectFrom(PETS)
            .where(PETS.ID.eq(id))
            .fetchOne()
            ?.toEntity()

    fun update(pet: PetEntity): PetEntity {
        dsl
            .update(PETS)
            .set(PETS.NAME, pet.name)
            .set(PETS.SPECIES, JooqPetSpecies.valueOf(pet.species.name))
            .set(PETS.BREED, pet.breed)
            .set(PETS.BIRTH_DATE, pet.birthDate)
            .set(PETS.WEIGHT, pet.weight)
            .set(PETS.UPDATED_AT, java.time.LocalDateTime.now())
            .where(PETS.ID.eq(pet.id))
            .execute()

        return findById(pet.id)!!
    }

    fun deleteById(id: Long) {
        dsl
            .deleteFrom(PETS)
            .where(PETS.ID.eq(id))
            .execute()
    }

    private fun org.jooq.Record.toEntity() =
        PetEntity(
            id = get(PETS.ID)!!,
            ownerId = get(PETS.OWNER_ID)!!,
            name = get(PETS.NAME)!!,
            species = PetSpecies.valueOf(get(PETS.SPECIES)!!.name),
            breed = get(PETS.BREED),
            birthDate = get(PETS.BIRTH_DATE),
            weight = get(PETS.WEIGHT),
            createdAt = get(PETS.CREATED_AT)!!,
            updatedAt = get(PETS.UPDATED_AT)!!,
        )
}
